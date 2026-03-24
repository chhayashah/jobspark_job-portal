// import React, { useState, useRef } from "react";
// import { useQuery, useMutation, useQueryClient } from "react-query";
// import { resumeVersionsAPI } from "../services/api";
// import toast from "react-hot-toast";
// import { formatDistanceToNow } from "date-fns";

// function ScoreBadge({ score }) {
//   const color = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444";
//   return (
//     <div
//       style={{
//         width: 48,
//         height: 48,
//         borderRadius: "50%",
//         border: `3px solid ${color}`,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: "0.82rem",
//         fontWeight: 700,
//         color,
//         flexShrink: 0,
//       }}
//     >
//       {score}
//     </div>
//   );
// }

// export default function ResumeVersionsPage() {
//   const queryClient = useQueryClient();
//   const fileRef = useRef();
//   const [label, setLabel] = useState("");
//   const [notes, setNotes] = useState("");
//   const [comparing, setCmp] = useState(null); // { v1id, v2id }

//   const { data, isLoading } = useQuery(
//     "resumeVersions",
//     resumeVersionsAPI.getAll,
//   );
//   const versions = data?.versions || [];

//   const { data: compareData, isLoading: comparing2 } = useQuery(
//     ["compareVersions", comparing?.v1, comparing?.v2],
//     () => resumeVersionsAPI.compare(comparing.v1, comparing.v2),
//     { enabled: !!(comparing?.v1 && comparing?.v2) },
//   );

//   const uploadMutation = useMutation(
//     (formData) => resumeVersionsAPI.upload(formData),
//     {
//       onSuccess: (data) => {
//         toast.success(
//           `Resume v${data.version?.version} uploaded! Score: ${data.resumeScore?.total}/100`,
//         );
//         queryClient.invalidateQueries("resumeVersions");
//         setLabel("");
//         setNotes("");
//         if (fileRef.current) fileRef.current.value = "";
//       },
//       onError: () => toast.error("Upload failed — please try a PDF file"),
//     },
//   );

//   const activateMutation = useMutation((id) => resumeVersionsAPI.activate(id), {
//     onSuccess: () => {
//       toast.success("Resume version activated!");
//       queryClient.invalidateQueries("resumeVersions");
//     },
//   });

//   const deleteMutation = useMutation((id) => resumeVersionsAPI.remove(id), {
//     onSuccess: () => {
//       toast.success("Version deleted");
//       queryClient.invalidateQueries("resumeVersions");
//     },
//   });

//   const handleUpload = (e) => {
//     e.preventDefault();
//     const file = fileRef.current?.files[0];
//     if (!file) {
//       toast.error("Please select a file");
//       return;
//     }
//     const fd = new FormData();
//     fd.append("resume", file);
//     fd.append("label", label || `Resume v${versions.length + 1}`);
//     fd.append("notes", notes);
//     uploadMutation.mutate(fd);
//   };

//   const diff = compareData?.diff;

//   return (
//     <div className="page">
//       <div className="container" style={{ maxWidth: 900 }}>
//         <div style={{ marginBottom: "2rem" }}>
//           <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
//             Resume Versions
//           </h1>
//           <p style={{ color: "var(--gray-500)" }}>
//             Manage multiple resume versions, compare them and set your active
//             one
//           </p>
//         </div>

//         {/* Upload New Version */}
//         <div className="card" style={{ marginBottom: "1.5rem" }}>
//           <h3
//             style={{ fontSize: "1rem", marginBottom: "1rem", fontWeight: 600 }}
//           >
//             Upload New Version
//           </h3>
//           <form onSubmit={handleUpload}>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 12,
//                 marginBottom: 12,
//               }}
//             >
//               <div className="form-group" style={{ marginBottom: 0 }}>
//                 <label className="form-label">Version Label</label>
//                 <input
//                   className="form-control"
//                   value={label}
//                   onChange={(e) => setLabel(e.target.value)}
//                   placeholder="e.g. React-focused, ML Engineer, General"
//                 />
//               </div>
//               <div className="form-group" style={{ marginBottom: 0 }}>
//                 <label className="form-label">Notes (optional)</label>
//                 <input
//                   className="form-control"
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   placeholder="What's different about this version?"
//                 />
//               </div>
//             </div>
//             <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//               <input
//                 type="file"
//                 ref={fileRef}
//                 accept=".pdf,.doc,.docx"
//                 className="form-control"
//                 style={{ flex: 1 }}
//               />
//               <button
//                 type="submit"
//                 className="btn btn-primary"
//                 disabled={uploadMutation.isLoading}
//                 style={{ whiteSpace: "nowrap" }}
//               >
//                 {uploadMutation.isLoading
//                   ? "⏳ Parsing..."
//                   : "⬆️ Upload & Parse"}
//               </button>
//             </div>
//             <p
//               style={{
//                 fontSize: "0.78rem",
//                 color: "var(--gray-400)",
//                 marginTop: 6,
//               }}
//             >
//               AI will auto-extract skills and calculate resume strength score
//             </p>
//           </form>
//         </div>

