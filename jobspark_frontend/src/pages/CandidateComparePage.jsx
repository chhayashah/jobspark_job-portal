import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import { applicationsAPI, advancedAppsAPI } from "../services/api";
import toast from "react-hot-toast";

export default function CandidateComparePage() {
  const { jobId } = useParams();
  const [selected, setSelected] = useState([]);
  const [threshold, setThreshold] = useState(70);
  const [autoResult, setAutoResult] = useState(null);

  const { data, isLoading } = useQuery(["jobApplications", jobId], () =>
    applicationsAPI.getJobApplications(jobId, {
      sortBy: "matchScore",
      order: "DESC",
    }),
  );
  const applications = data?.applications || [];

  const compareMutation = useMutation((ids) => advancedAppsAPI.compare(ids), {
    onError: () => toast.error("Comparison failed"),
  });

  const autoShortlistMutation = useMutation(
    ({ jobId, threshold }) => advancedAppsAPI.autoShortlist(jobId, threshold),
    {
      onSuccess: (d) => {
        setAutoResult(d);
        toast.success(d.message);
      },
      onError: () => toast.error("Auto-shortlist failed"),
    },
  );

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev,
    );
  };

  const comparisonData = compareMutation.data;
  const scoreColor = (s) =>
    s >= 80 ? "#10B981" : s >= 60 ? "#3B82F6" : s >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
            Candidate Intelligence
          </h1>
          <p style={{ color: "var(--gray-500)" }}>
            Compare candidates side-by-side and auto-shortlist by AI match score
          </p>
        </div>

        {/* Auto-Shortlist Panel */}
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            background: "#EEF2FF",
            border: "1px solid #C7D2FE",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "var(--primary)",
            }}
          >
            🤖 Auto-Shortlist Candidates
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--gray-600)",
              marginBottom: "1rem",
            }}
          >
            Automatically shortlist all candidates above a match score threshold
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Threshold: <strong>{threshold}%</strong>
              </label>
              <input
                type="range"
                min={40}
                max={95}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                style={{ flex: 1, maxWidth: 200 }}
              />
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
              {applications.filter((a) => a.matchScore >= threshold).length}{" "}
              candidates qualify
            </div>
            <button
              className="btn btn-primary"
              onClick={() => autoShortlistMutation.mutate({ jobId, threshold })}
              disabled={autoShortlistMutation.isLoading}
            >
              {autoShortlistMutation.isLoading
                ? "Shortlisting..."
                : `Auto-Shortlist above ${threshold}%`}
            </button>
          </div>
          {autoResult && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "10px 14px",
                background: "#D1FAE5",
                borderRadius: 8,
                fontSize: "0.875rem",
                color: "#065F46",
              }}
            >
              ✅ {autoResult.message}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Candidate selector */}
          <div className="card">
            <div style={{ marginBottom: "1rem" }}>
              <h3
                style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}
              >
                Select to Compare
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                Pick 2–5 candidates
              </p>
            </div>
            {isLoading ? (
              <div className="spinner-overlay">
                <div className="spinner" />
              </div>
            ) : applications.length === 0 ? (
              <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
                No applications yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {applications.map((app) => {
                  const isSelected = selected.includes(app.id);
                  return (
                    <div
                      key={app.id}
                      onClick={() => toggleSelect(app.id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 9,
                        cursor: "pointer",
                        border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--gray-200)"}`,
                        background: isSelected
                          ? "var(--primary-light)"
                          : "#fff",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${isSelected ? "var(--primary)" : "var(--gray-300)"}`,
                          background: isSelected ? "var(--primary)" : "#fff",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && (
                          <span style={{ color: "#fff", fontSize: 11 }}>✓</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {app.candidate?.name || "Candidate"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {app.candidate?.email}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: scoreColor(app.matchScore),
                          flexShrink: 0,
                        }}
                      >
                        {Math.round(app.matchScore)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selected.length >= 2 && (
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
                onClick={() => compareMutation.mutate(selected)}
                disabled={compareMutation.isLoading}
              >
                {compareMutation.isLoading
                  ? "Comparing..."
                  : `Compare ${selected.length} Candidates`}
              </button>
            )}
          </div>

          {/* Comparison table */}
          <div>
            {!comparisonData ? (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--gray-400)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>👈</div>
                <p>Select 2–5 candidates and click Compare</p>
              </div>
            ) : (
              <>
                {/* AI Recommendation */}
                {comparisonData.aiRecommendation && (
                  <div
                    style={{
                      background: "#D1FAE5",
                      border: "1px solid #6EE7B7",
                      borderRadius: 12,
                      padding: "1rem 1.25rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <h4
                      style={{
                        color: "#065F46",
                        fontSize: "0.95rem",
                        marginBottom: 4,
                      }}
                    >
                      🤖 AI Recommendation
                    </h4>
                    <p style={{ color: "#047857", fontSize: "0.875rem" }}>
                      Best candidate:{" "}
                      <strong>{comparisonData.aiRecommendation.name}</strong> —{" "}
                      {comparisonData.aiRecommendation.reason}
                    </p>
                  </div>
                )}

                {/* Comparison grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${comparisonData.candidates.length}, 1fr)`,
                    gap: 12,
                  }}
                >
                  {comparisonData.candidates.map((c, i) => (
                    <div
                      key={c.applicationId}
                      className="card"
                      style={{
                        border:
                          i === 0
                            ? "2px solid #10B981"
                            : "1px solid var(--gray-200)",
                      }}
                    >
                      {i === 0 && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "#10B981",
                            fontWeight: 700,
                            marginBottom: 8,
                          }}
                        >
                          🏆 TOP MATCH
                        </div>
                      )}

                      <div
                        style={{ textAlign: "center", marginBottom: "1rem" }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 8px",
                          }}
                        >
                          {c.candidate?.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          {c.candidate?.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {c.candidate?.email}
                        </div>
                      </div>

                      {/* Overall score */}
                      <div
                        style={{
                          textAlign: "center",
                          marginBottom: "1rem",
                          padding: "10px",
                          background: "var(--gray-50)",
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: scoreColor(c.matchScore),
                          }}
                        >
                          {Math.round(c.matchScore)}%
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          Overall Match
                        </div>
                      </div>

                      {/* Breakdown */}
                      {c.matchDetails && (
                        <div style={{ marginBottom: "1rem" }}>
                          {Object.entries(c.matchDetails).map(([key, val]) => (
                            <div key={key} style={{ marginBottom: 6 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "0.75rem",
                                  marginBottom: 2,
                                }}
                              >
                                <span
                                  style={{
                                    color: "var(--gray-500)",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {key}
                                </span>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: scoreColor(val),
                                  }}
                                >
                                  {val}%
                                </span>
                              </div>
                              <div
                                style={{
                                  height: 4,
                                  background: "var(--gray-100)",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${val}%`,
                                    background: scoreColor(val),
                                    borderRadius: 2,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      <div style={{ marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            marginBottom: 4,
                            color: "var(--gray-700)",
                          }}
                        >
                          Experience
                        </div>
                        <div style={{ fontSize: "0.875rem" }}>
                          {c.candidate?.experience || 0} years
                        </div>
                      </div>

                      <div style={{ marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            marginBottom: 4,
                            color: "var(--gray-700)",
                          }}
                        >
                          Matched Skills
                        </div>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                        >
                          {(c.matchedSkills || []).slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="skill-tag matched"
                              style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {(c.missingSkills || []).length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              marginBottom: 4,
                              color: "var(--gray-700)",
                            }}
                          >
                            Missing Skills
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 3,
                            }}
                          >
                            {c.missingSkills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="skill-tag missing"
                                style={{
                                  fontSize: "0.7rem",
                                  padding: "2px 6px",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
