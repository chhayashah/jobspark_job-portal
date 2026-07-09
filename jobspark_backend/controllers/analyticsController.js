const { Op, fn, col, literal } = require("sequelize");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const logger = require("../utils/logger");

// ─── Platform-wide Analytics (Admin / Overview) ──────────────────────────────
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalJobs, totalUsers, totalApplications, activeJobs] =
      await Promise.all([
        Job.count(),
        User.countDocuments(),
        Application.count(),
        Job.count({ where: { status: "active" } }),
      ]);

    const candidates = await User.countDocuments({ role: "candidate" });
    const recruiters = await User.countDocuments({ role: "recruiter" });

    // Hiring rate
    const hired = await Application.count({ where: { status: "hired" } });
    const hiringRate =
      totalApplications > 0
        ? ((hired / totalApplications) * 100).toFixed(1)
        : 0;

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        totalUsers,
        candidates,
        recruiters,
        hired,
        hiringRate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Most Applied Jobs ─────────────────────────────────────────────────────────
exports.getMostAppliedJobs = async (req, res, next) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const jobs = await Job.findAll({
      where: { createdAt: { [Op.gte]: since } },
      order: [["applicationCount", "DESC"]],
      limit: parseInt(limit),
      attributes: [
        "id",
        "title",
        "company",
        "category",
        "applicationCount",
        "viewCount",
        "jobType",
      ],
    });

    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

// ─── Skill Gap Analysis (Platform-wide) ───────────────────────────────────────
exports.getSkillGapAnalysis = async (req, res, next) => {
  try {
    // Most demanded skills (from job postings)
    const jobs = await Job.findAll({
      where: { status: "active" },
      attributes: ["skills"],
    });

    const demandMap = {};
    jobs.forEach((job) => {
      (job.skills || []).forEach((skill) => {
        demandMap[skill] = (demandMap[skill] || 0) + 1;
      });
    });

    // Most available skills (from candidate profiles)
    const candidates = await User.find({ role: "candidate" }).select(
      "candidateProfile.skills",
    );

    const supplyMap = {};
    candidates.forEach((c) => {
      (c.candidateProfile?.skills || []).forEach((skill) => {
        supplyMap[skill] = (supplyMap[skill] || 0) + 1;
      });
    });

    // Compute gap: high demand + low supply = high gap skill
    const allSkills = new Set([
      ...Object.keys(demandMap),
      ...Object.keys(supplyMap),
    ]);
    const gapAnalysis = [...allSkills]
      .map((skill) => {
        const demand = demandMap[skill] || 0;
        const supply = supplyMap[skill] || 0;
        const gapScore = supply > 0 ? demand / supply : demand;
        return {
          skill,
          demand,
          supply,
          gapScore: Math.round(gapScore * 10) / 10,
        };
      })
      .sort((a, b) => b.gapScore - a.gapScore);

    res.json({
      success: true,
      topDemandedSkills: Object.entries(demandMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([skill, count]) => ({ skill, count })),
      topSuppliedSkills: Object.entries(supplyMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([skill, count]) => ({ skill, count })),
      skillGaps: gapAnalysis.slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Recruiter Analytics ──────────────────────────────────────────────────────
exports.getRecruiterAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    const [jobs, totalApplications] = await Promise.all([
      Job.findAll({ where: { recruiterId } }),
      Application.count({
        where: {
          jobId: {
            [Op.in]: (
              await Job.findAll({ where: { recruiterId }, attributes: ["id"] })
            ).map((j) => j.id),
          },
        },
      }),
    ]);

    const jobIds = jobs.map((j) => j.id);

    // Applications by status
    const byStatus = await Application.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // Average match score
    const avgMatch = await Application.findOne({
      where: { jobId: { [Op.in]: jobIds } },
      attributes: [[fn("AVG", col("matchScore")), "avgScore"]],
      raw: true,
    });

    // Applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeline = await Application.findAll({
      where: {
        jobId: { [Op.in]: jobIds },
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [literal("DATE(createdAt)")],
      order: [[literal("DATE(createdAt)"), "ASC"]],
      raw: true,
    });

    res.json({
      success: true,
      overview: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "active").length,
        totalApplications,
        totalViews: jobs.reduce((sum, j) => sum + j.viewCount, 0),
        avgMatchScore: Math.round((avgMatch?.avgScore || 0) * 10) / 10,
      },
      applicationsByStatus: byStatus,
      applicationTimeline: timeline,
      topJobs: jobs
        .sort((a, b) => b.applicationCount - a.applicationCount)
        .slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Candidate Analytics ─────────────────────────────────────────────────────
exports.getCandidateAnalytics = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const applications = await Application.findAll({
      where: { candidateId },
      include: [{ model: Job, attributes: ["title", "company", "category"] }],
    });

    const byStatus = {};
    const matchScores = [];
    applications.forEach((app) => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
      if (app.matchScore > 0) matchScores.push(app.matchScore);
    });

    const avgMatchScore = matchScores.length
      ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
      : 0;

    const candidate = await User.findById(candidateId);
    const skills = candidate.candidateProfile?.skills || [];

    res.json({
      success: true,
      overview: {
        totalApplications: applications.length,
        avgMatchScore,
        shortlisted: byStatus.shortlisted || 0,
        interviews: byStatus.interview_scheduled || 0,
        offers: byStatus.offered || 0,
      },
      byStatus,
      applications: applications.map((a) => ({
        id: a.id,
        job: a.Job,
        status: a.status,
        matchScore: a.matchScore,
        appliedOn: a.createdAt,
      })),
      profileCompleteness: calculateProfileCompleteness(candidate),
    });
  } catch (err) {
    next(err);
  }
};

const calculateProfileCompleteness = (user) => {
  const profile = user.candidateProfile || {};
  const fields = [
    "headline",
    "summary",
    "location",
    "skills",
    "education",
    "experience_details",
    "resumeUrl",
    "linkedIn",
  ];
  const filled = fields.filter((f) => {
    const val = profile[f];
    return val && (Array.isArray(val) ? val.length > 0 : true);
  });
  return {
    percentage: Math.round((filled.length / fields.length) * 100),
    missing: fields.filter(
      (f) =>
        !profile[f] || (Array.isArray(profile[f]) && profile[f].length === 0),
    ),
  };
};