//         {/* Version List */}
//         {isLoading ? (
//           <div className="spinner-overlay">
//             <div className="spinner" />
//           </div>
//         ) : versions.length === 0 ? (
//           <div
//             className="card"
//             style={{ textAlign: "center", padding: "3rem" }}
//           >
//             <div style={{ fontSize: "3rem", marginBottom: 12 }}>📄</div>
//             <h3 style={{ marginBottom: 8 }}>No resume versions yet</h3>
//             <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
//               Upload your first resume to get started
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Compare selector */}
//             {versions.length >= 2 && (
//               <div
//                 className="card"
//                 style={{
//                   marginBottom: "1.5rem",
//                   background: "#EEF2FF",
//                   border: "1px solid #C7D2FE",
//                 }}
//               >
//                 <h3
//                   style={{
//                     fontSize: "0.95rem",
//                     marginBottom: "0.75rem",
//                     color: "var(--primary)",
//                   }}
//                 >
//                   ⚡ Compare Two Versions
//                 </h3>
//                 <div
//                   style={{
//                     display: "flex",
//                     gap: 12,
//                     alignItems: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <select
//                     className="form-control"
//                     style={{ flex: 1, minWidth: 160 }}
//                     onChange={(e) =>
//                       setCmp((p) => ({ ...p, v1: e.target.value }))
//                     }
//                   >
//                     <option value="">Select Version 1</option>
//                     {versions.map((v) => (
//                       <option key={v._id} value={v._id}>
//                         {v.label} (Score: {v.resumeScore})
//                       </option>
//                     ))}
//                   </select>
//                   <span style={{ color: "var(--gray-500)" }}>vs</span>
//                   <select
//                     className="form-control"
//                     style={{ flex: 1, minWidth: 160 }}
//                     onChange={(e) =>
//                       setCmp((p) => ({ ...p, v2: e.target.value }))
//                     }
//                   >
//                     <option value="">Select Version 2</option>
//                     {versions.map((v) => (
//                       <option key={v._id} value={v._id}>
//                         {v.label} (Score: {v.resumeScore})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Comparison result */}
//                 {compareData && diff && (
//                   <div
//                     style={{
//                       marginTop: "1rem",
//                       padding: "1rem",
//                       background: "#fff",
//                       borderRadius: 10,
//                       border: "1px solid #C7D2FE",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "grid",
//                         gridTemplateColumns: "1fr 1fr",
//                         gap: 16,
//                         marginBottom: "0.75rem",
//                       }}
//                     >
//                       <div>
//                         <div
//                           style={{
//                             fontSize: "0.8rem",
//                             color: "var(--gray-500)",
//                             marginBottom: 2,
//                           }}
//                         >
//                           {compareData.v1?.label}
//                         </div>
//                         <div
//                           style={{
//                             fontSize: "1.5rem",
//                             fontWeight: 700,
//                             color:
//                               compareData.v1?.score >= 70
//                                 ? "#10B981"
//                                 : "#F59E0B",
//                           }}
//                         >
//                           {compareData.v1?.score}/100
//                         </div>
//                       </div>
//                       <div>
//                         <div
//                           style={{
//                             fontSize: "0.8rem",
//                             color: "var(--gray-500)",
//                             marginBottom: 2,
//                           }}
//                         >
//                           {compareData.v2?.label}
//                         </div>
//                         <div
//                           style={{
//                             fontSize: "1.5rem",
//                             fontWeight: 700,
//                             color:
//                               compareData.v2?.score >= 70
//                                 ? "#10B981"
//                                 : "#F59E0B",
//                           }}
//                         >
//                           {compareData.v2?.score}/100
//                           {diff.scoreDiff !== 0 && (
//                             <span
//                               style={{
//                                 fontSize: "0.9rem",
//                                 color:
//                                   diff.scoreDiff > 0 ? "#10B981" : "#EF4444",
//                                 marginLeft: 8,
//                               }}
//                             >
//                               {diff.scoreDiff > 0 ? "▲" : "▼"}{" "}
//                               {Math.abs(diff.scoreDiff)} pts
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {diff.addedSkills.length > 0 && (
//                       <div style={{ marginBottom: 8 }}>
//                         <span
//                           style={{
//                             fontSize: "0.78rem",
//                             color: "#10B981",
//                             fontWeight: 600,
//                           }}
//                         >
//                           + Added skills:{" "}
//                         </span>
//                         {diff.addedSkills.map((s) => (
//                           <span
//                             key={s}
//                             className="skill-tag matched"
//                             style={{ fontSize: "0.75rem" }}
//                           >
//                             {s}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                     {diff.removedSkills.length > 0 && (
//                       <div>
//                         <span
//                           style={{
//                             fontSize: "0.78rem",
//                             color: "#EF4444",
//                             fontWeight: 600,
//                           }}
//                         >
//                           − Removed skills:{" "}
//                         </span>
//                         {diff.removedSkills.map((s) => (
//                           <span
//                             key={s}
//                             className="skill-tag missing"
//                             style={{ fontSize: "0.75rem" }}
//                           >
//                             {s}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Version cards */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//               {versions.map((v) => (
//                 <div
//                   key={v._id}
//                   className="card"
//                   style={{
//                     border: v.isActive
//                       ? "2px solid var(--primary)"
//                       : "1px solid var(--gray-200)",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       gap: 16,
//                       alignItems: "flex-start",
//                       flexWrap: "wrap",
//                     }}
//                   >
//                     <ScoreBadge score={v.resumeScore} />
//                     <div style={{ flex: 1, minWidth: 200 }}>
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 8,
//                           marginBottom: 4,
//                         }}
//                       >
//                         <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
//                           {v.label}
//                         </h3>
//                         {v.isActive && (
//                           <span
//                             className="badge badge-primary"
//                             style={{ fontSize: "0.72rem" }}
//                           >
//                             ● Active
//                           </span>
//                         )}
//                       </div>
//                       <p
//                         style={{
//                           fontSize: "0.8rem",
//                           color: "var(--gray-500)",
//                           marginBottom: 8,
//                         }}
//                       >
//                         Uploaded{" "}
//                         {formatDistanceToNow(new Date(v.createdAt), {
//                           addSuffix: true,
//                         })}
//                         {v.notes && ` · ${v.notes}`}
//                       </p>
//                       <div
//                         style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
//                       >
//                         {(v.skills || []).slice(0, 8).map((s) => (
//                           <span
//                             key={s}
//                             className="skill-tag"
//                             style={{ fontSize: "0.75rem" }}
//                           >
//                             {s}
//                           </span>
//                         ))}
//                         {(v.skills || []).length > 8 && (
//                           <span
//                             className="skill-tag"
//                             style={{ fontSize: "0.75rem" }}
//                           >
//                             +{v.skills.length - 8} more
//                           </span>
//                         )}
//                       </div>

//                       {/* Score bar */}
//                       <div style={{ marginTop: 10 }}>
//                         <div
//                           style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             marginBottom: 3,
//                           }}
//                         >
//                           <span
//                             style={{
//                               fontSize: "0.75rem",
//                               color: "var(--gray-500)",
//                             }}
//                           >
//                             Resume Strength
//                           </span>
//                           <span
//                             style={{ fontSize: "0.75rem", fontWeight: 600 }}
//                           >
//                             {v.resumeScore}/100
//                           </span>
//                         </div>
//                         <div
//                           style={{
//                             height: 6,
//                             background: "var(--gray-100)",
//                             borderRadius: 3,
//                             overflow: "hidden",
//                           }}
//                         >
//                           <div
//                             style={{
//                               height: "100%",
//                               borderRadius: 3,
//                               width: `${v.resumeScore}%`,
//                               background:
//                                 v.resumeScore >= 70
//                                   ? "#10B981"
//                                   : v.resumeScore >= 45
//                                     ? "#F59E0B"
//                                     : "#EF4444",
//                               transition: "width 0.8s ease",
//                             }}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 8,
//                         flexShrink: 0,
//                       }}
//                     >
//                       {v.fileUrl && (
//                         <a
//                           href={v.fileUrl}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="btn btn-secondary btn-sm"
//                         >
//                           📄 View PDF
//                         </a>
//                       )}
//                       {!v.isActive && (
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => activateMutation.mutate(v._id)}
//                           disabled={activateMutation.isLoading}
//                         >
//                           Set Active
//                         </button>
//                       )}
//                       <button
//                         className="btn btn-sm"
//                         style={{
//                           background: "#FEE2E2",
//                           color: "#991B1B",
//                           border: "none",
//                         }}
//                         onClick={() =>
//                           window.confirm("Delete this version?") &&
//                           deleteMutation.mutate(v._id)
//                         }
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { resumeVersionsAPI } from "../services/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import BackButton from "../components/shared/BackButton";

function ScoreBadge({ score }) {
  const color = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444";
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.82rem",
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {score}
    </div>
  );
}

