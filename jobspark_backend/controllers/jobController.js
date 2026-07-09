// const { Op } = require("sequelize");
// const Job = require("../models/Job");
// const Application = require("../models/Application");
// const User = require("../models/User");
// const { rankJobsForCandidate } = require("../services/aiMatchingService");
// const logger = require("../utils/logger");

// // ─── Create Job ───────────────────────────────────────────────────────────────
// exports.createJob = async (req, res, next) => {
//   try {
//     const recruiter = await User.findById(req.user.id);
//     const company = recruiter.recruiterProfile?.company || "Company";

//     const job = await Job.create({
//       ...req.body,
//       recruiterId: req.user.id,
//       company,
//     });

//     // Notify via socket
//     const io = req.app.get("io");
//     io.emit("new_job", { id: job.id, title: job.title, company: job.company });

//     logger.info(`Job created: ${job.title} by ${req.user.id}`);
//     res.status(201).json({ success: true, job });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Get All Jobs (with filters + search) ────────────────────────────────────
// exports.getJobs = async (req, res, next) => {
//   try {
//     const {
//       search,
//       category,
//       jobType,
//       location,
//       salaryMin,
//       salaryMax,
//       experienceMin,
//       experienceMax,
//       page = 1,
//       limit = 20,
//       sort = "createdAt",
//     } = req.query;

//     const where = { status: "active" };

//     if (search) {
//       where[Op.or] = [
//         { title: { [Op.like]: `%${search}%` } },
//         { description: { [Op.like]: `%${search}%` } },
//         { company: { [Op.like]: `%${search}%` } },
//       ];
//     }
//     if (category) where.category = category;
//     if (jobType) where.jobType = jobType;
//     if (location) where.location = { [Op.like]: `%${location}%` };
//     if (salaryMin) where.salaryMin = { [Op.gte]: parseInt(salaryMin) };
//     if (salaryMax) where.salaryMax = { [Op.lte]: parseInt(salaryMax) };
//     if (experienceMin)
//       where.experienceMin = { [Op.gte]: parseInt(experienceMin) };
//     if (experienceMax)
//       where.experienceMax = { [Op.lte]: parseInt(experienceMax) };

//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     const validSortFields = [
//       "createdAt",
//       "salaryMin",
//       "applicationCount",
//       "viewCount",
//     ];
//     const sortField = validSortFields.includes(sort) ? sort : "createdAt";

//     const { count, rows: jobs } = await Job.findAndCountAll({
//       where,
//       order: [[sortField, "DESC"]],
//       limit: parseInt(limit),
//       offset,
//     });

//     // Increment view count only for non-recruiter viewers
//     if (jobs.length && req.user?.role !== "recruiter") {
//       Job.increment("viewCount", { where: { id: jobs.map((j) => j.id) } });
//     }

//     res.json({
//       success: true,
//       total: count,
//       page: parseInt(page),
//       pages: Math.ceil(count / parseInt(limit)),
//       jobs,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Get Single Job ───────────────────────────────────────────────────────────
// exports.getJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByPk(req.params.id, {
//       include: [{ model: Application, attributes: ["id", "status"] }],
//     });
//     if (!job)
//       return res.status(404).json({ success: false, error: "Job not found" });

//     // Only count views from candidates or anonymous users, not the job owner
//     if (
//       !req.user ||
//       req.user.role !== "recruiter" ||
//       job.recruiterId !== req.user.id
//     ) {
//       await job.increment("viewCount");
//     }
//     res.json({ success: true, job });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Update Job ───────────────────────────────────────────────────────────────
// exports.updateJob = async (req, res, next) => {
//   try {
//     const job = await Job.findOne({
//       where: { id: req.params.id, recruiterId: req.user.id },
//     });
//     if (!job)
//       return res
//         .status(404)
//         .json({ success: false, error: "Job not found or unauthorized" });

