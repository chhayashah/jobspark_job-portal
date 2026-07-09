const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const {
  computeMatchScore,
  rankCandidatesForJob,
} = require("../services/aiMatchingService");
const { parseResume } = require("../services/resumeService");
const emailService = require("../services/emailService");
const logger = require("../utils/logger");

// ─── Helper: normalize [{skill,confidence}] → ['skill'] ──────────────────────
const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object" && s.skill) return s.skill;
      return String(s);
    })
    .filter(Boolean);
};

// ─── Apply to Job ─────────────────────────────────────────────────────────────
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    const existing = await Application.findOne({
      where: { jobId, candidateId: req.user.id },
    });
    if (existing)
      return res
        .status(409)
        .json({
          success: false,
          error: "You have already applied to this job",
        });

    const job = await Job.findByPk(jobId);
    if (!job || job.status !== "active") {
      return res
        .status(404)
        .json({ success: false, error: "Job not found or no longer active" });
    }

    if (
      job.applicationDeadline &&
      new Date() > new Date(job.applicationDeadline)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Application deadline has passed" });
    }

    const candidate = await User.findById(req.user.id);
    const resumeUrl = req.file
      ? `/uploads/resumes/${req.file.filename}`
      : candidate.candidateProfile?.resumeUrl;

    if (!resumeUrl) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload a resume" });
    }

    // ─── AI Matching ──────────────────────────────────────────────────────────
    let parsedResume = candidate.candidateProfile?.resumeParsed || {};

    if (req.file) {
      parsedResume = await parseResume(req.file.path);

      // ✅ FIX: normalize skills before saving
      const normalizedSkills = normalizeSkills(parsedResume.skills || []);
      parsedResume = { ...parsedResume, skills: normalizedSkills };

      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          "candidateProfile.resumeUrl": resumeUrl,
          "candidateProfile.resumeParsed": parsedResume,
          "candidateProfile.skills": normalizedSkills,
        },
      });
    }

    // ✅ FIX: normalize existing skills too before matching
    const candidateData = {
      ...candidate.candidateProfile,
      ...parsedResume,
      skills: normalizeSkills(
        parsedResume.skills?.length
          ? parsedResume.skills
          : candidate.candidateProfile?.skills || [],
      ),
    };

    const matchResult = computeMatchScore(candidateData, job.toJSON());

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      resumeUrl,
      coverLetter: coverLetter || "",
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      matchDetails: matchResult.breakdown,
    });

    await job.increment("applicationCount");

    // ✅ Notify recruiter — DB save + real-time socket + email
    const io = req.app.get("io");
    const recruiter = await User.findById(job.recruiterId);
    if (recruiter) {
      const {
        notifyNewApplication,
      } = require("../services/notificationService");
      await notifyNewApplication(io, {
        recruiterId: job.recruiterId,
        candidateName: candidate.name,
        jobTitle: job.title,
        jobId: job.id,
        applicationId: application.id,
      });
      // Email to recruiter
      emailService
        .sendApplicationNotification(recruiter.email, candidate.name, job.title)
        .catch((e) => logger.warn("Email failed:", e.message));
    }

    logger.info(
      `Application: ${candidate.name} → ${job.title} (score: ${matchResult.score})`,
    );

    res.status(201).json({
      success: true,
      application,
      matchResult: {
        score: matchResult.score,
        rating: matchResult.rating,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        breakdown: matchResult.breakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Candidate's Applications ─────────────────────────────────────────────
exports.getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = { candidateId: req.user.id };
    if (status) where.status = status;

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          attributes: [
            "id",
            "title",
            "company",
            "location",
            "jobType",
            "status",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      success: true,
      total: count,
      pages: Math.ceil(count / parseInt(limit)),
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Applications for a Job (Recruiter) ───────────────────────────────────
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.jobId, recruiterId: req.user.id },
    });
    if (!job)
      return res
        .status(404)
        .json({ success: false, error: "Job not found or unauthorized" });

    const { status, sortBy = "matchScore", order = "DESC" } = req.query;
    const where = { jobId: req.params.jobId };
    if (status) where.status = status;

    const applications = await Application.findAll({
      where,
      order: [[sortBy, order]],
    });
    const candidateIds = applications.map((a) => a.candidateId);
    const candidates = await User.find({ _id: { $in: candidateIds } }).select(
      "name email phone candidateProfile avatar",
    );

    const candidateMap = {};
    candidates.forEach((c) => {
      candidateMap[c._id.toString()] = c;
    });

    const enriched = applications.map((app) => ({
      ...app.toJSON(),
      candidate: candidateMap[app.candidateId] || null,
    }));

    res.json({ success: true, total: enriched.length, applications: enriched });
  } catch (err) {
    next(err);
  }
};

