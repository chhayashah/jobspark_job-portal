const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true }, // company-name → URL slug
    logo: { type: String, default: null },
    website: { type: String, default: "" },
    industry: { type: String, default: "" },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "11-50",
    },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    // Multi-tenant: all recruiters belonging to this company
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Branding
    primaryColor: { type: String, default: "#4F46E5" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },
    jobPostLimit: { type: Number, default: 5 },
  },
  { timestamps: true },
);

companySchema.index({ slug: 1 });
companySchema.index({ ownerId: 1 });

// Auto-generate slug from name
companySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Company", companySchema);
