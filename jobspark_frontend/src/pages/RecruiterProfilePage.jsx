// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { authAPI } from "../services/api";
// import toast from "react-hot-toast";

// export default function RecruiterProfilePage() {
//   const { user, updateUser } = useAuth();
//   const profile = user?.recruiterProfile || {};

//   const [form, setForm] = useState({
//     name: user?.name || "",
//     phone: user?.phone || "",
//     company: profile.company || "",
//     companyWebsite: profile.companyWebsite || "",
//     companySize: profile.companySize || "",
//     industry: profile.industry || "",
//     designation: profile.designation || "",
//     department: profile.department || "",
//   });
//   const [saving, setSaving] = useState(false);

//   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await authAPI.updateProfile({
//         name: form.name,
//         phone: form.phone,
//         recruiterProfile: {
//           company: form.company,
//           companyWebsite: form.companyWebsite,
//           companySize: form.companySize,
//           industry: form.industry,
//           designation: form.designation,
//           department: form.department,
//         },
//       });
//       updateUser({ name: form.name });
//       toast.success("Profile saved successfully!");
//     } catch (err) {
//       toast.error("Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const initials =
//     user?.name
//       ?.split(" ")
//       .map((w) => w[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2) || "R";

//   return (
//     <div className="page">
//       <div className="container" style={{ maxWidth: 760 }}>
//         {/* Header */}
//         <div style={{ marginBottom: "2rem" }}>
//           <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
//             Recruiter Profile
//           </h1>
//           <p style={{ color: "var(--gray-500)" }}>
//             Manage your personal and company information
//           </p>
//         </div>

//         {/* Profile Card */}
//         <div
//           className="card"
//           style={{
//             marginBottom: "1.5rem",
//             display: "flex",
//             alignItems: "center",
//             gap: 20,
//           }}
//         >
//           <div
//             style={{
//               width: 72,
//               height: 72,
//               borderRadius: "50%",
//               background: "var(--primary)",
//               color: "#fff",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "1.5rem",
//               fontWeight: 700,
//               flexShrink: 0,
//             }}
//           >
//             {initials}
//           </div>
//           <div>
//             <h2
//               style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 2 }}
//             >
//               {user?.name}
//             </h2>
//             <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
//               {user?.email}
//             </p>
//             <span className="badge badge-primary" style={{ marginTop: 6 }}>
//               Recruiter
//             </span>
//           </div>
//         </div>

