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

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? theme.accent : theme.border}`,
        borderRadius: 12,
        padding: "32px 20px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? "rgba(212,160,86,.05)" : theme.panel,
        transition: "all .2s",
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
          <Loader2 size={28} className="spin" style={{ color: theme.accent, marginBottom: 10 }} />
          <div style={{ color: theme.dim, fontSize: 14 }}>Reading file…</div>
        </>
      ) : file ? (
        <>
          <FileText size={28} style={{ color: theme.green, marginBottom: 10 }} />
          <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{file.name}</div>
          <div style={{ color: theme.faint, fontSize: 12, marginTop: 4 }}>Click to replace</div>
        </>
      ) : (
        <>
          <Upload size={28} style={{ color: theme.faint, marginBottom: 10 }} />
          <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{label}</div>
          <div style={{ color: theme.faint, fontSize: 12, marginTop: 4 }}>{hint}</div>
        </>
      )}
    </div>
  );
}