export default function ResumeVersionsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [comparing, setCmp] = useState(null); // { v1id, v2id }

  const { data, isLoading } = useQuery(
    "resumeVersions",
    resumeVersionsAPI.getAll,
  );
  const versions = data?.versions || [];

  const { data: compareData, isLoading: comparing2 } = useQuery(
    ["compareVersions", comparing?.v1, comparing?.v2],
    () => resumeVersionsAPI.compare(comparing.v1, comparing.v2),
    { enabled: !!(comparing?.v1 && comparing?.v2) },
  );

  const uploadMutation = useMutation(
    (formData) => resumeVersionsAPI.upload(formData),
    {
      onSuccess: (data) => {
        toast.success(
          `Resume v${data.version?.version} uploaded! Score: ${data.resumeScore?.total}/100`,
        );
        queryClient.invalidateQueries("resumeVersions");
        setLabel("");
        setNotes("");
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: () => toast.error("Upload failed — please try a PDF file"),
    },
  );

  const activateMutation = useMutation((id) => resumeVersionsAPI.activate(id), {
    onSuccess: () => {
      toast.success("Resume version activated!");
      queryClient.invalidateQueries("resumeVersions");
    },
  });

  const deleteMutation = useMutation((id) => resumeVersionsAPI.remove(id), {
    onSuccess: () => {
      toast.success("Version deleted");
      queryClient.invalidateQueries("resumeVersions");
    },
  });

  const handleUpload = (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    const fd = new FormData();
    fd.append("resume", file);
    fd.append("label", label || `Resume v${versions.length + 1}`);
    fd.append("notes", notes);
    uploadMutation.mutate(fd);
  };

  const diff = compareData?.diff;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <BackButton to="/candidate/dashboard" label="Back to Dashboard" />
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
            Resume Versions
          </h1>
          <p style={{ color: "var(--gray-500)" }}>
            Manage multiple resume versions, compare them and set your active
            one
          </p>
        </div>

        {/* Upload New Version */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{ fontSize: "1rem", marginBottom: "1rem", fontWeight: 600 }}
          >
            Upload New Version
          </h3>
          <form onSubmit={handleUpload}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Version Label</label>
                <input
                  className="form-control"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. React-focused, ML Engineer, General"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes (optional)</label>
                <input
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's different about this version?"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,.doc,.docx"
                className="form-control"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploadMutation.isLoading}
                style={{ whiteSpace: "nowrap" }}
              >
                {uploadMutation.isLoading
                  ? "⏳ Parsing..."
                  : "⬆️ Upload & Parse"}
              </button>
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--gray-400)",
                marginTop: 6,
              }}
            >
              AI will auto-extract skills and calculate resume strength score
            </p>
          </form>
        </div>

        {/* Version List */}
        {isLoading ? (
          <div className="spinner-overlay">
            <div className="spinner" />
          </div>
        ) : versions.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📄</div>
            <h3 style={{ marginBottom: 8 }}>No resume versions yet</h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
              Upload your first resume to get started
            </p>
          </div>
        ) : (
          <>
            {/* Compare selector */}
            {versions.length >= 2 && (
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
                    fontSize: "0.95rem",
                    marginBottom: "0.75rem",
                    color: "var(--primary)",
                  }}
                >
                  ⚡ Compare Two Versions
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    className="form-control"
                    style={{ flex: 1, minWidth: 160 }}
                    onChange={(e) =>
                      setCmp((p) => ({ ...p, v1: e.target.value }))
                    }
                  >
                    <option value="">Select Version 1</option>
                    {versions.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.label} (Score: {v.resumeScore})
                      </option>
                    ))}
                  </select>
                  <span style={{ color: "var(--gray-500)" }}>vs</span>
                  <select
                    className="form-control"
                    style={{ flex: 1, minWidth: 160 }}
                    onChange={(e) =>
                      setCmp((p) => ({ ...p, v2: e.target.value }))
                    }
                  >
                    <option value="">Select Version 2</option>
                    {versions.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.label} (Score: {v.resumeScore})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comparison result */}
                {compareData && diff && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1rem",
                      background: "#fff",
                      borderRadius: 10,
                      border: "1px solid #C7D2FE",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--gray-500)",
                            marginBottom: 2,
                          }}
                        >
                          {compareData.v1?.label}
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color:
                              compareData.v1?.score >= 70
                                ? "#10B981"
                                : "#F59E0B",
                          }}
                        >
                          {compareData.v1?.score}/100
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--gray-500)",
                            marginBottom: 2,
                          }}
                        >
                          {compareData.v2?.label}
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color:
                              compareData.v2?.score >= 70
                                ? "#10B981"
                                : "#F59E0B",
                          }}
                        >
                          {compareData.v2?.score}/100
                          {diff.scoreDiff !== 0 && (
                            <span
                              style={{
                                fontSize: "0.9rem",
                                color:
                                  diff.scoreDiff > 0 ? "#10B981" : "#EF4444",
                                marginLeft: 8,
                              }}
                            >
                              {diff.scoreDiff > 0 ? "▲" : "▼"}{" "}
                              {Math.abs(diff.scoreDiff)} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {diff.addedSkills.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "#10B981",
                            fontWeight: 600,
                          }}
                        >
                          + Added skills:{" "}
                        </span>
                        {diff.addedSkills.map((s) => (
                          <span
                            key={s}
                            className="skill-tag matched"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {diff.removedSkills.length > 0 && (
                      <div>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "#EF4444",
                            fontWeight: 600,
                          }}
                        >
                          − Removed skills:{" "}
                        </span>
                        {diff.removedSkills.map((s) => (
                          <span
                            key={s}
                            className="skill-tag missing"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Version cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {versions.map((v) => (
                <div
                  key={v._id}
                  className="card"
                  style={{
                    border: v.isActive
                      ? "2px solid var(--primary)"
                      : "1px solid var(--gray-200)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <ScoreBadge score={v.resumeScore} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                          {v.label}
                        </h3>
                        {v.isActive && (
                          <span
                            className="badge badge-primary"
                            style={{ fontSize: "0.72rem" }}
                          >
                            ● Active
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--gray-500)",
                          marginBottom: 8,
                        }}
                      >
                        Uploaded{" "}
                        {formatDistanceToNow(new Date(v.createdAt), {
                          addSuffix: true,
                        })}
                        {v.notes && ` · ${v.notes}`}
                      </p>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                      >
                        {(v.skills || []).slice(0, 8).map((s) => (
                          <span
                            key={s}
                            className="skill-tag"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {s}
                          </span>
                        ))}
                        {(v.skills || []).length > 8 && (
                          <span
                            className="skill-tag"
                            style={{ fontSize: "0.75rem" }}
                          >
                            +{v.skills.length - 8} more
                          </span>
                        )}
                      </div>

                      {/* Score bar */}
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            Resume Strength
                          </span>
                          <span
                            style={{ fontSize: "0.75rem", fontWeight: 600 }}
                          >
                            {v.resumeScore}/100
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "var(--gray-100)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 3,
                              width: `${v.resumeScore}%`,
                              background:
                                v.resumeScore >= 70
                                  ? "#10B981"
                                  : v.resumeScore >= 45
                                    ? "#F59E0B"
                                    : "#EF4444",
                              transition: "width 0.8s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      {v.fileUrl && (
                        <a
                          href={v.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          📄 View PDF
                        </a>
                      )}
                      {!v.isActive && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => activateMutation.mutate(v._id)}
                          disabled={activateMutation.isLoading}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        className="btn btn-sm"
                        style={{
                          background: "#FEE2E2",
                          color: "#991B1B",
                          border: "none",
                        }}
                        onClick={() =>
                          window.confirm("Delete this version?") &&
                          deleteMutation.mutate(v._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}