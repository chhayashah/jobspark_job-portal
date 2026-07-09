import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { analyticsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const STATUS_LABELS = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useQuery(
    "recruiterAnalytics",
    analyticsAPI.getRecruiterAnalytics,
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
    applicationsByStatus = [],
    applicationTimeline = [],
    topJobs = [],
  } = analytics || {};

  const timelineData = applicationTimeline.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    Applications: parseInt(d.count),
  }));

  const statusChartData = applicationsByStatus.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    count: parseInt(s.count),
  }));

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
              Recruiter Dashboard
            </h1>
            <p style={{ color: "var(--gray-500)" }}>
              Manage your jobs and track candidates
            </p>
          </div>
          <Link to="/recruiter/jobs/new" className="btn btn-primary">
            + Post New Job
          </Link>
        </div>

        {/* KPI Grid */}
        <div className="grid-4" style={{ marginBottom: "2rem" }}>
          {[
            {
              label: "Total Jobs",
              value: overview.totalJobs || 0,
              color: "var(--primary)",
              sub: `${overview.activeJobs || 0} active`,
            },
            {
              label: "Total Applications",
              value: overview.totalApplications || 0,
              color: "#10B981",
              sub: "All time",
            },
            {
              label: "Total Views",
              value: overview.totalViews || 0,
              color: "#3B82F6",
              sub: "Job views",
            },
            {
              label: "Avg Match Score",
              value: `${overview.avgMatchScore || 0}%`,
              color: "#8B5CF6",
              sub: "AI score",
            },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="card stat-card">
              <div className="stat-number" style={{ color }}>
                {value}
              </div>
              <div className="stat-label">{label}</div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gray-500)",
                  marginTop: 4,
                }}
              >
                {sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: "2rem" }}>
          {/* Applications Timeline */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
              Applications (Last 30 Days)
            </h3>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--gray-200)"
                  />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="Applications"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 0",
                  color: "var(--gray-500)",
                }}
              >
                No applications yet
              </div>
            )}
          </div>

          {/* By Status */}
          <div className="card">
            <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem" }}>
              Applications by Stage
            </h3>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusChartData} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 0",
                  color: "var(--gray-500)",
                }}
              >
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <h3 style={{ fontSize: "1rem" }}>Your Job Postings</h3>
            <Link
              to="/recruiter/dashboard"
              className="btn btn-secondary btn-sm"
            >
              View All
            </Link>
          </div>
          {topJobs.length > 0 ? (
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
                      "Status",
                      "Applications",
                      "Views",
                      "Actions",
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
                  {topJobs.map((job) => (
                    <tr
                      key={job.id}
                      style={{ borderBottom: "1px solid var(--gray-100)" }}
                    >
                      <td
                        style={{ padding: "0.85rem 0.75rem", fontWeight: 500 }}
                      >
                        <div>{job.title}</div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {job.location} · {job.jobType}
                        </div>
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        <span
                          className={`badge ${job.status === "active" ? "badge-success" : job.status === "paused" ? "badge-warning" : "badge-gray"}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        {job.applicationCount}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 0.75rem",
                          color: "var(--gray-600)",
                        }}
                      >
                        {job.viewCount}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Link
                            to={`/recruiter/jobs/${job.id}/applications`}
                            className="btn btn-primary btn-sm"
                          >
                            Candidates
                          </Link>
                          <Link
                            to={`/recruiter/jobs/${job.id}/edit`}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </Link>
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
              No jobs posted yet.{" "}
              <Link to="/recruiter/jobs/new">Post your first job</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
