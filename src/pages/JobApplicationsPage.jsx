// import React, { useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useQuery, useMutation, useQueryClient } from "react-query";
// import { applicationsAPI, jobsAPI } from "../services/api";
// import toast from "react-hot-toast";

// const STATUS_OPTIONS = [
//   "applied",
//   "shortlisted",
//   "interview_scheduled",
//   "interviewed",
//   "offered",
//   "hired",
//   "rejected",
// ];
// const STATUS_LABELS = {
//   applied: "Applied",
//   shortlisted: "Shortlisted",
//   interview_scheduled: "Interview Scheduled",
//   interviewed: "Interviewed",
//   offered: "Offered",
//   hired: "Hired",
//   rejected: "Rejected",
// };

// function MatchRing({ score }) {
//   const color =
//     score >= 80
//       ? "#10B981"
//       : score >= 60
//         ? "#3B82F6"
//         : score >= 40
//           ? "#F59E0B"
//           : "#EF4444";
//   return (
//     <div
//       style={{
//         width: 52,
//         height: 52,
//         borderRadius: "50%",
//         border: `3px solid ${color}`,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexShrink: 0,
//       }}
//     >
//       <span style={{ fontSize: "0.8rem", fontWeight: 700, color }}>
//         {Math.round(score)}%
//       </span>
//     </div>
//   );
// }

// export default function JobApplicationsPage() {
//   const { id: jobId } = useParams();
//   const queryClient = useQueryClient();
//   const [statusFilter, setStatusFilter] = useState("");
//   const [sortBy, setSortBy] = useState("matchScore");
//   const [selectedApp, setSelectedApp] = useState(null);
//   const [newStatus, setNewStatus] = useState("");
//   const [recruiterNotes, setRecruiterNotes] = useState("");
//   const [interviewDate, setInterviewDate] = useState("");

//   const { data: jobData } = useQuery(["job", jobId], () =>
//     jobsAPI.getOne(jobId),
//   );
//   const { data, isLoading } = useQuery(
//     ["jobApplications", jobId, statusFilter, sortBy],
//     () =>
//       applicationsAPI.getJobApplications(jobId, {
//         status: statusFilter,
//         sortBy,
//         order: "DESC",
//       }),
//   );
//   const { data: ranked } = useQuery(["ranked", jobId], () =>
//     applicationsAPI.getRankedCandidates(jobId),
//   );

//   const updateMutation = useMutation(
//     ({ id, payload }) => applicationsAPI.updateStatus(id, payload),
//     {
//       onSuccess: () => {
//         toast.success("Status updated");
//         queryClient.invalidateQueries(["jobApplications", jobId]);
//         setSelectedApp(null);
//       },
//     },
//   );

//   const handleUpdateStatus = () => {
//     if (!selectedApp || !newStatus) return;
//     updateMutation.mutate({
//       id: selectedApp.id,
//       payload: {
//         status: newStatus,
//         recruiterNotes,
//         interviewDate: interviewDate || null,
//       },
//     });
//   };

//   const job = jobData?.job;
//   const applications = data?.applications || [];

//   return (
//     <div className="page">
//       <div className="container">
//         {/* Header */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             marginBottom: "1.5rem",
//             flexWrap: "wrap",
//             gap: 12,
//           }}
//         >
//           <div>
//             <h1 style={{ fontSize: "1.5rem", marginBottom: 4 }}>
//               {job?.title || "Job Applications"}
//             </h1>
//             <p style={{ color: "var(--gray-500)" }}>
//               {data?.total || 0} applications received · AI-ranked by match
//               score
//             </p>
//           </div>
//           <Link
//             to={`/recruiter/jobs/${jobId}/compare`}
//             className="btn btn-primary btn-sm"
//           >
//             ⚡ Compare Candidates
//           </Link>
//         </div>

