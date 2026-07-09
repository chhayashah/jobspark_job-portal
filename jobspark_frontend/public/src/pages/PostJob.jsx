import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsAPI } from "../services/api";
import BackButton from "../components/shared/BackButton";
import toast from "react-hot-toast";

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
const JOB_TYPES = [
  "full-time",
  "part-time",
  "remote",
  "contract",
  "internship",
];
const STEPS = [
  "Basic Info",
  "Description",
  "Requirements",
  "Salary & Settings",
];

export default function PostJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Technology",
    jobType: "full-time",
    location: "",
    description: "",
    requirements: "",
    responsibilities: "",
    skills: [],
    experienceMin: 0,
    experienceMax: 5,
    salaryMin: "",
    salaryMax: "",
    currency: "INR",
    applicationDeadline: "",
    status: "active",
  });

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !form.skills.includes(s)) {
      set("skills", [...form.skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) =>
    set(
      "skills",
      form.skills.filter((s) => s !== skill),
    );

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.requirements ||
      !form.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        salaryMin: parseInt(form.salaryMin) || null,
        salaryMax: parseInt(form.salaryMax) || null,
      };
      const data = await jobsAPI.create(payload);
      toast.success("Job posted successfully!");
      navigate(`/recruiter/jobs/${data.job.id}/applications`);
    } catch (err) {
      toast.error("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (field, type = "text") => ({
    type,
    className: "form-control",
    value: form[field],
    onChange: (e) => set(field, e.target.value),
  });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <BackButton to="/recruiter/dashboard" label="Back to Dashboard" />

        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
          Post a New Job
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Fill in the details to attract the best candidates
        </p>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: "2rem",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--border-color)",
          }}
        >
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i < step + 1 && setStep(i)}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "none",
                cursor: i <= step ? "pointer" : "default",
                background:
                  i === step
                    ? "var(--primary)"
                    : i < step
                      ? "var(--primary-light)"
                      : "var(--card-bg)",
                color:
                  i === step
                    ? "#fff"
                    : i < step
                      ? "var(--primary)"
                      : "var(--text-muted)",
                fontSize: "0.82rem",
                fontWeight: i === step ? 600 : 400,
                borderRight:
                  i < STEPS.length - 1
                    ? "1px solid var(--border-color)"
                    : "none",
                transition: "0.2s",
              }}
            >
              {i < step ? "✓ " : `${i + 1}. `}
              {s}
            </button>
          ))}
        </div>

        <div className="card">
          {/* ── Step 0: Basic Info ─────────────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                Basic Information
              </h2>

              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  {...inputProps("title")}
                  placeholder="e.g. Senior React Developer"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type *</label>
                  <select
                    className="form-control"
                    value={form.jobType}
                    onChange={(e) => set("jobType", e.target.value)}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  {...inputProps("location")}
                  placeholder="e.g. Bangalore, India or Remote"
                />
              </div>
            </div>
          )}

          {/* ── Step 1: Description ───────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                Job Description
              </h2>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  {...inputProps("description")}
                  rows={6}
                  placeholder="Describe the role, company culture, what you're building..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Responsibilities</label>
                <textarea
                  {...inputProps("responsibilities")}
                  rows={4}
                  placeholder="What will this person be doing day-to-day?"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Requirements + Skills ────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                Requirements & Skills
              </h2>
              <div className="form-group">
                <label className="form-label">Requirements *</label>
                <textarea
                  {...inputProps("requirements")}
                  rows={5}
                  placeholder="Degrees, certifications, must-have experience..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Required Skills{" "}
                  <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>
                    (used for AI matching)
                  </span>
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    className="form-control"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    placeholder="e.g. react, python, docker... (press Enter)"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addSkill}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.skills.map((s) => (
                    <span
                      key={s}
                      className="skill-tag"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeSkill(s)}
                    >
                      {s} ✕
                    </span>
                  ))}
                </div>
                {form.skills.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      marginTop: 6,
                    }}
                  >
                    Add skills to enable AI resume matching
                  </p>
                )}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Min Experience (years)</label>
                  <input {...inputProps("experienceMin", "number")} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Experience (years)</label>
                  <input {...inputProps("experienceMax", "number")} min={0} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Salary & Settings ─────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
                Salary & Settings
              </h2>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Min Salary (Annual)</label>
                  <input
                    {...inputProps("salaryMin", "number")}
                    placeholder="e.g. 600000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary (Annual)</label>
                  <input
                    {...inputProps("salaryMax", "number")}
                    placeholder="e.g. 1200000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input {...inputProps("applicationDeadline", "date")} />
              </div>
              <div className="form-group">
                <label className="form-label">Post Status</label>
                <select
                  className="form-control"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="active">
                    Active — Accept applications now
                  </option>
                  <option value="draft">Draft — Save for later</option>
                </select>
              </div>

              {/* Summary preview */}
              <div
                style={{
                  background: "var(--bg3)",
                  borderRadius: 10,
                  padding: "1rem",
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <strong>📋 Job Summary</strong>
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>📌 {form.title || "Untitled"}</span>
                  <span>📍 {form.location || "No location"}</span>
                  <span>🏷️ {form.category}</span>
                  <span>⏰ {form.jobType}</span>
                  <span>🛠️ {form.skills.length} skills added</span>
                  <span>
                    📅 {form.experienceMin}–{form.experienceMax} yrs exp
                  </span>
                  <span>
                    💰{" "}
                    {form.salaryMin
                      ? `₹${(form.salaryMin / 100000).toFixed(1)}L`
                      : "No salary"}{" "}
                    –{" "}
                    {form.salaryMax
                      ? `₹${(form.salaryMax / 100000).toFixed(1)}L`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1.75rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <button
              className="btn btn-secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Posting..." : "🚀 Post Job"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jobsAPI } from "../services/api";
// import toast from "react-hot-toast";
// import BackButton from "../components/shared/BackButton";

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
// const JOB_TYPES = [
//   "full-time",
//   "part-time",
//   "remote",
//   "contract",
//   "internship",
// ];

// const STEPS = [
//   "Basic Info",
//   "Description",
//   "Requirements",
//   "Salary & Settings",
// ];

// export default function PostJob() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [skillInput, setSkillInput] = useState("");

//   const [form, setForm] = useState({
//     title: "",
//     category: "Technology",
//     jobType: "full-time",
//     location: "",
//     description: "",
//     requirements: "",
//     responsibilities: "",
//     skills: [],
//     experienceMin: 0,
//     experienceMax: 5,
//     salaryMin: "",
//     salaryMax: "",
//     currency: "INR",
//     applicationDeadline: "",
//     status: "active",
//   });

//   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

//   const addSkill = () => {
//     const s = skillInput.trim().toLowerCase();
//     if (s && !form.skills.includes(s)) {
//       set("skills", [...form.skills, s]);
//       setSkillInput("");
//     }
//   };

//   const removeSkill = (skill) =>
//     set(
//       "skills",
//       form.skills.filter((s) => s !== skill),
//     );

//   const handleSubmit = async () => {
//     if (
//       !form.title ||
//       !form.description ||
//       !form.requirements ||
//       !form.location
//     ) {
//       toast.error("Please fill in all required fields");
//       return;
//     }
//     setLoading(true);
//     try {
//       const payload = {
//         ...form,
//         salaryMin: parseInt(form.salaryMin) || null,
//         salaryMax: parseInt(form.salaryMax) || null,
//       };
//       const data = await jobsAPI.create(payload);
//       toast.success("Job posted successfully!");
//       navigate(`/recruiter/jobs/${data.job.id}/applications`);
//     } catch (err) {
//       toast.error("Failed to post job");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputProps = (field, type = "text") => ({
//     type,
//     className: "form-control",
//     value: form[field],
//     onChange: (e) => set(field, e.target.value),
//   });

//   return (
//     <div className="page">
//       <div className="container" style={{ maxWidth: 720 }}>
//         <BackButton to="/recruiter/dashboard" label="Back to Dashboard" />
//         <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
//           Post a New Job
//         </h1>
//         <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>
//           Fill in the details to attract the best candidates
//         </p>

//         {/* Step indicator */}
//         <div
//           style={{
//             display: "flex",
//             gap: 0,
//             marginBottom: "2rem",
//             borderRadius: 10,
//             overflow: "hidden",
//             border: "1px solid var(--gray-200)",
//           }}
//         >
//           {STEPS.map((s, i) => (
//             <button
//               key={s}
//               onClick={() => i < step + 1 && setStep(i)}
//               style={{
//                 flex: 1,
//                 padding: "0.75rem",
//                 border: "none",
//                 cursor: i <= step ? "pointer" : "default",
//                 background:
//                   i === step
//                     ? "var(--primary)"
//                     : i < step
//                       ? "var(--primary-light)"
//                       : "#fff",
//                 color:
//                   i === step
//                     ? "#fff"
//                     : i < step
//                       ? "var(--primary)"
//                       : "var(--gray-500)",
//                 fontSize: "0.82rem",
//                 fontWeight: i === step ? 600 : 400,
//                 borderRight:
//                   i < STEPS.length - 1 ? "1px solid var(--gray-200)" : "none",
//                 transition: "0.2s",
//               }}
//             >
//               {i < step ? "✓ " : `${i + 1}. `}
//               {s}
//             </button>
//           ))}
//         </div>

//         <div className="card">
//           {/* Step 0: Basic Info */}
//           {step === 0 && (
//             <div>
//               <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
//                 Basic Information
//               </h2>
//               <div className="form-group">
//                 <label className="form-label">Job Title *</label>
//                 <input
//                   {...inputProps("title")}
//                   placeholder="e.g. Senior React Developer"
//                 />
//               </div>
//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Category *</label>
//                   <select
//                     className="form-control"
//                     value={form.category}
//                     onChange={(e) => set("category", e.target.value)}
//                   >
//                     {CATEGORIES.map((c) => (
//                       <option key={c}>{c}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Job Type *</label>
//                   <select
//                     className="form-control"
//                     value={form.jobType}
//                     onChange={(e) => set("jobType", e.target.value)}
//                   >
//                     {JOB_TYPES.map((t) => (
//                       <option key={t}>{t}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Location *</label>
//                 <input
//                   {...inputProps("location")}
//                   placeholder="e.g. Bangalore, India or Remote"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Step 1: Description */}
//           {step === 1 && (
//             <div>
//               <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
//                 Job Description
//               </h2>
//               <div className="form-group">
//                 <label className="form-label">Description *</label>
//                 <textarea
//                   {...inputProps("description")}
//                   rows={6}
//                   placeholder="Describe the role, company culture, what you're building..."
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Responsibilities</label>
//                 <textarea
//                   {...inputProps("responsibilities")}
//                   rows={4}
//                   placeholder="What will this person be doing day-to-day?"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Step 2: Requirements + Skills */}
//           {step === 2 && (
//             <div>
//               <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
//                 Requirements & Skills
//               </h2>
//               <div className="form-group">
//                 <label className="form-label">Requirements *</label>
//                 <textarea
//                   {...inputProps("requirements")}
//                   rows={5}
//                   placeholder="Degrees, certifications, must-have experience..."
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">
//                   Required Skills (used for AI matching)
//                 </label>
//                 <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={skillInput}
//                     onChange={(e) => setSkillInput(e.target.value)}
//                     onKeyDown={(e) =>
//                       e.key === "Enter" && (e.preventDefault(), addSkill())
//                     }
//                     placeholder="e.g. react, python, docker..."
//                   />
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={addSkill}
//                   >
//                     Add
//                   </button>
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                   {form.skills.map((s) => (
//                     <span
//                       key={s}
//                       className="skill-tag"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => removeSkill(s)}
//                     >
//                       {s} ✕
//                     </span>
//                   ))}
//                 </div>
//                 {form.skills.length === 0 && (
//                   <p
//                     style={{
//                       fontSize: "0.8rem",
//                       color: "var(--gray-400)",
//                       marginTop: 6,
//                     }}
//                   >
//                     Add skills to enable AI resume matching
//                   </p>
//                 )}
//               </div>
//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Min Experience (years)</label>
//                   <input {...inputProps("experienceMin", "number")} min={0} />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Max Experience (years)</label>
//                   <input {...inputProps("experienceMax", "number")} min={0} />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Salary & Settings */}
//           {step === 3 && (
//             <div>
//               <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
//                 Salary & Settings
//               </h2>
//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Min Salary (Annual)</label>
//                   <input
//                     {...inputProps("salaryMin", "number")}
//                     placeholder="e.g. 600000"
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Max Salary (Annual)</label>
//                   <input
//                     {...inputProps("salaryMax", "number")}
//                     placeholder="e.g. 1200000"
//                   />
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Application Deadline</label>
//                 <input {...inputProps("applicationDeadline", "date")} />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Post Status</label>
//                 <select
//                   className="form-control"
//                   value={form.status}
//                   onChange={(e) => set("status", e.target.value)}
//                 >
//                   <option value="active">
//                     Active — Accept applications now
//                   </option>
//                   <option value="draft">Draft — Save for later</option>
//                 </select>
//               </div>

//               {/* Summary preview */}
//               <div
//                 style={{
//                   background: "var(--gray-50)",
//                   borderRadius: 10,
//                   padding: "1rem",
//                   marginTop: "0.5rem",
//                   fontSize: "0.875rem",
//                 }}
//               >
//                 <strong>Job Summary:</strong>
//                 <div
//                   style={{
//                     marginTop: 8,
//                     display: "grid",
//                     gridTemplateColumns: "1fr 1fr",
//                     gap: "0.4rem",
//                     color: "var(--gray-600)",
//                   }}
//                 >
//                   <span>📌 {form.title || "Untitled"}</span>
//                   <span>📍 {form.location || "No location"}</span>
//                   <span>🏷️ {form.category}</span>
//                   <span>⏰ {form.jobType}</span>
//                   <span>🛠️ {form.skills.length} skills</span>
//                   <span>
//                     📅 {form.experienceMin}–{form.experienceMax} yrs
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Navigation */}
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginTop: "1.75rem",
//               paddingTop: "1.25rem",
//               borderTop: "1px solid var(--gray-200)",
//             }}
//           >
//             <button
//               className="btn btn-secondary"
//               disabled={step === 0}
//               onClick={() => setStep((s) => s - 1)}
//             >
//               ← Back
//             </button>
//             {step < STEPS.length - 1 ? (
//               <button
//                 className="btn btn-primary"
//                 onClick={() => setStep((s) => s + 1)}
//               >
//                 Next →
//               </button>
//             ) : (
//               <button
//                 className="btn btn-primary"
//                 onClick={handleSubmit}
//                 disabled={loading}
//               >
//                 {loading ? "Posting..." : "🚀 Post Job"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
