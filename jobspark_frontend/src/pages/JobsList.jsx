import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { jobsAPI, advancedJobsAPI } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import SmartSearchBar from "../components/shared/SmartSearchBar";

const JOB_TYPES = [
  "full-time",
  "part-time",
  "remote",
  "contract",
  "internship",
];
const CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Data Science",
];

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ transition: "0.2s", cursor: "pointer" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--primary-light)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "var(--primary)",
                  flexShrink: 0,
                }}
              >
                {job.company?.[0]}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "0.975rem",
                    fontWeight: 600,
                    color: "var(--gray-900)",
                    marginBottom: 1,
                  }}
                >
                  {job.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                  {job.company} · {job.location}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 8,
              }}
            >
              {job.skills?.slice(0, 4).map((s) => (
                <span key={s} className="skill-tag">
                  {s}
                </span>
              ))}
              {job.skills?.length > 4 && (
                <span className="skill-tag">+{job.skills.length - 4}</span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                fontSize: "0.82rem",
                color: "var(--gray-500)",
              }}
            >
              <span>
                📅 {job.experienceMin}–{job.experienceMax} yrs
              </span>
              {job.salaryMin && (
                <span style={{ color: "#10B981", fontWeight: 600 }}>
                  ₹{(job.salaryMin / 100000).toFixed(1)}L–
                  {(job.salaryMax / 100000).toFixed(1)}L
                </span>
              )}
              <span>👥 {job.applicationCount} applied</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <span
              className={`badge ${job.jobType === "remote" ? "badge-success" : job.jobType === "internship" ? "badge-warning" : "badge-primary"}`}
            >
              {job.jobType}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
              {new Date(job.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function JobsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rawSearch, setRawSearch] = useState(searchParams.get("search") || "");
  const [isBooleanMode, setIsBooleanMode] = useState(
    !!searchParams.get("boolean"),
  );
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    boolean: searchParams.get("boolean") || "",
    category: searchParams.get("category") || "",
    jobType: "",
    location: "",
    page: 1,
  });

  // Debounce search for API calls
  const debouncedSearch = useDebounce(rawSearch, 450);
  useEffect(() => {
    setFilters((p) => ({ ...p, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Trending jobs
  const { data: trendingData } = useQuery(
    "trendingJobs",
    () => advancedJobsAPI.trending({ limit: 4 }),
    { staleTime: 5 * 60 * 1000 },
  );

  const { data, isLoading, isFetching } = useQuery(
    ["jobs", filters],
    () =>
      isBooleanMode
        ? advancedJobsAPI.booleanSearch({
            q: filters.boolean,
            page: filters.page,
          })
        : jobsAPI.getAll(filters),
    { keepPreviousData: true },
  );

  const setFilter = (key, val) =>
    setFilters((p) => ({ ...p, [key]: val, page: 1 }));

  return (
    <div className="page">
      <div className="container">
        {/* Trending Jobs strip */}
        {trendingData?.jobs?.length > 0 &&
          !filters.search &&
          !filters.boolean && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--gray-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
                🔥 Trending This Week
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {trendingData.jobs.slice(0, 4).map((j) => (
                  <Link
                    key={j.id}
                    to={`/jobs/${j.id}`}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      background: "#FEF3C7",
                      color: "#92400E",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      textDecoration: "none",
                      border: "1px solid #FCD34D",
                      transition: "0.15s",
                    }}
                  >
                    {j.title} · {j.recentApps} apps
                  </Link>
                ))}
              </div>
            </div>
          )}

        {/* Smart Search bar + filters */}
        <div
          style={{
            background: "#fff",
            padding: "1.25rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--gray-200)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <SmartSearchBar
              initialValue={rawSearch}
              placeholder="Search jobs, skills, or use Boolean: React AND Node NOT PHP"
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilter("location", e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
            />
            <select
              className="form-control"
              value={filters.jobType}
              onChange={(e) => setFilter("jobType", e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          {/* Results count */}
          <div style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
            {isLoading ? "Searching..." : `${data?.total || 0} jobs found`}
            {isFetching && !isLoading && " · Updating..."}
          </div>

          {/* Jobs */}
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="card"
                style={{
                  height: 120,
                  background: "var(--gray-100)",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))
          ) : data?.jobs?.length > 0 ? (
            data.jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div
              className="card"
              style={{ textAlign: "center", padding: "4rem" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <h3>No jobs found</h3>
              <p style={{ color: "var(--gray-500)", marginTop: 8 }}>
                Try adjusting your filters
              </p>
            </div>
          )}

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
                disabled={filters.page === 1}
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
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
                Page {filters.page} of {data.pages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={filters.page === data.pages}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
