const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upload, parseResume } = require("../services/resumeService");
const {
  analyzeSkillGap,
  computeResumeStrength,
} = require("../services/aiMatchingService");
const User = require("../models/User");

// Helper — convert [{skill, confidence}] → ['skill']
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

// POST upload & parse resume
router.post(
  "/upload",
  protect,
  authorize("candidate"),
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });

      const parsed = await parseResume(req.file.path);
      const resumeUrl = `/uploads/resumes/${req.file.filename}`;

      // ✅ FIX: normalize skills to plain strings
      const skills = normalizeSkills(parsed.skills || []);

      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          "candidateProfile.resumeUrl": resumeUrl,
          "candidateProfile.resumeParsed": { ...parsed, skills },
          "candidateProfile.skills": skills,
        },
      });

      res.json({ success: true, resumeUrl, parsed: { ...parsed, skills } });
    } catch (err) {
      next(err);
    }
  },
);

// GET skill gap analysis for a specific job
router.get(
  "/skill-gap/:jobId",
  protect,
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const Job = require("../models/Job");
      const job = await Job.findByPk(req.params.jobId);
      if (!job)
        return res.status(404).json({ success: false, error: "Job not found" });

      const candidate = await User.findById(req.user.id);
      const candidateSkills = normalizeSkills(
        candidate.candidateProfile?.skills || [],
      );
      const gap = analyzeSkillGap(candidateSkills, job.skills || []);

      res.json({ success: true, gap });
    } catch (err) {
      next(err);
    }
  },
);

// GET resume strength score
router.get(
  "/score",
  protect,
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const parsed = user.candidateProfile?.resumeParsed || {};
      const profile = user.candidateProfile || {};

      // Normalize skills before scoring
      const normalizedParsed = {
        ...parsed,
        skills: normalizeSkills(parsed.skills || []),
      };
      const score = computeResumeStrength(normalizedParsed, profile);

      res.json({ success: true, score });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
