const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { upload, parseResume } = require("../services/resumeService");
const ResumeVersion = require("../models/ResumeVersion");
const User = require("../models/User");
const { computeResumeStrength } = require("../services/aiMatchingService");

// Helper — convert skills array to plain strings
// extractSkillsWithConfidence returns [{skill, confidence}] — we need just strings
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

// GET all resume versions
router.get("/", protect, authorize("candidate"), async (req, res, next) => {
  try {
    const versions = await ResumeVersion.find({ userId: req.user.id }).sort({
      version: -1,
    });
    res.json({ success: true, versions });
  } catch (err) {
    next(err);
  }
});

// POST upload a new resume version
router.post(
  "/",
  protect,
  authorize("candidate"),
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });

      const lastVersion = await ResumeVersion.findOne({
        userId: req.user.id,
      }).sort({ version: -1 });
      const newVersionNum = lastVersion ? lastVersion.version + 1 : 1;

      const parsed = await parseResume(req.file.path);

      // ✅ FIX: normalize skills to plain strings
      const rawSkills = parsed.skills || [];
      const skills = normalizeSkills(rawSkills);

      const user = await User.findById(req.user.id);

      // Pass normalized skills to strength calculator
      const parsedForStrength = { ...parsed, skills };
      const strength = computeResumeStrength(
        parsedForStrength,
        user.candidateProfile,
      );

      await ResumeVersion.updateMany(
        { userId: req.user.id },
        { isActive: false },
      );

      const version = await ResumeVersion.create({
        userId: req.user.id,
        version: newVersionNum,
        label: req.body.label || `Resume v${newVersionNum}`,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        parsedData: parsed,
        skills, // ✅ plain strings
        resumeScore: strength.total,
        isActive: true,
        notes: req.body.notes || "",
      });

      // Update user profile
      const existingSkills = normalizeSkills(
        user.candidateProfile?.skills || [],
      );
      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          "candidateProfile.resumeUrl": version.fileUrl,
          "candidateProfile.resumeParsed": parsed,
          "candidateProfile.skills": [
            ...new Set([...existingSkills, ...skills]),
          ],
        },
      });

      res.status(201).json({ success: true, version, resumeScore: strength });
    } catch (err) {
      next(err);
    }
  },
);

// PUT set active version
router.put(
  "/:id/activate",
  protect,
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const version = await ResumeVersion.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });
      if (!version)
        return res
          .status(404)
          .json({ success: false, error: "Version not found" });

      await ResumeVersion.updateMany(
        { userId: req.user.id },
        { isActive: false },
      );
      version.isActive = true;
      await version.save();

      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          "candidateProfile.resumeUrl": version.fileUrl,
          "candidateProfile.resumeParsed": version.parsedData,
          "candidateProfile.skills": normalizeSkills(version.skills),
        },
      });
      res.json({ success: true, version });
    } catch (err) {
      next(err);
    }
  },
);

// GET compare two versions
router.get(
  "/compare",
  protect,
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const { v1, v2 } = req.query;
      const [ver1, ver2] = await Promise.all([
        ResumeVersion.findOne({ _id: v1, userId: req.user.id }),
        ResumeVersion.findOne({ _id: v2, userId: req.user.id }),
      ]);
      if (!ver1 || !ver2)
        return res
          .status(404)
          .json({ success: false, error: "Version not found" });

      const s1 = normalizeSkills(ver1.skills);
      const s2 = normalizeSkills(ver2.skills);

      res.json({
        success: true,
        v1: {
          label: ver1.label,
          score: ver1.resumeScore,
          skills: s1,
          createdAt: ver1.createdAt,
        },
        v2: {
          label: ver2.label,
          score: ver2.resumeScore,
          skills: s2,
          createdAt: ver2.createdAt,
        },
        diff: {
          addedSkills: s2.filter((s) => !s1.includes(s)),
          removedSkills: s1.filter((s) => !s2.includes(s)),
          scoreDiff: ver2.resumeScore - ver1.resumeScore,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE a version
router.delete(
  "/:id",
  protect,
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const version = await ResumeVersion.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });
      if (!version)
        return res.status(404).json({ success: false, error: "Not found" });
      res.json({ success: true, message: "Resume version deleted" });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
