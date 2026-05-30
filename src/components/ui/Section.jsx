import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { theme } from "../../styles/theme";

export function Section({ icon: Icon, title, children, defaultOpen = true, count }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        marginBottom: 16,
        overflow: "hidden",
        boxShadow: theme.shadowSoft,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: theme.text,
        }}
      >
        <Icon size={18} style={{ color: theme.accent }} />
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: "left" }}>{title}</span>
        {count != null && (
          <span
            style={{
              fontSize: 11,
              background: theme.panel2,
              color: theme.dim,
              padding: "2px 9px",
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
            }}
          >
            {count}
          </span>
        )}
        {open ? (
          <ChevronDown size={18} style={{ color: theme.faint }} />
        ) : (
          <ChevronRight size={18} style={{ color: theme.faint }} />
        )}
      </button>
      {open && <div style={{ padding: "0 20px 20px" }}>{children}</div>}
    </div>
  );
}
