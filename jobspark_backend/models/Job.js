const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/mysql");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recruiterId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "MongoDB User ID of recruiter",
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true, len: [5, 200] },
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    responsibilities: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    skills: {
      type: DataTypes.JSON, // array of required skills
      defaultValue: [],
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    jobType: {
      type: DataTypes.ENUM(
        "full-time",
        "part-time",
        "remote",
        "contract",
        "internship",
      ),
      defaultValue: "full-time",
    },
    experienceMin: { type: DataTypes.INTEGER, defaultValue: 0 },
    experienceMax: { type: DataTypes.INTEGER, defaultValue: 10 },
    salaryMin: { type: DataTypes.INTEGER, defaultValue: null },
    salaryMax: { type: DataTypes.INTEGER, defaultValue: null },
    currency: { type: DataTypes.STRING(10), defaultValue: "INR" },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "paused", "closed"),
      defaultValue: "active",
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    applicationCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    tags: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    tableName: "jobs",
    timestamps: true,
    indexes: [
      { fields: ["recruiterId"] },
      { fields: ["status"] },
      { fields: ["category"] },
      { fields: ["jobType"] },
      { type: "FULLTEXT", fields: ["title", "description"] },
    ],
  },
);

module.exports = Job;
