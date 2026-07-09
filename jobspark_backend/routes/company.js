const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const Company = require("../models/Company");
const User = require("../models/User");
const Job = require("../models/Job");

// GET company by slug (public)
router.get("/:slug", async (req, res, next) => {
  try {
    const company = await Company.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("ownerId", "name email");
    if (!company)
      return res
        .status(404)
        .json({ success: false, error: "Company not found" });
    const jobs = await Job.findAll({
      where: { recruiterId: company.ownerId._id.toString(), status: "active" },
      limit: 10,
    });
    res.json({ success: true, company, activeJobs: jobs });
  } catch (err) {
    next(err);
  }
});

// POST create company (recruiter)
router.post("/", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    const existing = await Company.findOne({ ownerId: req.user.id });
    if (existing)
      return res
        .status(409)
        .json({ success: false, error: "You already have a company profile" });

    const company = await Company.create({
      ...req.body,
      ownerId: req.user.id,
      members: [req.user.id],
    });
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        "recruiterProfile.company": company.name,
        "recruiterProfile.companyId": company._id,
      },
    });
    res.status(201).json({ success: true, company });
  } catch (err) {
    next(err);
  }
});

// PUT update company
router.put("/:id", protect, authorize("recruiter"), async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: req.body },
      { new: true },
    );
    if (!company)
      return res
        .status(404)
        .json({ success: false, error: "Not found or unauthorized" });
    res.json({ success: true, company });
  } catch (err) {
    next(err);
  }
});

// POST invite team member (multi-tenant)
router.post(
  "/:id/invite",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const company = await Company.findOne({
        _id: req.params.id,
        ownerId: req.user.id,
      });
      if (!company)
        return res.status(404).json({ success: false, error: "Unauthorized" });

      const invitee = await User.findOne({ email, role: "recruiter" });
      if (!invitee)
        return res
          .status(404)
          .json({
            success: false,
            error: "Recruiter with this email not found",
          });
      if (company.members.includes(invitee._id))
        return res
          .status(409)
          .json({ success: false, error: "Already a member" });

      company.members.push(invitee._id);
      await company.save();
      res.json({
        success: true,
        message: `${invitee.name} added to ${company.name}`,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET my company
router.get(
  "/my/profile",
  protect,
  authorize("recruiter"),
  async (req, res, next) => {
    try {
      const company = await Company.findOne({ ownerId: req.user.id });
      res.json({ success: true, company });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
