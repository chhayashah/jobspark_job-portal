// import React, { useState, useRef } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "react-query";
// import { jobsAPI, applicationsAPI, resumeAPI } from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";

// export default function JobDetail() {
//   const { id } = useParams();
//   const { user, isCandidate } = useAuth();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const fileRef = useRef();

//   const [coverLetter, setCoverLetter] = useState("");
//   const [resumeFile, setResumeFile] = useState(null);
//   const [applying, setApplying] = useState(false);
//   const [matchResult, setMatchResult] = useState(null);
//   const [showApplyForm, setShowApplyForm] = useState(false);

//   const { data, isLoading } = useQuery(["job", id], () => jobsAPI.getOne(id));
//   const { data: skillGapData } = useQuery(
//     ["skillGap", id],
//     () => resumeAPI.getSkillGap(id),
//     { enabled: !!user && isCandidate },
//   );

//   const job = data?.job;

//   const handleApply = async (e) => {
//     e.preventDefault();
//     if (!user) {
//       navigate("/login");
//       return;
//     }
//     setApplying(true);
//     try {
//       const formData = new FormData();
//       formData.append("jobId", id);
//       formData.append("coverLetter", coverLetter);
//       if (resumeFile) formData.append("resume", resumeFile);

//       const res = await applicationsAPI.apply(formData);
//       setMatchResult(res.matchResult);
//       setShowApplyForm(false);
//       toast.success("Application submitted successfully!");
//       queryClient.invalidateQueries("candidateAnalytics");
//     } catch (err) {
//       if (err.response?.status === 409)
//         toast.error("You have already applied to this job");
//     } finally {
//       setApplying(false);
//     }
//   };

//   if (isLoading)
//     return (
//       <div className="page">
//         <div className="container">
//           <div className="spinner-overlay">
//             <div className="spinner" />
//           </div>
//         </div>
//       </div>
//     );
//   if (!job)
//     return (
//       <div className="page">
//         <div className="container">
//           <p>Job not found.</p>
//         </div>
//       </div>
//     );

//   const skillGap = skillGapData?.gap;

//   return (
//     <div className="page">
//       <div className="container">
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 340px",
//             gap: "2rem",
//             alignItems: "start",
//           }}
//         >
//           {/* Main content */}
//           <div>
//             {/* Job header card */}
//             <div className="card" style={{ marginBottom: "1.5rem" }}>
//               <div
//                 style={{
//                   display: "flex",
//                   gap: 16,
//                   alignItems: "flex-start",
//                   marginBottom: "1.25rem",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 56,
//                     height: 56,
//                     background: "var(--primary-light)",
//                     borderRadius: 12,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "1.4rem",
//                     fontWeight: 700,
//                     color: "var(--primary)",
//                     flexShrink: 0,
//                   }}
//                 >
//                   {job.company?.[0]}
//                 </div>
//                 <div>
//                   <h1
//                     style={{
//                       fontSize: "1.5rem",
//                       fontWeight: 700,
//                       marginBottom: 4,
//                     }}
//                   >
//                     {job.title}
//                   </h1>
//                   <p style={{ color: "var(--gray-600)", fontSize: "0.95rem" }}>
//                     {job.company} · {job.location}
//                   </p>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: 10,
//                   fontSize: "0.875rem",
//                 }}
//               >
//                 <span className="badge badge-primary">{job.jobType}</span>
//                 <span className="badge badge-gray">
//                   📅 {job.experienceMin}–{job.experienceMax} yrs exp
//                 </span>
//                 {job.salaryMin && (
//                   <span className="badge badge-success">
//                     ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
//                     {(job.salaryMax / 100000).toFixed(1)}L/yr
//                   </span>
//                 )}
//                 {job.applicationDeadline && (
//                   <span className="badge badge-warning">
//                     Deadline:{" "}
//                     {new Date(job.applicationDeadline).toLocaleDateString(
//                       "en-IN",
//                     )}
//                   </span>
//                 )}
//                 <span className="badge badge-gray">
//                   👥 {job.applicationCount} applicants
//                 </span>
//               </div>
//             </div>

