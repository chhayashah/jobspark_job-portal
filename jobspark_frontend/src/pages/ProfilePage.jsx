import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI, resumeAPI } from "../services/api";
import toast from "react-hot-toast";

const SKILL_SUGGESTIONS = [
  "javascript",
  "react",
  "nodejs",
  "python",
  "java",
  "typescript",
  "mongodb",
  "mysql",
  "docker",
  "aws",
  "git",
  "machine learning",
  "figma",
  "spring boot",
  "django",
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const profile = user?.candidateProfile || {};
  const fileRef = useRef();

  const [skillInput, setSkillInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    headline: profile.headline || "",
    summary: profile.summary || "",
    location: profile.location || "",
    experience: profile.experience || 0,
    expectedSalary: profile.expectedSalary || "",
    noticePeriod: profile.noticePeriod || "immediate",
    skills: profile.skills || [],
    linkedIn: profile.linkedIn || "",
    github: profile.github || "",
    portfolio: profile.portfolio || "",
  });

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const addSkill = (skill) => {
    const s = skill.trim().toLowerCase();
    if (s && !form.skills.includes(s)) set("skills", [...form.skills, s]);
    setSkillInput("");
  };

  const removeSkill = (s) =>
    set(
      "skills",
      form.skills.filter((sk) => sk !== s),
    );

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const data = await resumeAPI.upload(formData);
      toast.success(
        `Resume uploaded! Found ${data.parsed?.skills?.length || 0} skills`,
      );
      if (data.parsed?.skills?.length > 0) {
        set("skills", [...new Set([...form.skills, ...data.parsed.skills])]);
      }
      updateUser({
        candidateProfile: { ...profile, resumeUrl: data.resumeUrl },
      });
    } catch (err) {
      toast.error("Upload failed. Please try a PDF file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        candidateProfile: {
          headline: form.headline,
          summary: form.summary,
          location: form.location,
          experience: parseInt(form.experience),
          expectedSalary: parseInt(form.expectedSalary) || null,
          noticePeriod: form.noticePeriod,
          skills: form.skills,
          linkedIn: form.linkedIn,
          github: form.github,
          portfolio: form.portfolio,
        },
      });
      toast.success("Profile saved!");
      updateUser({ name: form.name });
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const completeness = () => {
    const fields = ["name", "headline", "summary", "location", "skills"];
    return Math.round(
      (fields.filter((f) => {
        const val = form[f];
        return val && (Array.isArray(val) ? val.length > 0 : val.trim());
      }).length /
        fields.length) *
        100,
    );
  };

  const pct = completeness();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>My Profile</h1>
            <p style={{ color: "var(--gray-500)" }}>
              Keep your profile updated for better AI matches
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>

        {/* Completeness bar */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Profile Strength
            </span>
            <span
              style={{
                fontWeight: 700,
                color:
                  pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444",
              }}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "var(--gray-200)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background:
                  pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444",
                borderRadius: 4,
                transition: "width 0.5s",
              }}
            />
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--gray-500)",
              marginTop: 6,
            }}
          >
            {pct < 80
              ? "Complete your profile to appear in more recruiter searches and get better AI matches."
              : "Great! Your profile is strong."}
          </p>
        </div>

        {/* Resume Upload */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            📄 Resume
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              {profile.resumeUrl ? (
                <div style={{ marginBottom: 8 }}>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    View Current Resume
                  </a>
                </div>
              ) : (
                <p
                  style={{
                    color: "var(--gray-500)",
                    fontSize: "0.875rem",
                    marginBottom: 8,
                  }}
                >
                  No resume uploaded yet
                </p>
              )}
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                style={{ display: "none" }}
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
              >
                {uploading
                  ? "⏳ Parsing & extracting skills..."
                  : "⬆️ Upload Resume (PDF)"}
              </button>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--gray-400)",
                  marginTop: 6,
                }}
              >
                AI will auto-extract your skills from the resume
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            Basic Information
          </h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Professional Headline</label>
            <input
              type="text"
              className="form-control"
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="e.g. Full Stack Developer with 3 years experience"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Summary</label>
            <textarea
              className="form-control"
              rows={4}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Brief professional summary..."
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Bangalore, India"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Expected Salary (Annual ₹)</label>
              <input
                type="number"
                className="form-control"
                value={form.expectedSalary}
                onChange={(e) => set("expectedSalary", e.target.value)}
                placeholder="e.g. 800000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notice Period</label>
              <select
                className="form-control"
                value={form.noticePeriod}
                onChange={(e) => set("noticePeriod", e.target.value)}
              >
                {["immediate", "15days", "30days", "60days", "90days"].map(
                  (n) => (
                    <option key={n} value={n}>
                      {n.replace("days", " days")}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            🛠️ Skills{" "}
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 400,
                color: "var(--gray-500)",
              }}
            >
              (used for AI matching)
            </span>
          </h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="form-control"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))
              }
              placeholder="Type a skill and press Enter..."
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => addSkill(skillInput)}
            >
              Add
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {form.skills.map((s) => (
              <span
                key={s}
                className="skill-tag"
                onClick={() => removeSkill(s)}
                style={{ cursor: "pointer" }}
              >
                {s} ✕
              </span>
            ))}
          </div>

          {/* Suggestions */}
          <div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--gray-500)",
                marginBottom: 6,
              }}
            >
              Quick add:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SKILL_SUGGESTIONS.filter((s) => !form.skills.includes(s)).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    style={{
                      padding: "0.2rem 0.65rem",
                      borderRadius: 999,
                      border: "1px dashed var(--gray-300)",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      color: "var(--gray-600)",
                    }}
                  >
                    + {s}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            🔗 Online Profiles
          </h2>
          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              className="form-control"
              value={form.linkedIn}
              onChange={(e) => set("linkedIn", e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
          <div className="form-group">
            <label className="form-label">GitHub</label>
            <input
              type="url"
              className="form-control"
              value={form.github}
              onChange={(e) => set("github", e.target.value)}
              placeholder="https://github.com/yourname"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Portfolio / Website</label>
            <input
              type="url"
              className="form-control"
              value={form.portfolio}
              onChange={(e) => set("portfolio", e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: "100%" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save All Changes"}
        </button>
      </div>
    </div>
  );
}
