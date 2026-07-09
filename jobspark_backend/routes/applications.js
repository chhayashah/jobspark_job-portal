const express = require("express");
const router = express.Router();
const appController = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../services/resumeService");

// Candidate routes
router.post(
  "/",
  protect,
  authorize("candidate"),
  upload.single("resume"),
  appController.applyToJob,
);
router.get(
  "/my",
  protect,
  authorize("candidate"),
  appController.getMyApplications,
);
router.put(
  "/:id/withdraw",
  protect,
  authorize("candidate"),
  appController.withdrawApplication,
);

// Recruiter routes
router.get(
  "/job/:jobId",
  protect,
  authorize("recruiter"),
  appController.getJobApplications,
);
router.get(
  "/job/:jobId/ranked",
  protect,
  authorize("recruiter"),
  appController.getRankedCandidates,
);
router.put(
  "/:id/status",
  protect,
  authorize("recruiter"),
  appController.updateApplicationStatus,
);
router.post(
  "/job/:jobId/auto-shortlist",
  protect,
  authorize("recruiter"),
  appController.autoShortlist,
);
router.post(
  "/compare",
  protect,
  authorize("recruiter"),
  appController.compareCandidates,
);

module.exports = router;