// ─── AI: Get Ranked Candidates for Job ───────────────────────────────────────
exports.getRankedCandidates = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.jobId, recruiterId: req.user.id },
    });
    if (!job)
      return res.status(404).json({ success: false, error: "Unauthorized" });

    const applications = await Application.findAll({
      where: { jobId: req.params.jobId },
    });
    const candidateIds = applications.map((a) => a.candidateId);
    const candidates = await User.find({ _id: { $in: candidateIds } });
    const ranked = rankCandidatesForJob(candidates, job.toJSON());

    res.json({ success: true, ranked });
  } catch (err) {
    next(err);
  }
};

// ─── Update Application Status (Recruiter) ────────────────────────────────────
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const {
      status,
      recruiterNotes,
      interviewDate,
      interviewMode,
      offerAmount,
    } = req.body;

    const application = await Application.findByPk(req.params.id, {
      include: [Job],
    });
    if (!application)
      return res
        .status(404)
        .json({ success: false, error: "Application not found" });
    if (application.Job.recruiterId !== req.user.id) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    await application.update({
      status,
      recruiterNotes,
      interviewDate,
      interviewMode,
      offerAmount,
    });

    const io = req.app.get("io");
    const candidate = await User.findById(application.candidateId);

    // ✅ FIX: Save notification to MongoDB + real-time socket push
    if (candidate) {
      const { notifyStatusUpdate } = require("../services/notificationService");
      await notifyStatusUpdate(io, {
        candidateId: candidate._id,
        candidateEmail: candidate.email,
        jobTitle: application.Job.title,
        status,
        jobId: application.jobId,
      });
    }

    res.json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// ─── Withdraw Application (Candidate) ────────────────────────────────────────
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      where: { id: req.params.id, candidateId: req.user.id },
    });
    if (!application)
      return res
        .status(404)
        .json({ success: false, error: "Application not found" });
    if (["hired", "offered"].includes(application.status)) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot withdraw at this stage" });
    }
    await application.update({ status: "withdrawn" });
    res.json({ success: true, message: "Application withdrawn" });
  } catch (err) {
    next(err);
  }
};

// ─── Auto-Shortlist Candidates above threshold ────────────────────────────────
exports.autoShortlist = async (req, res, next) => {
  try {
    const { threshold = 70 } = req.body;
    const job = await Job.findOne({
      where: { id: req.params.jobId, recruiterId: req.user.id },
    });
    if (!job)
      return res.status(404).json({ success: false, error: "Unauthorized" });

    const { Op } = require("sequelize");
    const toShortlist = await Application.findAll({
      where: {
        jobId: req.params.jobId,
        status: "applied",
        matchScore: { [Op.gte]: parseFloat(threshold) },
      },
    });

    await Application.update(
      { status: "shortlisted" },
      {
        where: {
          jobId: req.params.jobId,
          status: "applied",
          matchScore: { [Op.gte]: parseFloat(threshold) },
        },
      },
    );

    const io = req.app.get("io");
    const { notifyStatusUpdate } = require("../services/notificationService");
    for (const app of toShortlist) {
      const candidate = await User.findById(app.candidateId);
      if (candidate) {
        await notifyStatusUpdate(io, {
          candidateId: candidate._id,
          candidateEmail: candidate.email,
          jobTitle: job.title,
          status: "shortlisted",
          jobId: job.id,
        });
      }
    }

    res.json({
      success: true,
      shortlisted: toShortlist.length,
      message: `${toShortlist.length} candidates auto-shortlisted above ${threshold}% match`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Compare Candidates Side-by-Side ─────────────────────────────────────────
exports.compareCandidates = async (req, res, next) => {
  try {
    const { applicationIds } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length < 2) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Provide 2-5 application IDs to compare",
        });
    }

    const apps = await Application.findAll({
      where: { id: applicationIds },
      include: [Job],
    });
    const unauthorized = apps.find((a) => a.Job?.recruiterId !== req.user.id);
    if (unauthorized)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    const enriched = await Promise.all(
      apps.map(async (app) => {
        const candidate = await User.findById(app.candidateId).select(
          "name email phone candidateProfile avatar",
        );
        return {
          applicationId: app.id,
          status: app.status,
          matchScore: app.matchScore,
          matchedSkills: app.matchedSkills || [],
          missingSkills: app.missingSkills || [],
          matchDetails: app.matchDetails || {},
          candidate: candidate
            ? {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                skills: normalizeSkills(
                  candidate.candidateProfile?.skills || [],
                ),
                experience: candidate.candidateProfile?.experience || 0,
                education: candidate.candidateProfile?.education || [],
                headline: candidate.candidateProfile?.headline || "",
                github: candidate.candidateProfile?.github || "",
                linkedIn: candidate.candidateProfile?.linkedIn || "",
                avatar: candidate.avatar,
              }
            : null,
        };
      }),
    );

    const best = [...enriched].sort((a, b) => b.matchScore - a.matchScore)[0];
    const recommendation = best
      ? {
          recommendedId: best.applicationId,
          name: best.candidate?.name,
          reason: `Highest overall match (${best.matchScore}%) with ${best.matchedSkills.length} matching skills`,
        }
      : null;

    res.json({
      success: true,
      candidates: enriched,
      aiRecommendation: recommendation,
    });
  } catch (err) {
    next(err);
  }
};