//     const allowedUpdates = [
//       "title",
//       "description",
//       "requirements",
//       "responsibilities",
//       "skills",
//       "location",
//       "jobType",
//       "experienceMin",
//       "experienceMax",
//       "salaryMin",
//       "salaryMax",
//       "status",
//       "applicationDeadline",
//       "tags",
//     ];
//     allowedUpdates.forEach((field) => {
//       if (req.body[field] !== undefined) job[field] = req.body[field];
//     });

//     await job.save();
//     res.json({ success: true, job });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Delete Job ───────────────────────────────────────────────────────────────
// exports.deleteJob = async (req, res, next) => {
//   try {
//     const job = await Job.findOne({
//       where: { id: req.params.id, recruiterId: req.user.id },
//     });
//     if (!job)
//       return res
//         .status(404)
//         .json({ success: false, error: "Job not found or unauthorized" });

//     await job.destroy();
//     res.json({ success: true, message: "Job deleted successfully" });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── AI-Powered Job Recommendations for Candidate ────────────────────────────
// exports.getRecommendedJobs = async (req, res, next) => {
//   try {
//     const candidate = await User.findById(req.user.id);
//     if (!candidate.candidateProfile) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Please complete your profile first" });
//     }

//     const jobs = await Job.findAll({ where: { status: "active" }, limit: 100 });
//     const ranked = rankJobsForCandidate(
//       jobs.map((j) => j.toJSON()),
//       candidate.candidateProfile,
//     );

//     res.json({ success: true, recommendations: ranked.slice(0, 20) });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Get Recruiter's Jobs ────────────────────────────────────────────────────
// exports.getMyJobs = async (req, res, next) => {
//   try {
//     const jobs = await Job.findAll({
//       where: { recruiterId: req.user.id },
//       include: [{ model: Application }],
//       order: [["createdAt", "DESC"]],
//     });
//     res.json({ success: true, jobs });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Trending Jobs ────────────────────────────────────────────────────────────
// exports.getTrendingJobs = async (req, res, next) => {
//   try {
//     const { limit = 10 } = req.query;
//     const since = new Date();
//     since.setDate(since.getDate() - 14); // last 14 days

//     const Application = require("../models/Application");
//     const { Op, fn, col, literal } = require("sequelize");

//     // Get app counts per job in last 14 days
//     const recentCounts = await Application.findAll({
//       where: { createdAt: { [Op.gte]: since } },
//       attributes: ["jobId", [fn("COUNT", col("id")), "recentApps"]],
//       group: ["jobId"],
//       raw: true,
//     });

//     const countMap = {};
//     recentCounts.forEach((r) => {
//       countMap[r.jobId] = parseInt(r.recentApps);
//     });

//     const jobs = await Job.findAll({ where: { status: "active" } });
//     const { computeTrendingScore } = require("../services/aiMatchingService");

//     const scored = jobs
//       .map((j) => ({
//         ...j.toJSON(),
//         trendingScore:
//           (countMap[j.id] || 0) * 3 +
//           (j.viewCount || 0) * 0.1 +
//           (j.applicationCount || 0) * 0.5,
//         recentApps: countMap[j.id] || 0,
//       }))
//       .sort((a, b) => b.trendingScore - a.trendingScore)
//       .slice(0, parseInt(limit));

//     res.json({ success: true, jobs: scored });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Autocomplete Search ──────────────────────────────────────────────────────
// exports.autocomplete = async (req, res, next) => {
//   try {
//     const { q } = req.query;
//     if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

//     const { Op } = require("sequelize");
//     const jobs = await Job.findAll({
//       where: { status: "active", title: { [Op.like]: `%${q}%` } },
//       attributes: ["title", "category", "company"],
//       limit: 8,
//     });

//     // Deduplicate and build suggestions
//     const titleSet = new Set();
//     const suggestions = [];
//     jobs.forEach((j) => {
//       if (!titleSet.has(j.title)) {
//         titleSet.add(j.title);
//         suggestions.push({ type: "job", label: j.title, sub: j.company });
//       }
//     });

