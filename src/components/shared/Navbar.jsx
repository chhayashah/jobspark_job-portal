// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { useTheme } from "../../context/ThemeContext";
// import NotificationBell from "./NotificationBell";

// export default function Navbar() {
//   const { user, logout, isRecruiter, isCandidate } = useAuth();
//   const { isDark, toggleTheme } = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   const navLink = (to, label) => (
//     <Link
//       to={to}
//       style={{
//         padding: "0.5rem 0.75rem",
//         borderRadius: 8,
//         fontWeight: 500,
//         fontSize: "0.9rem",
//         transition: "0.2s",
//         background: location.pathname.startsWith(to)
//           ? "var(--primary-light)"
//           : "transparent",
//         color: location.pathname.startsWith(to)
//           ? "var(--primary)"
//           : "var(--text-secondary)",
//         textDecoration: "none",
//         display: "inline-block",
//       }}
//     >
//       {label}
//     </Link>
//   );

//   return (
//     <nav
//       style={{
//         background: "var(--nav-bg)",
//         borderBottom: "1px solid var(--nav-border)",
//         height: 64,
//         display: "flex",
//         alignItems: "center",
//         position: "sticky",
//         top: 0,
//         zIndex: 100,
//         boxShadow: "var(--shadow-sm)",
//         transition: "background 0.3s ease",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: 1200,
//           margin: "0 auto",
//           padding: "0 1.5rem",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           width: "100%",
//         }}
//       >
//         {/* Logo */}
//         <Link
//           to="/"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//             textDecoration: "none",
//           }}
//         >
//           <div
//             style={{
//               width: 36,
//               height: 36,
//               background: "var(--primary)",
//               borderRadius: 10,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               fontWeight: 700,
//               fontSize: "1rem",
//             }}
//           >
//             H
//           </div>
//           <span
//             style={{
//               fontWeight: 700,
//               fontSize: "1.1rem",
//               color: "var(--text-primary)",
//               fontFamily: "DM Sans, sans-serif",
//             }}
//           >
//             Hire<span style={{ color: "var(--primary)" }}>AI</span>
//           </span>
//         </Link>

//         {/* Center Nav */}
//         <div
//           style={{
//             display: "flex",
//             gap: 4,
//             alignItems: "center",
//             flexWrap: "wrap",
//           }}
//         >
//           {navLink("/jobs", "Browse Jobs")}
//           {isCandidate && navLink("/candidate/dashboard", "Dashboard")}
//           {isCandidate && navLink("/candidate/applications", "Applications")}
//           {isCandidate && navLink("/resume-versions", "Resumes")}
//           {isCandidate && navLink("/resume-score", "Score")}
//           {isRecruiter && navLink("/recruiter/dashboard", "Dashboard")}
//           {isRecruiter && navLink("/recruiter/analytics", "Analytics")}
//           {isRecruiter && navLink("/recruiter/profile", "My Profile")}
//           {isRecruiter && (
//             <Link
//               to="/recruiter/jobs/new"
//               className="btn btn-primary btn-sm"
//               style={{ marginLeft: 8 }}
//             >
//               + Post Job
//             </Link>
//           )}
//         </div>

//         {/* Right side */}
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           {/* 🌙 Theme Toggle Button */}
//           <button
//             onClick={toggleTheme}
//             title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
//             style={{
//               width: 38,
//               height: 38,
//               borderRadius: 9,
//               border: "1.5px solid var(--border-color)",
//               background: "var(--card-bg)",
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: "17px",
//               transition: "all 0.2s",
//             }}
//           >
//             {isDark ? "☀️" : "🌙"}
//           </button>

//           {user ? (
//             <>
//               <NotificationBell />
//               <Link
//                 to={isRecruiter ? "/recruiter/dashboard" : "/candidate/profile"}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                   textDecoration: "none",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 36,
//                     height: 36,
//                     borderRadius: "50%",
//                     background: "var(--primary)",
//                     color: "#fff",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: 600,
//                     fontSize: "0.9rem",
//                   }}
//                 >
//                   {user.name?.[0]?.toUpperCase()}
//                 </div>
//                 <span
//                   style={{
//                     fontSize: "0.9rem",
//                     fontWeight: 500,
//                     color: "var(--text-secondary)",
//                   }}
//                 >
//                   {user.name?.split(" ")[0]}
//                 </span>
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="btn btn-secondary btn-sm"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className="btn btn-secondary btn-sm">
//                 Login
//               </Link>
//               <Link to="/register" className="btn btn-primary btn-sm">
//                 Sign Up
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout, isRecruiter, isCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        padding: "0.5rem 0.75rem",
        borderRadius: 8,
        fontWeight: 500,
        fontSize: "0.9rem",
        transition: "0.2s",
        background: location.pathname.startsWith(to)
          ? "var(--primary-light)"
          : "transparent",
        color: location.pathname.startsWith(to)
          ? "var(--primary)"
          : "var(--gray-700)",
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--gray-200)",
        height: 64,
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--primary)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            J
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--gray-900)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Job<span style={{ color: "var(--primary)" }}>Spark</span>
          </span>
        </Link>

        {/* Center Nav */}
        <div
          style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {navLink("/jobs", "Browse Jobs")}
          {isCandidate && navLink("/candidate/dashboard", "Dashboard")}
          {isCandidate && navLink("/candidate/applications", "Applications")}
          {isCandidate && navLink("/resume-versions", "Resumes")}
          {isCandidate && navLink("/resume-score", "Score")}
          {isRecruiter && navLink("/recruiter/dashboard", "Dashboard")}
          {isRecruiter && navLink("/recruiter/analytics", "Analytics")}
          {isRecruiter && (
            <Link
              to="/recruiter/jobs/new"
              className="btn btn-primary btn-sm"
              style={{ marginLeft: 8 }}
            >
              + Post Job
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <NotificationBell />
              <Link
                to={isRecruiter ? "/recruiter/dashboard" : "/candidate/profile"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "var(--gray-700)",
                  }}
                >
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}