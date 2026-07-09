const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.get("/platform", analyticsController.getPlatformStats);
router.get("/most-applied", analyticsController.getMostAppliedJobs);
router.get("/skill-gaps", analyticsController.getSkillGapAnalysis);
router.get(
  "/recruiter",
  protect,
  authorize("recruiter"),
  analyticsController.getRecruiterAnalytics,
);
router.get(
  "/candidate",
  protect,
  authorize("candidate"),
  analyticsController.getCandidateAnalytics,
);

module.exports = router;