//             {/* AI Match Result */}
//             {matchResult && (
//               <div
//                 style={{
//                   background: "#D1FAE5",
//                   border: "1px solid #6EE7B7",
//                   borderRadius: "var(--radius-lg)",
//                   padding: "1.25rem",
//                   marginBottom: "1.5rem",
//                 }}
//               >
//                 <h3 style={{ color: "#065F46", marginBottom: "0.75rem" }}>
//                   ✅ Application Submitted — AI Match Score
//                 </h3>
//                 <div
//                   style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}
//                 >
//                   <div style={{ textAlign: "center" }}>
//                     <div
//                       style={{
//                         fontSize: "2.5rem",
//                         fontWeight: 700,
//                         color: "#059669",
//                       }}
//                     >
//                       {matchResult.score}%
//                     </div>
//                     <div style={{ fontSize: "0.8rem", color: "#065F46" }}>
//                       {matchResult.rating?.label}
//                     </div>
//                   </div>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>
//                       <strong>Matched skills:</strong>{" "}
//                       {matchResult.matchedSkills.length > 0
//                         ? matchResult.matchedSkills.map((s) => (
//                             <span key={s} className="skill-tag matched">
//                               {s}
//                             </span>
//                           ))
//                         : "None matched"}
//                     </div>
//                     <div style={{ fontSize: "0.85rem" }}>
//                       <strong>Missing skills:</strong>{" "}
//                       {matchResult.missingSkills.length > 0
//                         ? matchResult.missingSkills.map((s) => (
//                             <span key={s} className="skill-tag missing">
//                               {s}
//                             </span>
//                           ))
//                         : "None — great match!"}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Description */}
//             <div className="card" style={{ marginBottom: "1.5rem" }}>
//               <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
//                 Job Description
//               </h2>
//               <p
//                 style={{
//                   color: "var(--gray-700)",
//                   lineHeight: 1.8,
//                   whiteSpace: "pre-wrap",
//                 }}
//               >
//                 {job.description}
//               </p>
//             </div>

//             <div className="card" style={{ marginBottom: "1.5rem" }}>
//               <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
//                 Requirements
//               </h2>
//               <p
//                 style={{
//                   color: "var(--gray-700)",
//                   lineHeight: 1.8,
//                   whiteSpace: "pre-wrap",
//                 }}
//               >
//                 {job.requirements}
//               </p>
//             </div>

//             {/* Required Skills */}
//             {job.skills?.length > 0 && (
//               <div className="card" style={{ marginBottom: "1.5rem" }}>
//                 <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
//                   Required Skills
//                 </h2>
//                 <div style={{ display: "flex", flexWrap: "wrap" }}>
//                   {job.skills.map((skill) => {
//                     const isMatched = skillGap?.matched?.includes(
//                       skill.toLowerCase(),
//                     );
//                     const isMissing = skillGap?.missing?.includes(
//                       skill.toLowerCase(),
//                     );
//                     return (
//                       <span
//                         key={skill}
//                         className={`skill-tag ${isMatched ? "matched" : isMissing ? "missing" : ""}`}
//                       >
//                         {isMatched ? "✓ " : isMissing ? "✗ " : ""}
//                         {skill}
//                       </span>
//                     );
//                   })}
//                 </div>
//                 {skillGap && (
//                   <p
//                     style={{
//                       fontSize: "0.8rem",
//                       color: "var(--gray-500)",
//                       marginTop: "0.75rem",
//                     }}
//                   >
//                     🟢 Matched skills · 🔴 Skills you're missing
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div style={{ position: "sticky", top: 80 }}>
//             {/* Apply CTA */}
//             {!matchResult && (
//               <div className="card" style={{ marginBottom: "1.25rem" }}>
//                 {isCandidate ? (
//                   <>
//                     {!showApplyForm ? (
//                       <button
//                         className="btn btn-primary btn-lg"
//                         style={{ width: "100%" }}
//                         onClick={() => setShowApplyForm(true)}
//                       >
//                         Apply Now
//                       </button>
//                     ) : (
//                       <form onSubmit={handleApply}>
//                         <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
//                           Submit Application
//                         </h3>
//                         <div className="form-group">
//                           <label className="form-label">Resume (PDF)</label>
//                           <input
//                             type="file"
//                             accept=".pdf,.doc,.docx"
//                             ref={fileRef}
//                             onChange={(e) => setResumeFile(e.target.files[0])}
//                             className="form-control"
//                           />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">
//                             Cover Letter (optional)
//                           </label>
//                           <textarea
//                             className="form-control"
//                             rows={4}
//                             placeholder="Tell the recruiter why you're a great fit..."
//                             value={coverLetter}
//                             onChange={(e) => setCoverLetter(e.target.value)}
//                           />
//                         </div>
//                         <button
//                           type="submit"
//                           className="btn btn-primary"
//                           style={{ width: "100%" }}
//                           disabled={applying}
//                         >
//                           {applying
//                             ? "Submitting & Matching..."
//                             : "🤖 Apply with AI Match"}
//                         </button>
//                         <button
//                           type="button"
//                           className="btn btn-secondary"
//                           style={{ width: "100%", marginTop: 8 }}
//                           onClick={() => setShowApplyForm(false)}
//                         >
//                           Cancel
//                         </button>
//                       </form>
//                     )}
//                     {skillGap && (
//                       <div
//                         style={{
//                           marginTop: "1rem",
//                           padding: "0.75rem",
//                           background: "var(--gray-50)",
//                           borderRadius: 8,
//                           fontSize: "0.82rem",
//                         }}
//                       >
//                         <strong>Your Match Preview:</strong>
//                         <br />✅ {skillGap.matched.length} skills matched · ❌{" "}
//                         {skillGap.missing.length} missing
//                       </div>
//                     )}
//                   </>
//                 ) : !user ? (
//                   <Link
//                     to="/login"
//                     className="btn btn-primary btn-lg"
//                     style={{
//                       width: "100%",
//                       display: "block",
//                       textAlign: "center",
//                     }}
//                   >
//                     Login to Apply
//                   </Link>
//                 ) : null}
//               </div>
//             )}

