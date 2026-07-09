const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate",
    },
    avatar: { type: String, default: null },
    phone: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    // Candidate-specific fields
    candidateProfile: {
      headline: String,
      summary: String,
      location: String,
      experience: Number, // years
      currentSalary: Number,
      expectedSalary: Number,
      noticePeriod: {
        type: String,
        enum: ["immediate", "15days", "30days", "60days", "90days"],
      },
      skills: [String],
      preferredJobTypes: [
        {
          type: String,
          enum: ["full-time", "part-time", "remote", "contract", "internship"],
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          year: Number,
          grade: String,
        },
      ],
      experience_details: [
        {
          company: String,
          title: String,
          startDate: Date,
          endDate: Date,
          current: Boolean,
          description: String,
        },
      ],
      resumeUrl: String,
      resumeParsed: { type: mongoose.Schema.Types.Mixed, default: {} }, // parsed resume data
      linkedIn: String,
      github: String,
      portfolio: String,
    },

    // Recruiter-specific fields
    recruiterProfile: {
      company: String,
      companyWebsite: String,
      companySize: String,
      industry: String,
      designation: String,
      department: String,
    },
  },
  { timestamps: true },
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Index for search performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "candidateProfile.skills": 1 });

module.exports = mongoose.model("User", userSchema);
