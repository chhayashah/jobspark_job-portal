const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");
const Job = require("./Job");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "jobs", key: "id" },
    },
    candidateId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "MongoDB User ID",
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coverLetter: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM(
        "applied",
        "shortlisted",
        "interview_scheduled",
        "interviewed",
        "offered",
        "hired",
        "rejected",
        "withdrawn",
      ),
      defaultValue: "applied",
    },
    // AI matching fields
    matchScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "AI-computed match score 0-100",
    },
    matchedSkills: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Skills matched with job requirements",
    },
    missingSkills: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Skills in job but not in candidate resume",
    },
    matchDetails: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: "Detailed breakdown of match scoring",
    },
    // Recruiter actions
    recruiterNotes: { type: DataTypes.TEXT, defaultValue: "" },
    interviewDate: { type: DataTypes.DATE, allowNull: true },
    interviewMode: {
      type: DataTypes.ENUM("online", "offline", "phone"),
      allowNull: true,
    },
    offerAmount: { type: DataTypes.INTEGER, allowNull: true },
    // Tracking
    viewedByRecruiter: { type: DataTypes.BOOLEAN, defaultValue: false },
    viewedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "applications",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["jobId", "candidateId"] }, // one application per job per candidate
      { fields: ["candidateId"] },
      { fields: ["status"] },
      { fields: ["matchScore"] },
    ],
  },
);

// Associations
Application.belongsTo(Job, { foreignKey: "jobId" });
Job.hasMany(Application, { foreignKey: "jobId" });

module.exports = Application;
