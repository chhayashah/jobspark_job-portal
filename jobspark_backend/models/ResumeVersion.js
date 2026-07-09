const mongoose = require("mongoose");

const resumeVersionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    version: { type: Number, required: true }, // 1, 2, 3 ...
    label: { type: String, default: "" }, // "React-focused", "ML Engineer v2"
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    fileSize: { type: Number },
    parsedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    skills: [String],
    resumeScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // which version is currently "primary"
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

resumeVersionSchema.index({ userId: 1, version: -1 });

module.exports = mongoose.model("ResumeVersion", resumeVersionSchema);
