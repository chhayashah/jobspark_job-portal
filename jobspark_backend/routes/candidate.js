// routes/candidate.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const { avatarUpload } = require("../services/resumeService");

// Get candidate public profile
router.get("/:id/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name avatar candidateProfile.headline candidateProfile.skills candidateProfile.experience candidateProfile.education",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    res.json({ success: true, profile: user });
  } catch (err) {
    next(err);
  }
});

// Upload avatar
router.post(
  "/avatar",
  protect,
  authorize("candidate"),
  avatarUpload.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
      res.json({ success: true, avatarUrl });
    } catch (err) {
      next(err);
    }
  },
);

// Update candidate profile skills
router.put(
  "/skills",
  protect,
  authorize("candidate"),
  async (req, res, next) => {
    try {
      const { skills } = req.body;
      if (!Array.isArray(skills))
        return res
          .status(400)
          .json({ success: false, error: "Skills must be an array" });
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { "candidateProfile.skills": skills } },
        { new: true },
      );
      res.json({ success: true, skills: user.candidateProfile.skills });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
