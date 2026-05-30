import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { theme } from "../../styles/theme";

export function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        background: theme.panel2,
        border: `1px solid ${theme.border}`,
        color: copied ? theme.green : theme.dim,
        padding: "6px 11px",
        borderRadius: 7,
        cursor: "pointer",
      }}
    >
      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
}
