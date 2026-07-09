const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"JobSpark Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = (email, name) =>
  sendMail({
    to: email,
    subject: "Welcome to JobSpark — Your Job Journey Begins!",
    html: `<h2>Welcome, ${name}!</h2><p>Your account is ready. Start exploring jobs or posting opportunities today.</p>`,
  });

const sendApplicationNotification = (recruiterEmail, candidateName, jobTitle) =>
  sendMail({
    to: recruiterEmail,
    subject: `New Application: ${jobTitle}`,
    html: `<p><strong>${candidateName}</strong> has applied for <strong>${jobTitle}</strong>. Log in to review their profile and AI match score.</p>`,
  });

const sendStatusUpdateEmail = (
  candidateEmail,
  candidateName,
  jobTitle,
  status,
) => {
  const messages = {
    shortlisted: `Great news! You've been shortlisted for <strong>${jobTitle}</strong>.`,
    interview_scheduled: `An interview has been scheduled for <strong>${jobTitle}</strong>. Check your dashboard for details.`,
    offered: `Congratulations! You've received an offer for <strong>${jobTitle}</strong>!`,
    rejected: `Thank you for applying to <strong>${jobTitle}</strong>. Unfortunately, you weren't selected this time. Keep applying!`,
  };
  return sendMail({
    to: candidateEmail,
    subject: `Application Update: ${jobTitle}`,
    html: `<p>Hi ${candidateName},</p><p>${messages[status] || `Your application status has been updated to: ${status}`}</p>`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendApplicationNotification,
  sendStatusUpdateEmail,
};

const sendGenericEmail = (to, subject, text) =>
  sendMail({
    to,
    subject,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#1a1a2e">${subject}</h2>
      <p style="color:#374151;line-height:1.7">${text}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="font-size:12px;color:#9ca3af">JobSpark · Unsubscribe anytime from your profile settings</p>
    </div>`,
  });

module.exports = {
  sendWelcomeEmail,
  sendApplicationNotification,
  sendStatusUpdateEmail,
  sendGenericEmail,
};