//             {/* Job summary */}
//             <div className="card">
//               <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
//                 Job Summary
//               </h3>
//               {[
//                 { label: "Category", value: job.category },
//                 { label: "Job Type", value: job.jobType },
//                 { label: "Location", value: job.location },
//                 {
//                   label: "Experience",
//                   value: `${job.experienceMin}–${job.experienceMax} years`,
//                 },
//                 {
//                   label: "Posted On",
//                   value: new Date(job.createdAt).toLocaleDateString("en-IN"),
//                 },
//                 { label: "Views", value: job.viewCount },
//               ].map(({ label, value }) => (
//                 <div
//                   key={label}
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     padding: "0.6rem 0",
//                     borderBottom: "1px solid var(--gray-100)",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   <span style={{ color: "var(--gray-500)" }}>{label}</span>
//                   <span style={{ fontWeight: 500 }}>{value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { jobsAPI, applicationsAPI, resumeAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import BackButton from "../components/shared/BackButton";

export default function JobDetail() {
  const { id } = useParams();
  const { user, isCandidate } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data, isLoading } = useQuery(["job", id], () => jobsAPI.getOne(id));
  const { data: skillGapData } = useQuery(
    ["skillGap", id],
    () => resumeAPI.getSkillGap(id),
    { enabled: !!user && isCandidate },
  );

  const job = data?.job;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append("jobId", id);
      formData.append("coverLetter", coverLetter);
      if (resumeFile) formData.append("resume", resumeFile);

      const res = await applicationsAPI.apply(formData);
      setMatchResult(res.matchResult);
      setShowApplyForm(false);
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries("candidateAnalytics");
    } catch (err) {
      if (err.response?.status === 409)
        toast.error("You have already applied to this job");
    } finally {
      setApplying(false);
    }
  };

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
  if (!job)
    return (
      <div className="page">
        <div className="container">
          <p>Job not found.</p>
        </div>
      </div>
    );

  const skillGap = skillGapData?.gap;

  return (
    <div className="page">
      <div className="container">
        <BackButton to="/jobs" label="Back to Jobs" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Main content */}
          <div>
            {/* Job header card */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: "var(--primary-light)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    flexShrink: 0,
                  }}
                >
                  {job.company?.[0]}
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {job.title}
                  </h1>
                  <p style={{ color: "var(--gray-600)", fontSize: "0.95rem" }}>
                    {job.company} · {job.location}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  fontSize: "0.875rem",
                }}
              >
                <span className="badge badge-primary">{job.jobType}</span>
                <span className="badge badge-gray">
                  📅 {job.experienceMin}–{job.experienceMax} yrs exp
                </span>
                {job.salaryMin && (
                  <span className="badge badge-success">
                    ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
                    {(job.salaryMax / 100000).toFixed(1)}L/yr
                  </span>
                )}
                {job.applicationDeadline && (
                  <span className="badge badge-warning">
                    Deadline:{" "}
                    {new Date(job.applicationDeadline).toLocaleDateString(
                      "en-IN",
                    )}
                  </span>
                )}
                <span className="badge badge-gray">
                  👥 {job.applicationCount} applicants
                </span>
              </div>
            </div>

            {/* AI Match Result */}
            {matchResult && (
              <div
                style={{
                  background: "#D1FAE5",
                  border: "1px solid #6EE7B7",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ color: "#065F46", marginBottom: "0.75rem" }}>
                  ✅ Application Submitted — AI Match Score
                </h3>
                <div
                  style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "#059669",
                      }}
                    >
                      {matchResult.score}%
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#065F46" }}>
                      {matchResult.rating?.label}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>
                      <strong>Matched skills:</strong>{" "}
                      {matchResult.matchedSkills.length > 0
                        ? matchResult.matchedSkills.map((s) => (
                            <span key={s} className="skill-tag matched">
                              {s}
                            </span>
                          ))
                        : "None matched"}
                    </div>
                    <div style={{ fontSize: "0.85rem" }}>
                      <strong>Missing skills:</strong>{" "}
                      {matchResult.missingSkills.length > 0
                        ? matchResult.missingSkills.map((s) => (
                            <span key={s} className="skill-tag missing">
                              {s}
                            </span>
                          ))
                        : "None — great match!"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Job Description
              </h2>
              <p
                style={{
                  color: "var(--gray-700)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {job.description}
              </p>
            </div>

            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Requirements
              </h2>
              <p
                style={{
                  color: "var(--gray-700)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {job.requirements}
              </p>
            </div>

            {/* Required Skills */}
            {job.skills?.length > 0 && (
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                  Required Skills
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {job.skills.map((skill) => {
                    const isMatched = skillGap?.matched?.includes(
                      skill.toLowerCase(),
                    );
                    const isMissing = skillGap?.missing?.includes(
                      skill.toLowerCase(),
                    );
                    return (
                      <span
                        key={skill}
                        className={`skill-tag ${isMatched ? "matched" : isMissing ? "missing" : ""}`}
                      >
                        {isMatched ? "✓ " : isMissing ? "✗ " : ""}
                        {skill}
                      </span>
                    );
                  })}
                </div>
                {skillGap && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--gray-500)",
                      marginTop: "0.75rem",
                    }}
                  >
                    🟢 Matched skills · 🔴 Skills you're missing
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 80 }}>
            {/* Apply CTA */}
            {!matchResult && (
              <div className="card" style={{ marginBottom: "1.25rem" }}>
                {isCandidate ? (
                  <>
                    {!showApplyForm ? (
                      <button
                        className="btn btn-primary btn-lg"
                        style={{ width: "100%" }}
                        onClick={() => setShowApplyForm(true)}
                      >
                        Apply Now
                      </button>
                    ) : (
                      <form onSubmit={handleApply}>
                        <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                          Submit Application
                        </h3>
                        <div className="form-group">
                          <label className="form-label">Resume (PDF)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            ref={fileRef}
                            onChange={(e) => setResumeFile(e.target.files[0])}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Cover Letter (optional)
                          </label>
                          <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Tell the recruiter why you're a great fit..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ width: "100%" }}
                          disabled={applying}
                        >
                          {applying
                            ? "Submitting & Matching..."
                            : "🤖 Apply with AI Match"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ width: "100%", marginTop: 8 }}
                          onClick={() => setShowApplyForm(false)}
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                    {skillGap && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "0.75rem",
                          background: "var(--gray-50)",
                          borderRadius: 8,
                          fontSize: "0.82rem",
                        }}
                      >
                        <strong>Your Match Preview:</strong>
                        <br />✅ {skillGap.matched.length} skills matched · ❌{" "}
                        {skillGap.missing.length} missing
                      </div>
                    )}
                  </>
                ) : !user ? (
                  <Link
                    to="/login"
                    className="btn btn-primary btn-lg"
                    style={{
                      width: "100%",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    Login to Apply
                  </Link>
                ) : null}
              </div>
            )}

            {/* Job summary */}
            <div className="card">
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                Job Summary
              </h3>
              {[
                { label: "Category", value: job.category },
                { label: "Job Type", value: job.jobType },
                { label: "Location", value: job.location },
                {
                  label: "Experience",
                  value: `${job.experienceMin}–${job.experienceMax} years`,
                },
                {
                  label: "Posted On",
                  value: new Date(job.createdAt).toLocaleDateString("en-IN"),
                },
                { label: "Views", value: job.viewCount },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.6rem 0",
                    borderBottom: "1px solid var(--gray-100)",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "var(--gray-500)" }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}