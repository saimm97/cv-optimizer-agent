import { useRef, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { theme } from "../styles/theme";
import { ACCEPTED_FILE_TYPES } from "../utils/fileParser";

export function FileDropZone({ onFile, file, parsing, label, hint }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files[0]) {
      onFile(event.dataTransfer.files[0]);
    }
  };

  const iconCircle = (children, bg) => (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px",
        background: bg,
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      className="lift"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${dragging ? theme.accent : file ? "rgba(70,201,139,.4)" : theme.border}`,
        borderRadius: 14,
        padding: "30px 20px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? theme.accentSoft : theme.bgElevated,
        boxShadow: dragging ? theme.glow : "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        style={{ display: "none" }}
        onChange={(event) => event.target.files[0] && onFile(event.target.files[0])}
      />
      {parsing ? (
        <>
          {iconCircle(<Loader2 size={24} className="spin" style={{ color: theme.accent }} />, theme.accentSoft)}
          <div style={{ color: theme.dim, fontSize: 14 }}>Reading file…</div>
        </>
      ) : file ? (
        <>
          {iconCircle(<FileText size={24} style={{ color: theme.green }} />, "rgba(70,201,139,.12)")}
          <div style={{ color: theme.text, fontSize: 14, fontWeight: 600, wordBreak: "break-word" }}>
            {file.name}
          </div>
          <div style={{ color: theme.faint, fontSize: 12, marginTop: 4 }}>Click to replace</div>
        </>
      ) : (
        <>
          {iconCircle(<Upload size={24} style={{ color: theme.accent }} />, theme.accentSoft)}
          <div style={{ color: theme.text, fontSize: 14.5, fontWeight: 600 }}>{label}</div>
          <div style={{ color: theme.faint, fontSize: 12, marginTop: 4 }}>{hint}</div>
        </>
      )}
    </div>
  );
}