//         {/* AI Top Candidates Banner */}
//         {ranked?.ranked?.length > 0 && (
//           <div
//             style={{
//               background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
//               border: "1px solid #C7D2FE",
//               borderRadius: "var(--radius-lg)",
//               padding: "1.25rem",
//               marginBottom: "1.5rem",
//             }}
//           >
//             <h3
//               style={{
//                 fontSize: "0.95rem",
//                 color: "var(--primary-dark)",
//                 marginBottom: "0.75rem",
//               }}
//             >
//               🤖 AI Top Picks
//             </h3>
//             <div
//               style={{
//                 display: "flex",
//                 gap: 12,
//                 overflowX: "auto",
//                 paddingBottom: 4,
//               }}
//             >
//               {ranked.ranked.slice(0, 5).map((r, i) => (
//                 <div
//                   key={r.candidateId}
//                   style={{
//                     background: "#fff",
//                     borderRadius: 10,
//                     padding: "0.75rem 1rem",
//                     minWidth: 180,
//                     border: "1px solid #C7D2FE",
//                     flexShrink: 0,
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontSize: "0.8rem",
//                       color: "var(--primary)",
//                       fontWeight: 600,
//                       marginBottom: 2,
//                     }}
//                   >
//                     #{i + 1} Top Match
//                   </div>
//                   <div
//                     style={{
//                       fontWeight: 600,
//                       fontSize: "0.9rem",
//                       marginBottom: 2,
//                     }}
//                   >
//                     {r.name}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "1.25rem",
//                       fontWeight: 700,
//                       color:
//                         r.score >= 80
//                           ? "#10B981"
//                           : r.score >= 60
//                             ? "#3B82F6"
//                             : "#F59E0B",
//                     }}
//                   >
//                     {Math.round(r.score)}%
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Filters */}
//         <div
//           style={{
//             display: "flex",
//             gap: 12,
//             marginBottom: "1.25rem",
//             flexWrap: "wrap",
//           }}
//         >
//           <select
//             className="form-control"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             style={{ width: "auto" }}
//           >
//             <option value="">All Status</option>
//             {STATUS_OPTIONS.map((s) => (
//               <option key={s} value={s}>
//                 {STATUS_LABELS[s]}
//               </option>
//             ))}
//           </select>
//           <select
//             className="form-control"
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             style={{ width: "auto" }}
//           >
//             <option value="matchScore">Sort: Match Score</option>
//             <option value="createdAt">Sort: Applied Date</option>
//           </select>
//         </div>

//         {/* Applications list */}
//         {isLoading ? (
//           <div className="spinner-overlay">
//             <div className="spinner" />
//           </div>
//         ) : applications.length > 0 ? (
//           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//             {applications.map((app) => (
//               <div
//                 key={app.id}
//                 className="card"
//                 style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
//               >
//                 {/* Match score ring */}
//                 <MatchRing score={app.matchScore} />

//                 {/* Candidate info */}
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                       flexWrap: "wrap",
//                       gap: 8,
//                       marginBottom: 6,
//                     }}
//                   >
//                     <div>
//                       <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
//                         {app.candidate?.name || "Candidate"}
//                       </h3>
//                       <p
//                         style={{
//                           fontSize: "0.85rem",
//                           color: "var(--gray-500)",
//                         }}
//                       >
//                         {app.candidate?.email}
//                       </p>
//                     </div>
//                     <div
//                       style={{ display: "flex", gap: 8, alignItems: "center" }}
//                     >
//                       <span
//                         className={`badge ${app.status === "hired" || app.status === "offered" ? "badge-success" : app.status === "rejected" ? "badge-danger" : app.status === "shortlisted" ? "badge-primary" : "badge-gray"}`}
//                       >
//                         {STATUS_LABELS[app.status]}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Skills */}
//                   <div
//                     style={{
//                       display: "flex",
//                       flexWrap: "wrap",
//                       gap: 4,
//                       marginBottom: 8,
//                     }}
//                   >
//                     {(app.matchedSkills || []).slice(0, 5).map((s) => (
//                       <span key={s} className="skill-tag matched">
//                         {s}
//                       </span>
//                     ))}
//                     {(app.missingSkills || []).slice(0, 3).map((s) => (
//                       <span key={s} className="skill-tag missing">
//                         {s}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Match breakdown */}
//                   {app.matchDetails && (
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: 16,
//                         fontSize: "0.78rem",
//                         color: "var(--gray-500)",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <span>
//                         Skills: <strong>{app.matchDetails.skills}%</strong>
//                       </span>
//                       <span>
//                         Experience:{" "}
//                         <strong>{app.matchDetails.experience}%</strong>
//                       </span>
//                       <span>
//                         Text:{" "}
//                         <strong>{app.matchDetails.textSimilarity}%</strong>
//                       </span>
//                     </div>
//                   )}

//                   {app.coverLetter && (
//                     <p
//                       style={{
//                         fontSize: "0.82rem",
//                         color: "var(--gray-600)",
//                         marginTop: 6,
//                         fontStyle: "italic",
//                         overflow: "hidden",
//                         display: "-webkit-box",
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical",
//                       }}
//                     >
//                       "{app.coverLetter}"
//                     </p>
//                   )}
//                 </div>