// const Application = require("../models/Application");
// const Job = require("../models/Job");
// const User = require("../models/User");
// const {
//   computeMatchScore,
//   rankCandidatesForJob,
// } = require("../services/aiMatchingService");
// const { parseResume } = require("../services/resumeService");
// const emailService = require("../services/emailService");
// const logger = require("../utils/logger");

// // ─── Helper: normalize [{skill,confidence}] → ['skill'] ──────────────────────
// const normalizeSkills = (skills) => {
//   if (!Array.isArray(skills)) return [];
//   return skills
//     .map((s) => {
//       if (typeof s === "string") return s;
//       if (s && typeof s === "object" && s.skill) return s.skill;
//       return String(s);
//     })
//     .filter(Boolean);
// };

// // ─── Apply to Job ─────────────────────────────────────────────────────────────
// exports.applyToJob = async (req, res, next) => {
//   try {
//     const { jobId, coverLetter } = req.body;

//     const existing = await Application.findOne({
//       where: { jobId, candidateId: req.user.id },
//     });
//     if (existing)
//       return res
//         .status(409)
//         .json({
//           success: false,
//           error: "You have already applied to this job",
//         });

//     const job = await Job.findByPk(jobId);
//     if (!job || job.status !== "active") {
//       return res
//         .status(404)
//         .json({ success: false, error: "Job not found or no longer active" });
//     }

//     if (
//       job.applicationDeadline &&
//       new Date() > new Date(job.applicationDeadline)
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Application deadline has passed" });
//     }

//     const candidate = await User.findById(req.user.id);
//     const resumeUrl = req.file
//       ? `/uploads/resumes/${req.file.filename}`
//       : candidate.candidateProfile?.resumeUrl;

//     if (!resumeUrl) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Please upload a resume" });
//     }

//     // ─── AI Matching ──────────────────────────────────────────────────────────
//     let parsedResume = candidate.candidateProfile?.resumeParsed || {};

//     if (req.file) {
//       parsedResume = await parseResume(req.file.path);

//       // ✅ FIX: normalize skills before saving
//       const normalizedSkills = normalizeSkills(parsedResume.skills || []);
//       parsedResume = { ...parsedResume, skills: normalizedSkills };

//       await User.findByIdAndUpdate(req.user.id, {
//         $set: {
//           "candidateProfile.resumeUrl": resumeUrl,
//           "candidateProfile.resumeParsed": parsedResume,
//           "candidateProfile.skills": normalizedSkills,
//         },
//       });
//     }

//     // ✅ FIX: normalize existing skills too before matching
//     const candidateData = {
//       ...candidate.candidateProfile,
//       ...parsedResume,
//       skills: normalizeSkills(
//         parsedResume.skills?.length
//           ? parsedResume.skills
//           : candidate.candidateProfile?.skills || [],
//       ),
//     };

//     const matchResult = computeMatchScore(candidateData, job.toJSON());

//     const application = await Application.create({
//       jobId,
//       candidateId: req.user.id,
//       resumeUrl,
//       coverLetter: coverLetter || "",
//       matchScore: matchResult.score,
//       matchedSkills: matchResult.matchedSkills,
//       missingSkills: matchResult.missingSkills,
//       matchDetails: matchResult.breakdown,
//     });

//     await job.increment("applicationCount");