//     // Add skill suggestions from taxonomy
//     const { extractSkills } = require("../services/aiMatchingService");
//     const allSkills = Object.values(
//       require("../services/aiMatchingService").SKILL_MAP || {},
//     );
//     // Simple: filter known skills matching query
//     const skillSuggestions = [
//       ...new Set(
//         Object.keys(
//           require("../services/aiMatchingService").parseBooleanSearch ? {} : {},
//         ),
//       ),
//     ]
//       .filter((s) => s.includes(q.toLowerCase()))
//       .slice(0, 4)
//       .map((s) => ({ type: "skill", label: s, sub: "Skill" }));

//     res.json({
//       success: true,
//       suggestions: [...suggestions, ...skillSuggestions],
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ─── Boolean Search ───────────────────────────────────────────────────────────
// exports.booleanSearch = async (req, res, next) => {
//   try {
//     const { q, page = 1, limit = 20 } = req.query;
//     const {
//       parseBooleanSearch,
//       jobMatchesBooleanQuery,
//     } = require("../services/aiMatchingService");
//     const parsed = parseBooleanSearch(q);

//     // Fetch active jobs
//     const jobs = await Job.findAll({ where: { status: "active" } });
//     const matched = jobs.filter((j) =>
//       jobMatchesBooleanQuery(j.toJSON(), parsed),
//     );
//     const paginated = matched.slice(
//       (parseInt(page) - 1) * parseInt(limit),
//       parseInt(page) * parseInt(limit),
//     );

//     res.json({
//       success: true,
//       total: matched.length,
//       page: parseInt(page),
//       parsedQuery: parsed,
//       jobs: paginated,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const { Op } = require("sequelize");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const { rankJobsForCandidate } = require("../services/aiMatchingService");
const logger = require("../utils/logger");

// ─── Create Job ───────────────────────────────────────────────────────────────
exports.createJob = async (req, res, next) => {
  try {
    const recruiter = await User.findById(req.user.id);
    // Company always comes from recruiter's profile — not from form
    const company =
      recruiter.recruiterProfile?.company || recruiter.name || "Company";

    const job = await Job.create({
      ...req.body,
      recruiterId: req.user.id,
      company,
    });

    // Notify via socket
    const io = req.app.get("io");
    io.emit("new_job", { id: job.id, title: job.title, company: job.company });

    logger.info(`Job created: ${job.title} by ${req.user.id}`);
    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Jobs (with filters + search) ────────────────────────────────────
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      jobType,
      location,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      page = 1,
      limit = 20,
      sort = "createdAt",
    } = req.query;

    const where = { status: "active" };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;
    if (jobType) where.jobType = jobType;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (salaryMin) where.salaryMin = { [Op.gte]: parseInt(salaryMin) };
    if (salaryMax) where.salaryMax = { [Op.lte]: parseInt(salaryMax) };
    if (experienceMin)
      where.experienceMin = { [Op.gte]: parseInt(experienceMin) };
    if (experienceMax)
      where.experienceMax = { [Op.lte]: parseInt(experienceMax) };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = [
      "createdAt",
      "salaryMin",
      "applicationCount",
      "viewCount",
    ];
    const sortField = validSortFields.includes(sort) ? sort : "createdAt";

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      order: [[sortField, "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    // Increment view count (fire and forget)
    if (jobs.length)
      Job.increment("viewCount", { where: { id: jobs.map((j) => j.id) } });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Job ───────────────────────────────────────────────────────────
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Application, attributes: ["id", "status"] }],
    });
    if (!job)
      return res.status(404).json({ success: false, error: "Job not found" });

    await job.increment("viewCount");
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// ─── Update Job ───────────────────────────────────────────────────────────────
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.id, recruiterId: req.user.id },
    });
    if (!job)
      return res
        .status(404)
        .json({ success: false, error: "Job not found or unauthorized" });

    const allowedUpdates = [
      "title",
      "description",
      "requirements",
      "responsibilities",
      "skills",
      "location",
      "jobType",
      "experienceMin",
      "experienceMax",
      "salaryMin",
      "salaryMax",
      "status",
      "applicationDeadline",
      "tags",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Job ───────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.id, recruiterId: req.user.id },
    });
    if (!job)
      return res
        .status(404)
        .json({ success: false, error: "Job not found or unauthorized" });

    await job.destroy();
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ─── AI-Powered Job Recommendations for Candidate ────────────────────────────
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    const candidate = await User.findById(req.user.id);
    if (!candidate.candidateProfile) {
      return res
        .status(400)
        .json({ success: false, error: "Please complete your profile first" });
    }

    const jobs = await Job.findAll({ where: { status: "active" }, limit: 100 });
    const ranked = rankJobsForCandidate(
      jobs.map((j) => j.toJSON()),
      candidate.candidateProfile,
    );

    res.json({ success: true, recommendations: ranked.slice(0, 20) });
  } catch (err) {
    next(err);
  }
};

