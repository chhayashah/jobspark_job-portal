/**
 * Notification Service
 * Handles in-app + real-time Socket.io + email notifications
 */
const Notification = require("../models/Notification");
const emailService = require("./emailService");
const logger = require("../utils/logger");

// ─── Create & emit notification ───────────────────────────────────────────────
const notify = async (
  io,
  {
    userId,
    type,
    title,
    message,
    link = null,
    metadata = {},
    sendEmail = false,
    email = null,
  },
) => {
  try {
    const notif = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata,
    });

    // Real-time push via Socket.io
    if (io)
      io.to(userId.toString()).emit("notification", {
        id: notif._id,
        type,
        title,
        message,
        link,
        createdAt: notif.createdAt,
      });

    // Email (non-blocking)
    if (sendEmail && email) {
      emailService
        .sendGenericEmail(email, title, message)
        .catch((e) => logger.warn("Email failed:", e.message));
    }

    return notif;
  } catch (err) {
    logger.error("Notification error:", err.message);
  }
};

// ─── Convenience helpers ─────────────────────────────────────────────────────
const notifyNewApplication = (
  io,
  { recruiterId, candidateName, jobTitle, jobId, applicationId },
) =>
  notify(io, {
    userId: recruiterId,
    type: "application",
    title: "New Application Received",
    message: `${candidateName} applied for "${jobTitle}"`,
    link: `/recruiter/jobs/${jobId}/applications`,
    metadata: { applicationId },
  });

const notifyStatusUpdate = (
  io,
  { candidateId, candidateEmail, jobTitle, status, jobId },
) =>
  notify(io, {
    userId: candidateId,
    type: "status_update",
    title: `Application Update — ${jobTitle}`,
    message: statusMessage(status, jobTitle),
    link: `/candidate/applications`,
    sendEmail: true,
    email: candidateEmail,
    metadata: { jobId, status },
  });

const notifyJobAlert = (
  io,
  { candidateId, jobTitle, company, jobId, matchScore },
) =>
  notify(io, {
    userId: candidateId,
    type: "job_alert",
    title: "New Job Match Alert",
    message: `"${jobTitle}" at ${company} — ${matchScore}% match`,
    link: `/jobs/${jobId}`,
    metadata: { jobId, matchScore },
  });

const statusMessage = (status, jobTitle) => {
  const messages = {
    shortlisted: `You've been shortlisted for "${jobTitle}"! 🎉`,
    interview_scheduled: `An interview has been scheduled for "${jobTitle}"`,
    interviewed: `Thank you for the interview for "${jobTitle}"`,
    offered: `Congratulations! You have an offer for "${jobTitle}" 🎊`,
    hired: `You have been hired for "${jobTitle}"! Welcome aboard 🚀`,
    rejected: `Your application for "${jobTitle}" was not selected this time`,
  };
  return (
    messages[status] ||
    `Your application status for "${jobTitle}" has been updated to: ${status}`
  );
};

module.exports = {
  notify,
  notifyNewApplication,
  notifyStatusUpdate,
  notifyJobAlert,
};
