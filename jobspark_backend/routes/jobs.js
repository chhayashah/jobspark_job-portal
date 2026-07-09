const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");
const { cache } = require("../middleware/cache");

// Public routes (with caching)
router.get("/", cache(120), jobController.getJobs);
router.get("/trending", cache(300), jobController.getTrendingJobs);
router.get("/autocomplete", cache(60), jobController.autocomplete);
router.get("/boolean-search", jobController.booleanSearch);
router.get(
  "/recommended",
  protect,
  authorize("candidate"),
  jobController.getRecommendedJobs,
);
router.get("/my", protect, authorize("recruiter"), jobController.getMyJobs);
router.get("/:id", cache(180), jobController.getJob);

// Protected routes
router.post("/", protect, authorize("recruiter"), jobController.createJob);
router.put("/:id", protect, authorize("recruiter"), jobController.updateJob);
router.delete("/:id", protect, authorize("recruiter"), jobController.deleteJob);

module.exports = router;