// ─── Get Recruiter's Jobs ────────────────────────────────────────────────────
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      where: { recruiterId: req.user.id },
      include: [{ model: Application }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

// ─── Trending Jobs ────────────────────────────────────────────────────────────
exports.getTrendingJobs = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - 14); // last 14 days

    const Application = require("../models/Application");
    const { Op, fn, col, literal } = require("sequelize");

    // Get app counts per job in last 14 days
    const recentCounts = await Application.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: ["jobId", [fn("COUNT", col("id")), "recentApps"]],
      group: ["jobId"],
      raw: true,
    });

    const countMap = {};
    recentCounts.forEach((r) => {
      countMap[r.jobId] = parseInt(r.recentApps);
    });

    const jobs = await Job.findAll({ where: { status: "active" } });
    const { computeTrendingScore } = require("../services/aiMatchingService");

    const scored = jobs
      .map((j) => ({
        ...j.toJSON(),
        trendingScore:
          (countMap[j.id] || 0) * 3 +
          (j.viewCount || 0) * 0.1 +
          (j.applicationCount || 0) * 0.5,
        recentApps: countMap[j.id] || 0,
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, parseInt(limit));

    res.json({ success: true, jobs: scored });
  } catch (err) {
    next(err);
  }
};

// ─── Autocomplete Search ──────────────────────────────────────────────────────
exports.autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

    const { Op } = require("sequelize");
    const jobs = await Job.findAll({
      where: { status: "active", title: { [Op.like]: `%${q}%` } },
      attributes: ["title", "category", "company"],
      limit: 8,
    });

    // Deduplicate and build suggestions
    const titleSet = new Set();
    const suggestions = [];
    jobs.forEach((j) => {
      if (!titleSet.has(j.title)) {
        titleSet.add(j.title);
        suggestions.push({ type: "job", label: j.title, sub: j.company });
      }
    });

    // Add skill suggestions from taxonomy
    const { extractSkills } = require("../services/aiMatchingService");
    const allSkills = Object.values(
      require("../services/aiMatchingService").SKILL_MAP || {},
    );
    // Simple: filter known skills matching query
    const skillSuggestions = [
      ...new Set(
        Object.keys(
          require("../services/aiMatchingService").parseBooleanSearch ? {} : {},
        ),
      ),
    ]
      .filter((s) => s.includes(q.toLowerCase()))
      .slice(0, 4)
      .map((s) => ({ type: "skill", label: s, sub: "Skill" }));

    res.json({
      success: true,
      suggestions: [...suggestions, ...skillSuggestions],
    });
  } catch (err) {
    next(err);
  }
};

// ─── Boolean Search ───────────────────────────────────────────────────────────
exports.booleanSearch = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const {
      parseBooleanSearch,
      jobMatchesBooleanQuery,
    } = require("../services/aiMatchingService");
    const parsed = parseBooleanSearch(q);

    // Fetch active jobs
    const jobs = await Job.findAll({ where: { status: "active" } });
    const matched = jobs.filter((j) =>
      jobMatchesBooleanQuery(j.toJSON(), parsed),
    );
    const paginated = matched.slice(
      (parseInt(page) - 1) * parseInt(limit),
      parseInt(page) * parseInt(limit),
    );

    res.json({
      success: true,
      total: matched.length,
      page: parseInt(page),
      parsedQuery: parsed,
      jobs: paginated,
    });
  } catch (err) {
    next(err);
  }
};
