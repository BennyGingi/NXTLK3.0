import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  readAt?: string | null;
}

export default function MessageBubble({ content, timestamp, isOwn, readAt }: MessageBubbleProps) {
  return (
    <div style={{
      display: "flex",
      justifyContent: isOwn ? "flex-end" : "flex-start",
    }}>
      <div style={{
        maxWidth: "65%",
        padding: "10px 14px",
        borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        background: isOwn ? "var(--accent-dim)" : "var(--bg-surface)",
        border: isOwn ? "1px solid rgba(0, 212, 168, 0.2)" : "1px solid var(--border)",
        color: "var(--text1)",
      }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}>
          {content}
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 4, marginTop: 4,
        }}>
          <span style={{
            fontSize: 10,
            color: "var(--text3)",
            fontFamily: "var(--font-jetbrains-mono, monospace)",
          }}>
            {timestamp}
          </span>
          {isOwn && (
            readAt
              ? <CheckCheck size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
              : <Check      size={12} style={{ color: "var(--text3)",  flexShrink: 0 }} />
          )}
        </div>
      </div>
    </div>
  );
}