//                 {/* Actions */}
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: 8,
//                     flexShrink: 0,
//                   }}
//                 >
//                   {app.resumeUrl && (
//                     <a
//                       href={app.resumeUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="btn btn-secondary btn-sm"
//                     >
//                       📄 Resume
//                     </a>
//                   )}
//                   <button
//                     className="btn btn-primary btn-sm"
//                     onClick={() => {
//                       setSelectedApp(app);
//                       setNewStatus(app.status);
//                       setRecruiterNotes(app.recruiterNotes || "");
//                       setInterviewDate("");
//                     }}
//                   >
//                     Update Status
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div
//             className="card"
//             style={{ textAlign: "center", padding: "4rem" }}
//           >
//             <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
//             <h3>No applications yet</h3>
//             <p style={{ color: "var(--gray-500)", marginTop: 8 }}>
//               Share this job to attract candidates
//             </p>
//           </div>
//         )}

//         {/* Update Status Modal */}
//         {selectedApp && (
//           <div
//             style={{
//               position: "fixed",
//               inset: 0,
//               background: "rgba(0,0,0,0.5)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 200,
//               padding: "1rem",
//             }}
//           >
//             <div
//               className="card"
//               style={{
//                 width: "100%",
//                 maxWidth: 460,
//                 maxHeight: "90vh",
//                 overflowY: "auto",
//               }}
//             >
//               <h3 style={{ marginBottom: "1.25rem" }}>
//                 Update Application — {selectedApp.candidate?.name}
//               </h3>
//               <div className="form-group">
//                 <label className="form-label">New Status</label>
//                 <select
//                   className="form-control"
//                   value={newStatus}
//                   onChange={(e) => setNewStatus(e.target.value)}
//                 >
//                   {STATUS_OPTIONS.map((s) => (
//                     <option key={s} value={s}>
//                       {STATUS_LABELS[s]}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {newStatus === "interview_scheduled" && (
//                 <div className="form-group">
//                   <label className="form-label">Interview Date</label>
//                   <input
//                     type="datetime-local"
//                     className="form-control"
//                     value={interviewDate}
//                     onChange={(e) => setInterviewDate(e.target.value)}
//                   />
//                 </div>
//               )}
//               <div className="form-group">
//                 <label className="form-label">Recruiter Notes</label>
//                 <textarea
//                   className="form-control"
//                   rows={3}
//                   value={recruiterNotes}
//                   onChange={(e) => setRecruiterNotes(e.target.value)}
//                   placeholder="Internal notes about this candidate..."
//                 />
//               </div>
//               <div style={{ display: "flex", gap: 10 }}>
//                 <button
//                   className="btn btn-primary"
//                   onClick={handleUpdateStatus}
//                   disabled={updateMutation.isLoading}
//                   style={{ flex: 1 }}
//                 >
//                   {updateMutation.isLoading
//                     ? "Saving..."
//                     : "Save & Notify Candidate"}
//                 </button>
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setSelectedApp(null)}
//                   style={{ flex: 1 }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { applicationsAPI, jobsAPI } from "../services/api";
import toast from "react-hot-toast";
import BackButton from "../components/shared/BackButton";

const STATUS_OPTIONS = [
  "applied",
  "shortlisted",
  "interview_scheduled",
  "interviewed",
  "offered",
  "hired",
  "rejected",
];
const STATUS_LABELS = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

function MatchRing({ score }) {
  const color =
    score >= 80
      ? "#10B981"
      : score >= 60
        ? "#3B82F6"
        : score >= 40
          ? "#F59E0B"
          : "#EF4444";
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "0.8rem", fontWeight: 700, color }}>
        {Math.round(score)}%
      </span>
    </div>
  );
}