//         <form onSubmit={handleSave}>
//           {/* Personal Info */}
//           <div className="card" style={{ marginBottom: "1.5rem" }}>
//             <h3
//               style={{
//                 fontSize: "1rem",
//                 fontWeight: 600,
//                 marginBottom: "1.25rem",
//               }}
//             >
//               👤 Personal Information
//             </h3>
//             <div className="grid-2">
//               <div className="form-group">
//                 <label className="form-label">Full Name</label>
//                 <input
//                   className="form-control"
//                   value={form.name}
//                   onChange={(e) => set("name", e.target.value)}
//                   placeholder="Your full name"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Phone Number</label>
//                 <input
//                   className="form-control"
//                   value={form.phone}
//                   onChange={(e) => set("phone", e.target.value)}
//                   placeholder="+91 9876543210"
//                 />
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Email Address</label>
//               <input
//                 className="form-control"
//                 value={user?.email}
//                 disabled
//                 style={{
//                   background: "var(--gray-50)",
//                   color: "var(--gray-500)",
//                 }}
//               />
//               <p
//                 style={{
//                   fontSize: "0.75rem",
//                   color: "var(--gray-400)",
//                   marginTop: 4,
//                 }}
//               >
//                 Email cannot be changed
//               </p>
//             </div>
//             <div className="grid-2">
//               <div className="form-group">
//                 <label className="form-label">Designation</label>
//                 <input
//                   className="form-control"
//                   value={form.designation}
//                   onChange={(e) => set("designation", e.target.value)}
//                   placeholder="e.g. HR Manager, Tech Lead"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Department</label>
//                 <input
//                   className="form-control"
//                   value={form.department}
//                   onChange={(e) => set("department", e.target.value)}
//                   placeholder="e.g. Engineering, Human Resources"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Company Info */}
//           <div className="card" style={{ marginBottom: "1.5rem" }}>
//             <h3
//               style={{
//                 fontSize: "1rem",
//                 fontWeight: 600,
//                 marginBottom: "1.25rem",
//               }}
//             >
//               🏢 Company Information
//             </h3>
//             <div className="grid-2">
//               <div className="form-group">
//                 <label className="form-label">Company Name</label>
//                 <input
//                   className="form-control"
//                   value={form.company}
//                   onChange={(e) => set("company", e.target.value)}
//                   placeholder="e.g. TechCorp India"
//                 />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Company Website</label>
//                 <input
//                   className="form-control"
//                   value={form.companyWebsite}
//                   onChange={(e) => set("companyWebsite", e.target.value)}
//                   placeholder="https://company.com"
//                 />
//               </div>
//             </div>
//             <div className="grid-2">
//               <div className="form-group">
//                 <label className="form-label">Industry</label>
//                 <select
//                   className="form-control"
//                   value={form.industry}
//                   onChange={(e) => set("industry", e.target.value)}
//                 >
//                   <option value="">Select Industry</option>
//                   {[
//                     "Technology",
//                     "Finance",
//                     "Healthcare",
//                     "Education",
//                     "E-commerce",
//                     "Manufacturing",
//                     "Media",
//                     "Consulting",
//                     "Government",
//                     "Other",
//                   ].map((i) => (
//                     <option key={i} value={i}>
//                       {i}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Company Size</label>
//                 <select
//                   className="form-control"
//                   value={form.companySize}
//                   onChange={(e) => set("companySize", e.target.value)}
//                 >
//                   <option value="">Select Size</option>
//                   {[
//                     "1-10",
//                     "11-50",
//                     "51-200",
//                     "201-500",
//                     "501-1000",
//                     "1000+",
//                   ].map((s) => (
//                     <option key={s} value={s}>
//                       {s} employees
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Stats */}
//           <div
//             className="card"
//             style={{ marginBottom: "1.5rem", background: "var(--gray-50)" }}
//           >
//             <h3
//               style={{
//                 fontSize: "1rem",
//                 fontWeight: 600,
//                 marginBottom: "1rem",
//               }}
//             >
//               📊 Account Stats
//             </h3>
//             <div className="grid-2">
//               {[
//                 {
//                   label: "Member Since",
//                   value: user?.createdAt
//                     ? new Date(user.createdAt).toLocaleDateString("en-IN")
//                     : "—",
//                 },
//                 { label: "Account Role", value: "Recruiter" },
//                 {
//                   label: "Email Verified",
//                   value: user?.isVerified ? "✅ Yes" : "⏳ Pending",
//                 },
//                 {
//                   label: "Account Status",
//                   value: user?.isActive ? "🟢 Active" : "🔴 Inactive",
//                 },
//               ].map(({ label, value }) => (
//                 <div
//                   key={label}
//                   style={{
//                     padding: "0.75rem",
//                     background: "#fff",
//                     borderRadius: 8,
//                     border: "1px solid var(--gray-200)",
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontSize: "0.75rem",
//                       color: "var(--gray-500)",
//                       marginBottom: 2,
//                     }}
//                   >
//                     {label}
//                   </div>
//                   <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
//                     {value}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary btn-lg"
//             style={{ width: "100%" }}
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "💾 Save Profile"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function RecruiterProfilePage() {
  const { user, updateUser } = useAuth();
  const profile = user?.recruiterProfile || {};

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    company: profile.company || "",
    companyWebsite: profile.companyWebsite || "",
    companySize: profile.companySize || "",
    industry: profile.industry || "",
    designation: profile.designation || "",
    department: profile.department || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        recruiterProfile: {
          company: form.company,
          companyWebsite: form.companyWebsite,
          companySize: form.companySize,
          industry: form.industry,
          designation: form.designation,
          department: form.department,
        },
      });
      updateUser({ name: form.name });
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "R";

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: 4 }}>
            Recruiter Profile
          </h1>
          <p style={{ color: "var(--gray-500)" }}>
            Manage your personal and company information
          </p>
        </div>

        {/* Profile Card */}
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h2
              style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 2 }}
            >
              {user?.name}
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
              {user?.email}
            </p>
            <span className="badge badge-primary" style={{ marginTop: 6 }}>
              Recruiter
            </span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* Personal Info */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "1.25rem",
              }}
            >
              👤 Personal Information
            </h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                value={user?.email}
                disabled
                style={{
                  background: "var(--gray-50)",
                  color: "var(--gray-500)",
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gray-400)",
                  marginTop: 4,
                }}
              >
                Email cannot be changed
              </p>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  className="form-control"
                  value={form.designation}
                  onChange={(e) => set("designation", e.target.value)}
                  placeholder="e.g. HR Manager, Tech Lead"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  className="form-control"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  placeholder="e.g. Engineering, Human Resources"
                />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "1.25rem",
              }}
            >
              🏢 Company Information
            </h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  className="form-control"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="e.g. TechCorp India"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Website</label>
                <input
                  className="form-control"
                  value={form.companyWebsite}
                  onChange={(e) => set("companyWebsite", e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  className="form-control"
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                >
                  <option value="">Select Industry</option>
                  {[
                    "Technology",
                    "Finance",
                    "Healthcare",
                    "Education",
                    "E-commerce",
                    "Manufacturing",
                    "Media",
                    "Consulting",
                    "Government",
                    "Other",
                  ].map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Company Size</label>
                <select
                  className="form-control"
                  value={form.companySize}
                  onChange={(e) => set("companySize", e.target.value)}
                >
                  <option value="">Select Size</option>
                  {[
                    "1-10",
                    "11-50",
                    "51-200",
                    "201-500",
                    "501-1000",
                    "1000+",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s} employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={saving}
          >
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}