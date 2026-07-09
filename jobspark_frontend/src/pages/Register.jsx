import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(
        user.role === "recruiter"
          ? "/recruiter/dashboard"
          : "/candidate/dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

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
      <div style={{ width: "100%", maxWidth: 460 }}>
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
          <h1 style={{ fontSize: "1.5rem", marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
            Join thousands of candidates and recruiters
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

          {/* Role selector */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: "1.5rem",
            }}
          >
            {[
              {
                role: "candidate",
                label: "🎯 I'm a Candidate",
                desc: "Looking for jobs",
              },
              {
                role: "recruiter",
                label: "🏢 I'm a Recruiter",
                desc: "Hiring talent",
              },
            ].map(({ role, label, desc }) => (
              <button
                key={role}
                type="button"
                onClick={() => set("role", role)}
                style={{
                  padding: "1rem",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "left",
                  border: `2px solid ${form.role === role ? "var(--primary)" : "var(--gray-200)"}`,
                  background:
                    form.role === role ? "var(--primary-light)" : "#fff",
                  transition: "0.2s",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color:
                      form.role === role ? "var(--primary)" : "var(--gray-900)",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--gray-500)",
                    marginTop: 2,
                  }}
                >
                  {desc}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Rahul Kumar"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              {form.password.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background:
                          form.password.length >= i * 3
                            ? i <= 1
                              ? "#EF4444"
                              : i <= 2
                                ? "#F59E0B"
                                : i <= 3
                                  ? "#3B82F6"
                                  : "#10B981"
                            : "var(--gray-200)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {loading
                ? "Creating account..."
                : `Create ${form.role === "recruiter" ? "Recruiter" : "Candidate"} Account`}
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
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
