import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout, isRecruiter, isCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  const navLink = (to, label, onClick) => (
    <Link
      key={to}
      to={to}
      onClick={onClick}
      style={{
        padding: "0.5rem 0.75rem",
        borderRadius: 8,
        fontWeight: 500,
        fontSize: "0.9rem",
        transition: "0.2s",
        whiteSpace: "nowrap",
        background: isActive(to) ? "var(--primary-light)" : "transparent",
        color: isActive(to) ? "var(--primary)" : "var(--gray-700)",
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {label}
    </Link>
  );

  return (
    <>
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
            gap: 8,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "var(--primary)",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              J
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "var(--gray-900)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Job<span style={{ color: "var(--primary)" }}>Spark</span>
            </span>
          </Link>

          {/* Desktop Nav — hidden on small screens */}
          <div
            style={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "nowrap",
              overflow: "hidden",
            }}
            className="desktop-nav"
          >
            {navLink("/jobs", "Browse Jobs")}
            {isCandidate && navLink("/candidate/dashboard", "Dashboard")}
            {isCandidate && navLink("/candidate/applications", "Applications")}
            {isCandidate && navLink("/resume-versions", "Resumes")}
            {isCandidate && navLink("/resume-score", "Score")}
            {isRecruiter && navLink("/recruiter/dashboard", "Dashboard")}
            {isRecruiter && navLink("/recruiter/analytics", "Analytics")}
            {isRecruiter && navLink("/recruiter/profile", "My Profile")}
            {isRecruiter && (
              <Link
                to="/recruiter/jobs/new"
                className="btn btn-primary btn-sm"
                style={{ marginLeft: 6, flexShrink: 0 }}
              >
                + Post Job
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {user ? (
              <>
                <NotificationBell />

                {/* Avatar */}
                <Link
                  to={isRecruiter ? "/recruiter/profile" : "/candidate/profile"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--gray-700)",
                      display: "none",
                    }}
                    className="user-name"
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

                {/* Hamburger — only on small screens */}
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="hamburger-btn"
                  style={{
                    display: "none", // shown via CSS media query
                    background: "none",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "var(--gray-700)",
                  }}
                >
                  {menuOpen ? "✕" : "☰"}
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

      {/* Mobile Menu Dropdown */}
      {menuOpen && user && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "#fff",
            borderBottom: "1px solid var(--gray-200)",
            zIndex: 99,
            padding: "1rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navLink("/jobs", "Browse Jobs", () => setMenuOpen(false))}
          {isCandidate &&
            navLink("/candidate/dashboard", "Dashboard", () =>
              setMenuOpen(false),
            )}
          {isCandidate &&
            navLink("/candidate/applications", "Applications", () =>
              setMenuOpen(false),
            )}
          {isCandidate &&
            navLink("/resume-versions", "Resumes", () => setMenuOpen(false))}
          {isCandidate &&
            navLink("/resume-score", "Score", () => setMenuOpen(false))}
          {isRecruiter &&
            navLink("/recruiter/dashboard", "Dashboard", () =>
              setMenuOpen(false),
            )}
          {isRecruiter &&
            navLink("/recruiter/analytics", "Analytics", () =>
              setMenuOpen(false),
            )}
          {isRecruiter &&
            navLink("/recruiter/profile", "My Profile", () =>
              setMenuOpen(false),
            )}
          {isRecruiter && (
            <Link
              to="/recruiter/jobs/new"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 8, textAlign: "center" }}
            >
              + Post Job
            </Link>
          )}
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .hamburger-btn { display: none !important; }
          .user-name { display: inline !important; }
        }
      `}</style>
    </>
  );
}

// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import NotificationBell from "./NotificationBell";

// export default function Navbar() {
//   const { user, logout, isRecruiter, isCandidate } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [mobileOpen, setMobileOpen] = useState(false);

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
//           : "var(--gray-700)",
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
//         background: "#fff",
//         borderBottom: "1px solid var(--gray-200)",
//         height: 64,
//         display: "flex",
//         alignItems: "center",
//         position: "sticky",
//         top: 0,
//         zIndex: 100,
//         boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
//             J
//           </div>
//           <span
//             style={{
//               fontWeight: 700,
//               fontSize: "1.1rem",
//               color: "var(--gray-900)",
//               fontFamily: "DM Sans, sans-serif",
//             }}
//           >
//             Job<span style={{ color: "var(--primary)" }}>Spark</span>
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

//         {/* Right Side */}
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
//                     color: "var(--gray-700)",
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
