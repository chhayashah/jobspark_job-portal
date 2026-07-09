import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { jobsAPI } from "../services/api";
import toast from "react-hot-toast";

const JOB_TYPES = [
  "full-time",
  "part-time",
  "remote",
  "contract",
  "internship",
];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState(null);

  const { data, isLoading } = useQuery(["job", id], () => jobsAPI.getOne(id));

  useEffect(() => {
    if (data?.job) {
      const j = data.job;
      setForm({
        title: j.title || "",
        description: j.description || "",
        requirements: j.requirements || "",
        responsibilities: j.responsibilities || "",
        skills: j.skills || [],
        location: j.location || "",
        jobType: j.jobType || "full-time",
        category: j.category || "",
        experienceMin: j.experienceMin || 0,
        experienceMax: j.experienceMax || 5,
        salaryMin: j.salaryMin || "",
        salaryMax: j.salaryMax || "",
        status: j.status || "active",
        applicationDeadline: j.applicationDeadline
          ? j.applicationDeadline.slice(0, 10)
          : "",
      });
    }
  }, [data]);

  if (isLoading || !form)
    return (
      <div className="page">
        <div className="container">
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !form.skills.includes(s)) set("skills", [...form.skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s) =>
    set(
      "skills",
      form.skills.filter((sk) => sk !== s),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await jobsAPI.update(id, {
        ...form,
        salaryMin: parseInt(form.salaryMin) || null,
        salaryMax: parseInt(form.salaryMax) || null,
      });
      toast.success("Job updated!");
      navigate(`/recruiter/jobs/${id}/applications`);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 4 }}>Edit Job</h1>
            <p style={{ color: "var(--gray-500)" }}>{data?.job?.title}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              className="form-control"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            Basic Info
          </h2>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              className="form-control"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select
                className="form-control"
                value={form.jobType}
                onChange={(e) => set("jobType", e.target.value)}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            Description & Requirements
          </h2>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Requirements</label>
            <textarea
              className="form-control"
              rows={4}
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            Skills & Experience
          </h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              className="form-control"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
              placeholder="Add skill..."
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addSkill}
            >
              Add
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: "1rem",
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
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Min Experience (yrs)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={form.experienceMin}
                onChange={(e) => set("experienceMin", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Experience (yrs)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={form.experienceMax}
                onChange={(e) => set("experienceMax", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>
            Salary & Deadline
          </h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Min Salary (₹)</label>
              <input
                type="number"
                className="form-control"
                value={form.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Salary (₹)</label>
              <input
                type="number"
                className="form-control"
                value={form.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Application Deadline</label>
            <input
              type="date"
              className="form-control"
              value={form.applicationDeadline}
              onChange={(e) => set("applicationDeadline", e.target.value)}
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
