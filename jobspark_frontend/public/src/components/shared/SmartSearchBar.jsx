import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { advancedJobsAPI } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";

export default function SmartSearchBar({
  initialValue = "",
  placeholder = "Search jobs, skills, companies...",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSugg] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("normal"); // 'normal' | 'boolean'
  const debouncedQ = useDebounce(query, 320);
  const ref = useRef(null);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedQ.length < 2 || mode === "boolean") {
      setSugg([]);
      return;
    }
    advancedJobsAPI
      .autocomplete(debouncedQ)
      .then((d) => {
        setSugg(d.suggestions || []);
        setOpen(true);
      })
      .catch(() => {});
  }, [debouncedQ, mode]);

  // Detect boolean keywords
  useEffect(() => {
    const hasBool = /\b(AND|OR|NOT)\b/i.test(query);
    setMode(hasBool ? "boolean" : "normal");
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q = query) => {
    setOpen(false);
    if (mode === "boolean") {
      navigate(`/jobs?boolean=${encodeURIComponent(q)}`);
    } else {
      navigate(`/jobs?search=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            style={{
              borderRadius: "10px 0 0 10px",
              paddingRight: mode === "boolean" ? "90px" : "14px",
            }}
          />
          {mode === "boolean" && (
            <span
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.72rem",
                background: "#EEF2FF",
                color: "var(--primary)",
                padding: "2px 7px",
                borderRadius: 99,
                fontWeight: 600,
                pointerEvents: "none",
              }}
            >
              BOOLEAN
            </span>
          )}
        </div>
        <button
          onClick={() => handleSearch()}
          className="btn btn-primary"
          style={{
            borderRadius: "0 10px 10px 0",
            padding: "0 20px",
            whiteSpace: "nowrap",
          }}
        >
          Search
        </button>
      </div>

      {/* Boolean hint */}
      {mode === "boolean" && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--primary)",
            marginTop: 4,
            marginLeft: 2,
          }}
        >
          💡 Boolean mode: use AND, OR, NOT — e.g. "React AND Node "
        </p>
      )}

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "44px",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid var(--gray-200)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 500,
            overflow: "hidden",
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(s.label);
                handleSearch(s.label);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                borderBottom:
                  i < suggestions.length - 1
                    ? "1px solid var(--gray-50)"
                    : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--gray-50)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize: "14px" }}>
                {s.type === "skill" ? "🛠️" : "💼"}
              </span>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#111",
                  }}
                >
                  {s.label}
                </div>
                {s.sub && (
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}
                  >
                    {s.sub}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