//     // Notify recruiter
//     const io = req.app.get("io");
//     io.to(job.recruiterId).emit("new_application", {
//       jobTitle: job.title,
//       candidateName: candidate.name,
//       matchScore: matchResult.score,
//       applicationId: application.id,
//     });

//     const recruiter = await User.findById(job.recruiterId);
//     if (recruiter) {
//       emailService
//         .sendApplicationNotification(recruiter.email, candidate.name, job.title)
//         .catch((e) => logger.warn("Email failed:", e.message));
//     }

//     logger.info(
//       `Application: ${candidate.name} → ${job.title} (score: ${matchResult.score})`,
//     );

//     res.status(201).json({
//       success: true,
//       application,
//       matchResult: {
//         score: matchResult.score,
//         rating: matchResult.rating,
//         matchedSkills: matchResult.matchedSkills,
//         missingSkills: matchResult.missingSkills,
//         breakdown: matchResult.breakdown,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Get Candidate's Applications ─────────────────────────────────────────────
// exports.getMyApplications = async (req, res, next) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;
//     const where = { candidateId: req.user.id };
//     if (status) where.status = status;

//     const { count, rows: applications } = await Application.findAndCountAll({
//       where,
//       include: [
//         {
//           model: Job,
//           attributes: [
//             "id",
//             "title",
//             "company",
//             "location",
//             "jobType",
//             "status",
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       limit: parseInt(limit),
//       offset: (parseInt(page) - 1) * parseInt(limit),
//     });

//     res.json({
//       success: true,
//       total: count,
//       pages: Math.ceil(count / parseInt(limit)),
//       applications,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Get Applications for a Job (Recruiter) ───────────────────────────────────
// exports.getJobApplications = async (req, res, next) => {
//   try {
//     const job = await Job.findOne({
//       where: { id: req.params.jobId, recruiterId: req.user.id },
//     });
//     if (!job)
//       return res
//         .status(404)
//         .json({ success: false, error: "Job not found or unauthorized" });

//     const { status, sortBy = "matchScore", order = "DESC" } = req.query;
//     const where = { jobId: req.params.jobId };
//     if (status) where.status = status;

//     const applications = await Application.findAll({
//       where,
//       order: [[sortBy, order]],
//     });
//     const candidateIds = applications.map((a) => a.candidateId);
//     const candidates = await User.find({ _id: { $in: candidateIds } }).select(
//       "name email phone candidateProfile avatar",
//     );

//     const candidateMap = {};
//     candidates.forEach((c) => {
//       candidateMap[c._id.toString()] = c;
//     });

//     const enriched = applications.map((app) => ({
//       ...app.toJSON(),
//       candidate: candidateMap[app.candidateId] || null,
//     }));

//     res.json({ success: true, total: enriched.length, applications: enriched });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── AI: Get Ranked Candidates for Job ───────────────────────────────────────
// exports.getRankedCandidates = async (req, res, next) => {
//   try {
//     const job = await Job.findOne({
//       where: { id: req.params.jobId, recruiterId: req.user.id },
//     });
//     if (!job)
//       return res.status(404).json({ success: false, error: "Unauthorized" });

//     const applications = await Application.findAll({
//       where: { jobId: req.params.jobId },
//     });
//     const candidateIds = applications.map((a) => a.candidateId);
//     const candidates = await User.find({ _id: { $in: candidateIds } });
//     const ranked = rankCandidatesForJob(candidates, job.toJSON());

//     res.json({ success: true, ranked });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Update Application Status (Recruiter) ────────────────────────────────────
// exports.updateApplicationStatus = async (req, res, next) => {
//   try {
//     const {
//       status,
//       recruiterNotes,
//       interviewDate,
//       interviewMode,
//       offerAmount,
//     } = req.body;

//     const application = await Application.findByPk(req.params.id, {
//       include: [Job],
//     });
//     if (!application)
//       return res
//         .status(404)
//         .json({ success: false, error: "Application not found" });
//     if (application.Job.recruiterId !== req.user.id) {
//       return res.status(403).json({ success: false, error: "Unauthorized" });
//     }

//     await application.update({
//       status,
//       recruiterNotes,
//       interviewDate,
//       interviewMode,
//       offerAmount,
//     });

//     const io = req.app.get("io");
//     const candidate = await User.findById(application.candidateId);

