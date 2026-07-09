import React from "react";
import { useQuery } from "react-query";
import { analyticsAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function AnalyticsPage() {
  const { data: mostApplied } = useQuery("mostApplied", () =>
    analyticsAPI.getMostApplied({ limit: 10 }),
  );
  const { data: skillGaps } = useQuery("skillGaps", analyticsAPI.getSkillGaps);
  const { data: platform } = useQuery(
    "platformStats",
    analyticsAPI.getPlatformStats,
  );

  const {
    topDemandedSkills = [],
    topSuppliedSkills = [],
    skillGaps: gaps = [],
  } = skillGaps || {};

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
            Platform Analytics
          </h1>
          <p style={{ color: "var(--gray-500)" }}>
            Market insights and skill gap analysis
          </p>
        </div>

        {/* Platform Overview */}
        {platform?.stats && (
          <div className="grid-4" style={{ marginBottom: "2rem" }}>
            {[
              { label: "Active Jobs", value: platform.stats.activeJobs },
              { label: "Total Candidates", value: platform.stats.candidates },
              {
                label: "Applications",
                value: platform.stats.totalApplications,
              },
              { label: "Hiring Rate", value: `${platform.stats.hiringRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="card stat-card">
                <div className="stat-number">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: "2rem" }}>
          {/* Most Applied Jobs */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
              Most Applied Jobs
            </h3>
            {mostApplied?.jobs?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mostApplied.jobs} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 10 }}
                    width={110}
                  />
                  <Tooltip formatter={(val) => [val, "Applications"]} />
                  <Bar
                    dataKey="applicationCount"
                    fill="#4F46E5"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--gray-500)",
                }}
              >
                No data
              </div>
            )}
          </div>

          {/* Top Demanded Skills */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
              Most In-Demand Skills
            </h3>
            {topDemandedSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topDemandedSkills.slice(0, 10)}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--gray-500)",
                }}
              >
                No data
              </div>
            )}
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="card">
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
            Skill Gap Analysis
          </h3>
          <p
            style={{
              color: "var(--gray-500)",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            Skills with high employer demand but low candidate supply — biggest
            market opportunities
          </p>
          {gaps.length > 0 ? (
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
                      "Skill",
                      "Demand (Jobs)",
                      "Supply (Candidates)",
                      "Gap Score",
                      "Opportunity",
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
                  {gaps.map((g, i) => (
                    <tr
                      key={g.skill}
                      style={{ borderBottom: "1px solid var(--gray-100)" }}
                    >
                      <td
                        style={{ padding: "0.85rem 0.75rem", fontWeight: 600 }}
                      >
                        {g.skill}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "var(--primary)",
                        }}
                      >
                        {g.demand}
                      </td>
                      <td
                        style={{ padding: "0.85rem 0.75rem", color: "#10B981" }}
                      >
                        {g.supply}
                      </td>
                      <td
                        style={{ padding: "0.85rem 0.75rem", fontWeight: 700 }}
                      >
                        <span
                          className={`badge ${g.gapScore > 5 ? "badge-danger" : g.gapScore > 2 ? "badge-warning" : "badge-success"}`}
                        >
                          {g.gapScore}x
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        <div
                          style={{
                            height: 8,
                            borderRadius: 4,
                            background: "var(--gray-200)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, g.gapScore * 10)}%`,
                              background:
                                g.gapScore > 5
                                  ? "var(--danger)"
                                  : g.gapScore > 2
                                    ? "#F59E0B"
                                    : "#10B981",
                              borderRadius: 4,
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
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
              Not enough data for skill gap analysis yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
