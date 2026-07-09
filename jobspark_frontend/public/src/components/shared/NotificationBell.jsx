import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICON = {
  application: "📩",
  status_update: "📋",
  job_alert: "💼",
  shortlisted: "⭐",
  interview: "🗓️",
  offer: "🎉",
  system: "🔔",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markAllRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unreadCount > 0) markAllRead();
        }}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 9,
          border: "1.5px solid var(--gray-200)",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          transition: "background 0.15s",
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#EF4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: 360,
            maxHeight: 480,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--gray-200)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            zIndex: 999,
            animation: "slideDown 0.15s ease",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--gray-100)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "36px",
                textAlign: "center",
                color: "var(--gray-500)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔔</div>
              <p style={{ fontSize: "0.875rem" }}>No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 15).map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--gray-50)",
                  background: n.read ? "#fff" : "#F0F7FF",
                  cursor: n.link ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
                onClick={() => {
                  if (n.link) window.location.href = n.link;
                }}
              >
                <div
                  style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  <span
                    style={{ fontSize: "18px", flexShrink: 0, marginTop: 1 }}
                  >
                    {TYPE_ICON[n.type] || "🔔"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: n.read ? 400 : 600,
                        marginBottom: 2,
                        color: "#111",
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--gray-500)",
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--gray-400)",
                        marginTop: 4,
                      }}
                    >
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#3B82F6",
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
