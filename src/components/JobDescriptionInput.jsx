import { useState } from "react";
import { Briefcase, Upload } from "lucide-react";
import { theme } from "../styles/theme";
import { FileDropZone } from "./FileDropZone";

export function JobDescriptionInput({ value, onChange, onFileUpload, jdFile, parsingJd }) {
  const [mode, setMode] = useState("paste");

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: 0.3,
            color: theme.dim,
          }}
        >
          <Briefcase size={15} style={{ color: theme.accent }} /> JOB DESCRIPTION
        </div>
        <div
          style={{
            display: "flex",
            background: theme.panel2,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {[
            { id: "paste", label: "Paste" },
            { id: "upload", label: "Upload" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={{
                padding: "5px 12px",
                fontSize: 11.5,
                border: "none",
                cursor: "pointer",
                background: mode === tab.id ? theme.accent : "transparent",
                color: mode === tab.id ? "#1a1205" : theme.dim,
                fontWeight: mode === tab.id ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "paste" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste the full job description — responsibilities, requirements, qualifications…"
          style={{
            width: "100%",
            height: 158,
            resize: "none",
            background: theme.bgElevated,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            color: theme.text,
            padding: 16,
            fontSize: 13.5,
            lineHeight: 1.6,
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "border-color .18s ease, box-shadow .18s ease",
          }}
        />
      ) : (
        <>
          <FileDropZone
            onFile={onFileUpload}
            file={jdFile}
            parsing={parsingJd}
            label="Drop job description file"
            hint="PDF, DOCX or TXT"
          />
          {value && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: theme.faint }}>
              ✓ {value.split(/\s+/).length} words extracted
            </div>
          )}
        </>
      )}
    </div>
  );
}
