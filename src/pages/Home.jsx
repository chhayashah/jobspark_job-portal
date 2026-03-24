// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useQuery } from "react-query";
// import { analyticsAPI, jobsAPI } from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const CATEGORIES = [
//   "Technology",
//   "Design",
//   "Marketing",
//   "Finance",
//   "HR",
//   "Operations",
//   "Sales",
//   "Data Science",
// ];

// export default function Home() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [search, setSearch] = useState("");
//   const { data: stats } = useQuery(
//     "platformStats",
//     analyticsAPI.getPlatformStats,
//   );
//   const { data: featuredJobs } = useQuery("featuredJobs", () =>
//     jobsAPI.getAll({ limit: 6, sort: "createdAt" }),
//   );

//   const handleSearch = (e) => {
//     e.preventDefault();
//     navigate(`/jobs?search=${encodeURIComponent(search)}`);
//   };

//   return (
//     <div>
//       {/* Hero */}
//       <section
//         style={{
//           background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
//           color: "#fff",
//           padding: "5rem 0 4rem",
//           textAlign: "center",
//         }}
//       >
//         <div className="container">
//           <div
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 8,
//               background: "rgba(255,255,255,0.15)",
//               padding: "0.4rem 1rem",
//               borderRadius: 999,
//               fontSize: "0.85rem",
//               marginBottom: "1.5rem",
//             }}
//           >
//             🤖 AI-Powered Resume Matching
//           </div>
//           <h1
//             style={{
//               fontSize: "clamp(2rem, 5vw, 3.5rem)",
//               fontWeight: 700,
//               marginBottom: "1rem",
//               lineHeight: 1.2,
//             }}
//           >
//             Find Your Perfect Job Match
//             <br />
//             with AI Intelligence
//           </h1>
//           <p
//             style={{
//               fontSize: "1.15rem",
//               opacity: 0.85,
//               maxWidth: 560,
//               margin: "0 auto 2.5rem",
//             }}
//           >
//             Upload your resume and let our AI match you with the best
//             opportunities based on your actual skills and experience.
//           </p>

//           {/* Search bar */}
//           <form
//             onSubmit={handleSearch}
//             style={{
//               display: "flex",
//               maxWidth: 580,
//               margin: "0 auto",
//               gap: 10,
//             }}
//           >
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search job title, skill, or company..."
//               style={{
//                 flex: 1,
//                 padding: "0.9rem 1.25rem",
//                 borderRadius: 10,
//                 border: "none",
//                 fontSize: "1rem",
//                 outline: "none",
//               }}
//             />
//             <button
//               type="submit"
//               className="btn btn-primary"
//               style={{
//                 background: "#F59E0B",
//                 color: "#000",
//                 fontWeight: 700,
//                 padding: "0.9rem 1.5rem",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               Search Jobs
//             </button>
//           </form>

//           {/* Platform stats */}
//           {stats?.stats && (
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 gap: "3rem",
//                 marginTop: "3rem",
//                 flexWrap: "wrap",
//               }}
//             >
//               {[
//                 { label: "Active Jobs", value: stats.stats.activeJobs },
//                 { label: "Companies", value: stats.stats.recruiters },
//                 { label: "Candidates", value: stats.stats.candidates },
//                 { label: "Hirings Done", value: stats.stats.hired },
//               ].map(({ label, value }) => (
//                 <div key={label} style={{ textAlign: "center" }}>
//                   <div style={{ fontSize: "2rem", fontWeight: 700 }}>
//                     {value?.toLocaleString()}
//                   </div>
//                   <div style={{ opacity: 0.75, fontSize: "0.9rem" }}>
//                     {label}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Categories */}
//       <section
//         style={{
//           padding: "3rem 0",
//           background: "#fff",
//           borderBottom: "1px solid var(--gray-200)",
//         }}
//       >
//         <div className="container">
//           <h2
//             style={{
//               textAlign: "center",
//               marginBottom: "1.75rem",
//               fontSize: "1.4rem",
//             }}
//           >
//             Browse by Category
//           </h2>
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: 12,
//               justifyContent: "center",
//             }}
//           >
//             {CATEGORIES.map((cat) => (
//               <Link
//                 key={cat}
//                 to={`/jobs?category=${encodeURIComponent(cat)}`}
//                 style={{
//                   padding: "0.6rem 1.25rem",
//                   borderRadius: 999,
//                   background: "var(--primary-light)",
//                   color: "var(--primary)",
//                   fontWeight: 500,
//                   fontSize: "0.9rem",
//                   textDecoration: "none",
//                   border: "1.5px solid transparent",
//                   transition: "0.2s",
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.target.style.borderColor = "var(--primary)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.target.style.borderColor = "transparent")
//                 }
//               >
//                 {cat}
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Featured Jobs */}
//       <section style={{ padding: "3.5rem 0" }}>
//         <div className="container">
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: "1.75rem",
//             }}
//           >
//             <h2 style={{ fontSize: "1.4rem" }}>Latest Opportunities</h2>
//             <Link to="/jobs" className="btn btn-outline btn-sm">
//               View All Jobs →
//             </Link>
//           </div>

