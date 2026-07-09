// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const user = await login(form.email, form.password);
//       navigate(
//         user.role === "recruiter"
//           ? "/recruiter/dashboard"
//           : "/candidate/dashboard",
//       );
//     } catch (err) {
//       setError(err.response?.data?.error || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "var(--gray-50)",
//         padding: "2rem",
//       }}
//     >
//       <div style={{ width: "100%", maxWidth: 420 }}>
//         {/* Logo */}
//         <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//           <div
//             style={{
//               width: 52,
//               height: 52,
//               background: "var(--primary)",
//               borderRadius: 14,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               fontWeight: 700,
//               fontSize: "1.4rem",
//               margin: "0 auto 1rem",
//             }}
//           >
//             H
//           </div>
//           <h1 style={{ fontSize: "1.5rem", marginBottom: 6 }}>Welcome back</h1>
//           <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
//             Sign in to your HireAI account
//           </p>
//         </div>

//         <div className="card">
//           {error && (
//             <div
//               style={{
//                 background: "#FEE2E2",
//                 color: "#991B1B",
//                 padding: "0.75rem 1rem",
//                 borderRadius: 8,
//                 marginBottom: "1.25rem",
//                 fontSize: "0.875rem",
//               }}
//             >
//               {error}
//             </div>
//           )}
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label className="form-label">Email address</label>
//               <input
//                 type="email"
//                 className="form-control"
//                 required
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, email: e.target.value }))
//                 }
//               />
//             </div>
//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 className="form-control"
//                 required
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, password: e.target.value }))
//                 }
//               />
//             </div>
//             <button
//               type="submit"
//               className="btn btn-primary btn-lg"
//               disabled={loading}
//               style={{ width: "100%", marginTop: "0.5rem" }}
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>

//           <div
//             style={{
//               textAlign: "center",
//               marginTop: "1.5rem",
//               fontSize: "0.875rem",
//               color: "var(--gray-500)",
//             }}
//           >
//             Don't have an account?{" "}
//             <Link to="/register" style={{ fontWeight: 600 }}>
//               Create one
//             </Link>
//           </div>
//         </div>

//         {/* Demo credentials hint */}
//         <div
//           style={{
//             marginTop: "1.25rem",
//             padding: "1rem",
//             background: "#EEF2FF",
//             borderRadius: 10,
//             fontSize: "0.82rem",
//             color: "var(--primary-dark)",
//           }}
//         >
//           <strong>Demo:</strong> Register as a Candidate or Recruiter to explore
//           all features.
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(
        user.role === "recruiter"
          ? "/recruiter/dashboard"
          : "/candidate/dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gray-50)",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "var(--primary)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.4rem",
              margin: "0 auto 1rem",
            }}
          >
            H
          </div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
            Sign in to your JobSpark account
          </p>
        </div>

        <div className="card">
          {error && (
            <div
              style={{
                background: "#FEE2E2",
                color: "#991B1B",
                padding: "0.75rem 1rem",
                borderRadius: 8,
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.875rem",
              color: "var(--gray-500)",
            }}
          >
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1rem",
            background: "#EEF2FF",
            borderRadius: 10,
            fontSize: "0.82rem",
            color: "var(--primary-dark)",
          }}
        >
          <strong>Demo:</strong> Register as a Candidate or Recruiter to explore
          all features.
        </div>
      </div>
    </div>
  );
}