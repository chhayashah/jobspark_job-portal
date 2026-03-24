import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { resumeScoreAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

function CircleScore({ score }) {
  const color = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444";
  const label =
    score >= 80
      ? "Excellent"
      : score >= 70
        ? "Strong"
        : score >= 50
          ? "Average"
          : "Needs Work";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle
          cx={65}
          cy={65}
          r={54}
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth={10}
        />
        <circle
          cx={65}
          cy={65}
          r={54}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text
          x={65}
          y={60}
          textAnchor="middle"
          fontSize={28}
          fontWeight={700}
          fill={color}
          fontFamily="sans-serif"
        >
          {score}
        </text>
        <text
          x={65}
          y={80}
          textAnchor="middle"
          fontSize={11}
          fill="#9CA3AF"
          fontFamily="sans-serif"
        >
          out of 100
        </text>
      </svg>
      <span style={{ fontSize: "1rem", fontWeight: 600, color }}>
        {label} Resume
      </span>
    </div>
  );
}

const LEARNING_RESOURCES = {
  skills: {
    icon: "🛠️",
    link: "/candidate/profile",
    cta: "Add skills to profile",
  },
  experience: {
    icon: "💼",
    link: "/candidate/profile",
    cta: "Add work experience",
  },
  summary: {
    icon: "📝",
    link: "/candidate/profile",
    cta: "Write your summary",
  },
  education: { icon: "🎓", link: "/candidate/profile", cta: "Add education" },
  projects: {
    icon: "🚀",
    link: "/resume-versions",
    cta: "Upload resume with projects",
  },
  contact: {
    icon: "🔗",
    link: "/candidate/profile",
    cta: "Add LinkedIn & GitHub",
  },
};

export default function ResumeScorePage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery("resumeScore", resumeScoreAPI.getScore);
  const score = data?.score;

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

  if (!score)
    return (
      <div className="page">
        <div className="container">
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <p>
              Could not load resume score. Please complete your profile first.
            </p>
            <Link
              to="/candidate/profile"
              className="btn btn-primary"
              style={{ marginTop: 12 }}
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    );

  const { total, label, factors = [], suggestions = [] } = score;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>Resume Score</h1>
          <p style={{ color: "var(--gray-500)" }}>
            AI-powered analysis of your resume strength
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Left: Score + gauge */}
          <div>
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "2rem",
                marginBottom: "1rem",
              }}
            >
              <CircleScore score={total} />
              <div
                style={{
                  marginTop: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {[
                  { range: "80–100", label: "Excellent", color: "#10B981" },
                  { range: "60–79", label: "Good", color: "#3B82F6" },
                  { range: "40–59", label: "Average", color: "#F59E0B" },
                  { range: "0–39", label: "Needs Work", color: "#EF4444" },
                ].map((r) => (
                  <div
                    key={r.range}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      padding: "3px 8px",
                      borderRadius: 6,
                      background:
                        total >= parseInt(r.range)
                          ? `${r.color}15`
                          : "transparent",
                    }}
                  >
                    <span style={{ color: r.color, fontWeight: 600 }}>
                      {r.range}
                    </span>
                    <span style={{ color: "var(--gray-600)" }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <h4
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "var(--gray-700)",
                }}
              >
                Quick Actions
              </h4>
              <Link
                to="/candidate/profile"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                Update Profile
              </Link>
              <Link
                to="/resume-versions"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Manage Resumes
              </Link>
            </div>
          </div>

          {/* Right: Breakdown + suggestions */}
          <div>
            {/* Score Breakdown */}
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "1.25rem",
                }}
              >
                Score Breakdown
              </h3>
              {factors.map((f) => (
                <div key={f.name} style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {f.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--gray-400)",
                          marginLeft: 8,
                        }}
                      >
                        ({f.max} pts max)
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color:
                          f.points >= f.max * 0.7
                            ? "#10B981"
                            : f.points >= f.max * 0.4
                              ? "#F59E0B"
                              : "#EF4444",
                      }}
                    >
                      {f.points}/{f.max}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "var(--gray-100)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        width: `${(f.points / f.max) * 100}%`,
                        background:
                          f.points >= f.max * 0.7
                            ? "#10B981"
                            : f.points >= f.max * 0.4
                              ? "#F59E0B"
                              : "#EF4444",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                  {f.tip && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--gray-500)",
                        marginTop: 3,
                      }}
                    >
                      💡 {f.tip}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* AI Suggestions */}
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "1.25rem",
                }}
              >
                🤖 AI Improvement Suggestions
              </h3>
              {suggestions.length === 0 ? (
                <div
                  style={{
                    padding: "1.5rem",
                    background: "#D1FAE5",
                    borderRadius: 10,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎉</div>
                  <p style={{ color: "#065F46", fontWeight: 600 }}>
                    Your resume looks great! Keep it updated.
                  </p>
                </div>
              ) : (
                suggestions.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 14px",
                      background: "var(--gray-50)",
                      borderRadius: 9,
                      marginBottom: 8,
                      border: "1px solid var(--gray-200)",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                      💡
                    </span>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--gray-700)",
                        lineHeight: 1.6,
                      }}
                    >
                      {tip}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Industry benchmarks */}
            <div className="card">
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                📊 Industry Benchmarks
              </h3>
              {[
                {
                  label: "Top candidates have score",
                  value: "80+",
                  icon: "⭐",
                },
                {
                  label: "Tech roles avg skills listed",
                  value: "8–12",
                  icon: "🛠️",
                },
                {
                  label: "Recruiters spend per resume",
                  value: "7 sec",
                  icon: "⏱️",
                },
                {
                  label: "Keywords boost visibility",
                  value: "+40%",
                  icon: "📈",
                },
                {
                  label: "LinkedIn presence increases",
                  value: "+33%",
                  icon: "🔗",
                },
              ].map((b) => (
                <div
                  key={b.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--gray-50)",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "var(--gray-600)" }}>
                    {b.icon} {b.label}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                    {b.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
