import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { applicationsAPI } from "../services/api";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offered: "🎉 Offered",
  hired: "✅ Hired",
  rejected: "Not Selected",
  withdrawn: "Withdrawn",
};

const STATUS_BADGE = {
  applied: "badge-gray",
  shortlisted: "badge-primary",
  interview_scheduled: "badge-primary",
  offered: "badge-success",
  hired: "badge-success",
  rejected: "badge-danger",
  withdrawn: "badge-gray",
};

function MatchBar({ score }) {
  const color =
    score >= 80
      ? "#10B981"
      : score >= 60
        ? "#3B82F6"
        : score >= 40
          ? "#F59E0B"
          : "#EF4444";
  const label =
    score >= 80
      ? "Excellent"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Partial"
          : "Low";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--gray-200)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.5s",
          }}
        />
      </div>
      <span
        style={{ fontSize: "0.8rem", fontWeight: 600, color, minWidth: 28 }}
      >
        {Math.round(score)}%
      </span>
      <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
        {label}
      </span>
    </div>
  );
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ["myApplications", statusFilter, page],
    () =>
      applicationsAPI.getMyApplications({
        status: statusFilter,
        page,
        limit: 10,
      }),
    { keepPreviousData: true },
  );

  const withdrawMutation = useMutation((id) => applicationsAPI.withdraw(id), {
    onSuccess: () => {
      toast.success("Application withdrawn");
      queryClient.invalidateQueries("myApplications");
    },
  });

  const applications = data?.applications || [];

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
            My Applications
          </h1>
          <p style={{ color: "var(--gray-500)" }}>
            Track all your job applications and AI match scores
          </p>
        </div>

        {/* Filter */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          {[
            "",
            "applied",
            "shortlisted",
            "interview_scheduled",
            "offered",
            "hired",
            "rejected",
          ].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {s ? STATUS_LABELS[s] : "All"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        ) : applications.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "4rem" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <h3>No applications yet</h3>
            <p style={{ color: "var(--gray-500)", marginTop: 8 }}>
              <Link to="/jobs">Browse jobs</Link> and start applying!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications.map((app) => (
              <div key={app.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          background: "var(--primary-light)",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: "var(--primary)",
                          flexShrink: 0,
                        }}
                      >
                        {app.Job?.company?.[0] || "?"}
                      </div>
                      <div>
                        <Link
                          to={`/jobs/${app.Job?.id}`}
                          style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "var(--gray-900)",
                          }}
                        >
                          {app.Job?.title || "—"}
                        </Link>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {app.Job?.company} · {app.Job?.location}
                        </p>
                      </div>
                    </div>

                    {app.matchScore > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--gray-500)",
                            marginBottom: 4,
                          }}
                        >
                          AI Match Score
                        </p>
                        <MatchBar score={app.matchScore} />
                      </div>
                    )}

                    {app.matchedSkills?.length > 0 && (
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                      >
                        {app.matchedSkills.slice(0, 4).map((s) => (
                          <span key={s} className="skill-tag matched">
                            {s}
                          </span>
                        ))}
                        {app.missingSkills?.slice(0, 2).map((s) => (
                          <span key={s} className="skill-tag missing">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                    }}
                  >
                    <span
                      className={`badge ${STATUS_BADGE[app.status] || "badge-gray"}`}
                    >
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                    <span
                      style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}
                    >
                      Applied{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    {app.interviewDate && (
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color: "#8B5CF6",
                          fontWeight: 500,
                        }}
                      >
                        📅 Interview:{" "}
                        {new Date(app.interviewDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </span>
                    )}
                    {["applied", "shortlisted"].includes(app.status) && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          window.confirm("Withdraw this application?") &&
                          withdrawMutation.mutate(app.id)
                        }
                        disabled={withdrawMutation.isLoading}
                        style={{ fontSize: "0.78rem", color: "var(--danger)" }}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data?.pages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: "1rem",
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span
                  style={{
                    padding: "0.4rem 1rem",
                    fontSize: "0.9rem",
                    color: "var(--gray-600)",
                  }}
                >
                  Page {page} of {data.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