//           <div className="grid-3">
//             {featuredJobs?.jobs?.slice(0, 6).map((job) => (
//               <Link
//                 key={job.id}
//                 to={`/jobs/${job.id}`}
//                 style={{ textDecoration: "none" }}
//               >
//                 <div
//                   className="card"
//                   style={{ height: "100%", cursor: "pointer" }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                       marginBottom: "0.75rem",
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: 44,
//                         height: 44,
//                         background: "var(--primary-light)",
//                         borderRadius: 10,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontWeight: 700,
//                         color: "var(--primary)",
//                         fontSize: "1rem",
//                       }}
//                     >
//                       {job.company?.[0]}
//                     </div>
//                     <span
//                       className={`badge ${job.jobType === "remote" ? "badge-success" : "badge-gray"}`}
//                     >
//                       {job.jobType}
//                     </span>
//                   </div>
//                   <h3
//                     style={{
//                       fontSize: "1rem",
//                       fontWeight: 600,
//                       marginBottom: 4,
//                       color: "var(--gray-900)",
//                     }}
//                   >
//                     {job.title}
//                   </h3>
//                   <p
//                     style={{
//                       fontSize: "0.875rem",
//                       color: "var(--gray-500)",
//                       marginBottom: "0.75rem",
//                     }}
//                   >
//                     {job.company} · {job.location}
//                   </p>
//                   {job.skills?.length > 0 && (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: 4,
//                         marginBottom: "0.75rem",
//                       }}
//                     >
//                       {job.skills.slice(0, 3).map((s) => (
//                         <span
//                           key={s}
//                           className="skill-tag"
//                           style={{ fontSize: "0.75rem" }}
//                         >
//                           {s}
//                         </span>
//                       ))}
//                       {job.skills.length > 3 && (
//                         <span
//                           className="skill-tag"
//                           style={{ fontSize: "0.75rem" }}
//                         >
//                           +{job.skills.length - 3}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                   {(job.salaryMin || job.salaryMax) && (
//                     <p
//                       style={{
//                         fontSize: "0.875rem",
//                         fontWeight: 600,
//                         color: "#10B981",
//                       }}
//                     >
//                       ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
//                       {(job.salaryMax / 100000).toFixed(1)}L/yr
//                     </p>
//                   )}
//                   <p
//                     style={{
//                       fontSize: "0.78rem",
//                       color: "var(--gray-400)",
//                       marginTop: "auto",
//                       paddingTop: "0.75rem",
//                     }}
//                   >
//                     {job.applicationCount} applicants ·{" "}
//                     {new Date(job.createdAt).toLocaleDateString("en-IN")}
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       {!user && (
//         <section
//           style={{
//             background: "var(--gray-900)",
//             color: "#fff",
//             padding: "4rem 0",
//             textAlign: "center",
//           }}
//         >
//           <div className="container">
//             <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
//               Ready to find your next role?
//             </h2>
//             <p
//               style={{
//                 opacity: 0.7,
//                 marginBottom: "2rem",
//                 fontSize: "1.05rem",
//               }}
//             >
//               Let AI match your resume with the best jobs. Free to use, always.
//             </p>
//             <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
//               <Link to="/register" className="btn btn-primary btn-lg">
//                 Get Started Free
//               </Link>
//               <Link
//                 to="/jobs"
//                 className="btn btn-secondary btn-lg"
//                 style={{
//                   background: "rgba(255,255,255,0.1)",
//                   color: "#fff",
//                   border: "1px solid rgba(255,255,255,0.2)",
//                 }}
//               >
//                 Browse Jobs
//               </Link>
//             </div>
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { analyticsAPI, jobsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

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

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: stats } = useQuery(
    "platformStats",
    analyticsAPI.getPlatformStats,
  );
  const { data: featuredJobs } = useQuery("featuredJobs", () =>
    jobsAPI.getAll({ limit: 6, sort: "createdAt" }),
  );

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          color: "#fff",
          padding: "5rem 0 4rem",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.15)",
              padding: "0.4rem 1rem",
              borderRadius: 999,
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            🤖 AI-Powered Resume Matching
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              marginBottom: "1rem",
              lineHeight: 1.2,
            }}
          >
            Find Your Perfect Job Match
            <br />
            with AI Intelligence
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              opacity: 0.85,
              maxWidth: 560,
              margin: "0 auto 2.5rem",
            }}
          >
            Upload your resume and let our AI match you with the best
            opportunities based on your actual skills and experience.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              maxWidth: 580,
              margin: "0 auto",
              gap: 10,
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title, skill, or company..."
              style={{
                flex: 1,
                padding: "0.9rem 1.25rem",
                borderRadius: 10,
                border: "none",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: "#F59E0B",
                color: "#000",
                fontWeight: 700,
                padding: "0.9rem 1.5rem",
                whiteSpace: "nowrap",
              }}
            >
              Search Jobs
            </button>
          </form>

          {/* Platform stats */}
          {stats?.stats && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "3rem",
                marginTop: "3rem",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Active Jobs", value: stats.stats.activeJobs },
                { label: "Companies", value: stats.stats.recruiters },
                { label: "Candidates", value: stats.stats.candidates },
                { label: "Hirings Done", value: stats.stats.hired },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                    {value?.toLocaleString()}
                  </div>
                  <div style={{ opacity: 0.75, fontSize: "0.9rem" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section
        style={{
          padding: "3rem 0",
          background: "#fff",
          borderBottom: "1px solid var(--gray-200)",
        }}
      >
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              marginBottom: "1.75rem",
              fontSize: "1.4rem",
            }}
          >
            Browse by Category
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/jobs?category=${encodeURIComponent(cat)}`}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: 999,
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  border: "1.5px solid transparent",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.borderColor = "var(--primary)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.borderColor = "transparent")
                }
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section style={{ padding: "3.5rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.75rem",
            }}
          >
            <h2 style={{ fontSize: "1.4rem" }}>Latest Opportunities</h2>
            <Link to="/jobs" className="btn btn-outline btn-sm">
              View All Jobs →
            </Link>
          </div>

          <div className="grid-3">
            {featuredJobs?.jobs?.slice(0, 6).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card"
                  style={{ height: "100%", cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.75rem",
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
                        fontSize: "1rem",
                      }}
                    >
                      {job.company?.[0]}
                    </div>
                    <span
                      className={`badge ${job.jobType === "remote" ? "badge-success" : "badge-gray"}`}
                    >
                      {job.jobType}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--gray-900)",
                    }}
                  >
                    {job.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--gray-500)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {job.company} · {job.location}
                  </p>
                  {job.skills?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginBottom: "0.75rem",
                      }}
                    >
                      {job.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="skill-tag"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span
                          className="skill-tag"
                          style={{ fontSize: "0.75rem" }}
                        >
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#10B981",
                      }}
                    >
                      ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
                      {(job.salaryMax / 100000).toFixed(1)}L/yr
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--gray-400)",
                      marginTop: "auto",
                      paddingTop: "0.75rem",
                    }}
                  >
                    {job.applicationCount} applicants ·{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section
          style={{
            background: "var(--gray-900)",
            color: "#fff",
            padding: "4rem 0",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Ready to find your next role?
            </h2>
            <p
              style={{
                opacity: 0.7,
                marginBottom: "2rem",
                fontSize: "1.05rem",
              }}
            >
              Let AI match your resume with the best jobs. Free to use, always.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link
                to="/jobs"
                className="btn btn-secondary btn-lg"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}