//     // ✅ FIX: Save notification to MongoDB + real-time socket push
//     if (candidate) {
//       const { notifyStatusUpdate } = require("../services/notificationService");
//       await notifyStatusUpdate(io, {
//         candidateId: candidate._id,
//         candidateEmail: candidate.email,
//         jobTitle: application.Job.title,
//         status,
//         jobId: application.jobId,
//       });
//     }

//     res.json({ success: true, application });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Withdraw Application (Candidate) ────────────────────────────────────────
// exports.withdrawApplication = async (req, res, next) => {
//   try {
//     const application = await Application.findOne({
//       where: { id: req.params.id, candidateId: req.user.id },
//     });
//     if (!application)
//       return res
//         .status(404)
//         .json({ success: false, error: "Application not found" });
//     if (["hired", "offered"].includes(application.status)) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Cannot withdraw at this stage" });
//     }
//     await application.update({ status: "withdrawn" });
//     res.json({ success: true, message: "Application withdrawn" });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Auto-Shortlist Candidates above threshold ────────────────────────────────
// exports.autoShortlist = async (req, res, next) => {
//   try {
//     const { threshold = 70 } = req.body;
//     const job = await Job.findOne({
//       where: { id: req.params.jobId, recruiterId: req.user.id },
//     });
//     if (!job)
//       return res.status(404).json({ success: false, error: "Unauthorized" });

//     const { Op } = require("sequelize");
//     const toShortlist = await Application.findAll({
//       where: {
//         jobId: req.params.jobId,
//         status: "applied",
//         matchScore: { [Op.gte]: parseFloat(threshold) },
//       },
//     });

//     await Application.update(
//       { status: "shortlisted" },
//       {
//         where: {
//           jobId: req.params.jobId,
//           status: "applied",
//           matchScore: { [Op.gte]: parseFloat(threshold) },
//         },
//       },
//     );

//     const io = req.app.get("io");
//     const { notifyStatusUpdate } = require("../services/notificationService");
//     for (const app of toShortlist) {
//       const candidate = await User.findById(app.candidateId);
//       if (candidate) {
//         await notifyStatusUpdate(io, {
//           candidateId: candidate._id,
//           candidateEmail: candidate.email,
//           jobTitle: job.title,
//           status: "shortlisted",
//           jobId: job.id,
//         });
//       }
//     }

//     res.json({
//       success: true,
//       shortlisted: toShortlist.length,
//       message: `${toShortlist.length} candidates auto-shortlisted above ${threshold}% match`,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Compare Candidates Side-by-Side ─────────────────────────────────────────
// exports.compareCandidates = async (req, res, next) => {
//   try {
//     const { applicationIds } = req.body;
//     if (!Array.isArray(applicationIds) || applicationIds.length < 2) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           error: "Provide 2-5 application IDs to compare",
//         });
//     }

//     const apps = await Application.findAll({
//       where: { id: applicationIds },
//       include: [Job],
//     });
//     const unauthorized = apps.find((a) => a.Job?.recruiterId !== req.user.id);
//     if (unauthorized)
//       return res.status(403).json({ success: false, error: "Unauthorized" });

//     const enriched = await Promise.all(
//       apps.map(async (app) => {
//         const candidate = await User.findById(app.candidateId).select(
//           "name email phone candidateProfile avatar",
//         );
//         return {
//           applicationId: app.id,
//           status: app.status,
//           matchScore: app.matchScore,
//           matchedSkills: app.matchedSkills || [],
//           missingSkills: app.missingSkills || [],
//           matchDetails: app.matchDetails || {},
//           candidate: candidate
//             ? {
//                 id: candidate._id,
//                 name: candidate.name,
//                 email: candidate.email,
//                 skills: normalizeSkills(
//                   candidate.candidateProfile?.skills || [],
//                 ),
//                 experience: candidate.candidateProfile?.experience || 0,
//                 education: candidate.candidateProfile?.education || [],
//                 headline: candidate.candidateProfile?.headline || "",
//                 github: candidate.candidateProfile?.github || "",
//                 linkedIn: candidate.candidateProfile?.linkedIn || "",
//                 avatar: candidate.avatar,
//               }
//             : null,
//         };
//       }),
//     );

//     const best = [...enriched].sort((a, b) => b.matchScore - a.matchScore)[0];
//     const recommendation = best
//       ? {
//           recommendedId: best.applicationId,
//           name: best.candidate?.name,
//           reason: `Highest overall match (${best.matchScore}%) with ${best.matchedSkills.length} matching skills`,
//         }
//       : null;

//     res.json({
//       success: true,
//       candidates: enriched,
//       aiRecommendation: recommendation,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
