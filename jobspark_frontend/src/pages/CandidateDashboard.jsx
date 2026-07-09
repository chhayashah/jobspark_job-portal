import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { analyticsAPI, jobsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STATUS_COLORS = {
  applied: "#6B7280",
  shortlisted: "#3B82F6",
  interview_scheduled: "#8B5CF6",
  offered: "#10B981",
  rejected: "#EF4444",
};

const STATUS_LABELS = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function MatchScoreBadge({ score }) {
  const cls =
    score >= 80
      ? "excellent"
      : score >= 60
        ? "good"
        : score >= 40
          ? "partial"
          : "low";
  return <span className={`match-score ${cls}`}>{score}%</span>;
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useQuery(
    "candidateAnalytics",
    analyticsAPI.getCandidateAnalytics,
  );
  const { data: recommended } = useQuery(
    "recommendedJobs",
    jobsAPI.getRecommended,
    { retry: false },
  );

  if (isLoading)
    return (
      <div className="page">
        <div className="container">
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );

  const {
    overview = {},
    byStatus = {},
    applications = [],
    profileCompleteness = {},
  } = analytics || {};

  const statusData = Object.entries(byStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
    color: STATUS_COLORS[key] || "#6B7280",
  }));

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--gray-500)" }}>
            Here's your job search overview
          </p>
        </div>

        {/* Profile Completeness Banner */}
        {profileCompleteness.percentage < 80 && (
          <div
            style={{
              background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
              border: "1px solid #C7D2FE",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Complete your profile to get better matches</strong>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--gray-600)",
                  marginTop: 4,
                }}
              >
                Profile is {profileCompleteness.percentage}% complete.
                {profileCompleteness.missing?.length > 0 && (
                  <> Add: {profileCompleteness.missing.join(", ")}</>
                )}
              </p>
            </div>
            <Link to="/candidate/profile" className="btn btn-primary btn-sm">
              Complete Profile
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: "2rem" }}>
          {[
            {
              label: "Total Applications",
              value: overview.totalApplications || 0,
              color: "var(--primary)",
            },
            {
              label: "Avg Match Score",
              value: `${overview.avgMatchScore || 0}%`,
              color: "#10B981",
            },
            {
              label: "Shortlisted",
              value: overview.shortlisted || 0,
              color: "#3B82F6",
            },
            {
              label: "Interviews",
              value: overview.interviews || 0,
              color: "#8B5CF6",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="card stat-card">
              <div className="stat-number" style={{ color }}>
                {value}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: "2rem" }}>
          {/* Application Status Chart */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
              Applications by Status
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 0",
                  color: "var(--gray-500)",
                }}
              >
                No applications yet. <Link to="/jobs">Browse jobs</Link>
              </div>
            )}
          </div>

          {/* AI Recommended Jobs */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
              🤖 AI Recommended for You
            </h3>
            {recommended?.recommendations?.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {recommended.recommendations.slice(0, 4).map((job) => (
                  <Link
                    key={job.jobId}
                    to={`/jobs/${job.jobId}`}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "var(--gray-50)",
                      borderRadius: 8,
                      border: "1px solid var(--gray-200)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--gray-900)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {job.title}
                      </div>
                      <div
                        style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}
                      >
                        {job.company}
                      </div>
                    </div>
                    <MatchScoreBadge score={Math.round(job.score)} />
                  </Link>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 0",
                  color: "var(--gray-500)",
                }}
              >
                Complete your profile to get AI recommendations
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <h3 style={{ fontSize: "1rem" }}>Recent Applications</h3>
            <Link
              to="/candidate/applications"
              className="btn btn-secondary btn-sm"
            >
              View All
            </Link>
          </div>
          {applications.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--gray-200)" }}>
                    {[
                      "Job Title",
                      "Company",
                      "Status",
                      "Match Score",
                      "Applied On",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "var(--gray-700)",
                          fontSize: "0.82rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 8).map((app) => (
                    <tr
                      key={app.id}
                      style={{ borderBottom: "1px solid var(--gray-100)" }}
                    >
                      <td
                        style={{ padding: "0.85rem 0.75rem", fontWeight: 500 }}
                      >
                        <Link to={`/jobs/${app.job?.id}`}>
                          {app.job?.title || "—"}
                        </Link>
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "var(--gray-600)",
                        }}
                      >
                        {app.job?.company || "—"}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        <span
                          className={`badge ${app.status === "offered" || app.status === "hired" ? "badge-success" : app.status === "rejected" ? "badge-danger" : app.status === "shortlisted" ? "badge-primary" : "badge-gray"}`}
                        >
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        {app.matchScore > 0 ? (
                          <MatchScoreBadge score={Math.round(app.matchScore)} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "var(--gray-500)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {new Date(app.appliedOn).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--gray-500)",
              }}
            >
              No applications yet. <Link to="/jobs">Start applying!</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
