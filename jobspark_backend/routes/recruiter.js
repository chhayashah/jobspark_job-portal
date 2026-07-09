// routes/recruiter.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");
const { avatarUpload } = require("../services/resumeService");

// Get recruiter dashboard summary
router.get(
  "/dashboard",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      const Job = require("../models/Job");
      const Application = require("../models/Application");
      const { Op } = require("sequelize");

      const jobs = await Job.findAll({ where: { recruiterId: req.user.id } });
      const jobIds = jobs.map((j) => j.id);

      const [totalApps, shortlisted, pending] = await Promise.all([
        Application.count({ where: { jobId: { [Op.in]: jobIds } } }),
        Application.count({
          where: { jobId: { [Op.in]: jobIds }, status: "shortlisted" },
        }),
        Application.count({
          where: { jobId: { [Op.in]: jobIds }, status: "applied" },
        }),
      ]);

      res.json({
        success: true,
        summary: {
          totalJobs: jobs.length,
          activeJobs: jobs.filter((j) => j.status === "active").length,
          totalApplications: totalApps,
          shortlisted,
          pendingReview: pending,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// Upload company logo / avatar
router.post(
  "/avatar",
  protect,
  authorize("recruiter"),
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

module.exports = router;