export default function JobApplicationsPage() {
  const { id: jobId } = useParams();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("matchScore");
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

  const { data: jobData } = useQuery(["job", jobId], () =>
    jobsAPI.getOne(jobId),
  );
  const { data, isLoading } = useQuery(
    ["jobApplications", jobId, statusFilter, sortBy],
    () =>
      applicationsAPI.getJobApplications(jobId, {
        status: statusFilter,
        sortBy,
        order: "DESC",
      }),
  );
  const { data: ranked } = useQuery(["ranked", jobId], () =>
    applicationsAPI.getRankedCandidates(jobId),
  );

  const updateMutation = useMutation(
    ({ id, payload }) => applicationsAPI.updateStatus(id, payload),
    {
      onSuccess: () => {
        toast.success("Status updated");
        queryClient.invalidateQueries(["jobApplications", jobId]);
        setSelectedApp(null);
      },
    },
  );

  const handleUpdateStatus = () => {
    if (!selectedApp || !newStatus) return;
    updateMutation.mutate({
      id: selectedApp.id,
      payload: {
        status: newStatus,
        recruiterNotes,
        interviewDate: interviewDate || null,
      },
    });
  };

  const job = jobData?.job;
  const applications = data?.applications || [];

  return (
    <div className="page">
      <BackButton to="/recruiter/dashboard" label="Back to Dashboard" />
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 4 }}>
              {job?.title || "Job Applications"}
            </h1>
            <p style={{ color: "var(--gray-500)" }}>
              {data?.total || 0} applications received · AI-ranked by match
              score
            </p>
          </div>
          <Link
            to={`/recruiter/jobs/${jobId}/compare`}
            className="btn btn-primary btn-sm"
          >
            ⚡ Compare Candidates
          </Link>
        </div>

        {/* AI Top Candidates Banner */}
        {ranked?.ranked?.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
              border: "1px solid #C7D2FE",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.95rem",
                color: "var(--primary-dark)",
                marginBottom: "0.75rem",
              }}
            >
              🤖 AI Top Picks
            </h3>
            <div
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {ranked.ranked.slice(0, 5).map((r, i) => (
                <div
                  key={r.candidateId}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: "0.75rem 1rem",
                    minWidth: 180,
                    border: "1px solid #C7D2FE",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    #{i + 1} Top Match
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      marginBottom: 2,
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color:
                        r.score >= 80
                          ? "#10B981"
                          : r.score >= 60
                            ? "#3B82F6"
                            : "#F59E0B",
                    }}
                  >
                    {Math.round(r.score)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="matchScore">Sort: Match Score</option>
            <option value="createdAt">Sort: Applied Date</option>
          </select>
        </div>

        {/* Applications list */}
        {isLoading ? (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        ) : applications.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications.map((app) => (
              <div
                key={app.id}
                className="card"
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                {/* Match score ring */}
                <MatchRing score={app.matchScore} />

                {/* Candidate info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                        {app.candidate?.name || "Candidate"}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--gray-500)",
                        }}
                      >
                        {app.candidate?.email}
                      </p>
                    </div>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <span
                        className={`badge ${app.status === "hired" || app.status === "offered" ? "badge-success" : app.status === "rejected" ? "badge-danger" : app.status === "shortlisted" ? "badge-primary" : "badge-gray"}`}
                      >
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      marginBottom: 8,
                    }}
                  >
                    {(app.matchedSkills || []).slice(0, 5).map((s) => (
                      <span key={s} className="skill-tag matched">
                        {s}
                      </span>
                    ))}
                    {(app.missingSkills || []).slice(0, 3).map((s) => (
                      <span key={s} className="skill-tag missing">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Match breakdown */}
                  {app.matchDetails && (
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        fontSize: "0.78rem",
                        color: "var(--gray-500)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        Skills: <strong>{app.matchDetails.skills}%</strong>
                      </span>
                      <span>
                        Experience:{" "}
                        <strong>{app.matchDetails.experience}%</strong>
                      </span>
                      <span>
                        Text:{" "}
                        <strong>{app.matchDetails.textSimilarity}%</strong>
                      </span>
                    </div>
                  )}

                  {app.coverLetter && (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--gray-600)",
                        marginTop: 6,
                        fontStyle: "italic",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      "{app.coverLetter}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      📄 Resume
                    </a>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedApp(app);
                      setNewStatus(app.status);
                      setRecruiterNotes(app.recruiterNotes || "");
                      setInterviewDate("");
                    }}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{ textAlign: "center", padding: "4rem" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
            <h3>No applications yet</h3>
            <p style={{ color: "var(--gray-500)", marginTop: 8 }}>
              Share this job to attract candidates
            </p>
          </div>
        )}

        {/* Update Status Modal */}
        {selectedApp && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: "1rem",
            }}
          >
            <div
              className="card"
              style={{
                width: "100%",
                maxWidth: 460,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3 style={{ marginBottom: "1.25rem" }}>
                Update Application — {selectedApp.candidate?.name}
              </h3>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              {newStatus === "interview_scheduled" && (
                <div className="form-group">
                  <label className="form-label">Interview Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Recruiter Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  placeholder="Internal notes about this candidate..."
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                  disabled={updateMutation.isLoading}
                  style={{ flex: 1 }}
                >
                  {updateMutation.isLoading
                    ? "Saving..."
                    : "Save & Notify Candidate"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedApp(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
