"use client";

import { useState, useRef, useEffect } from "react";
import { Check, CheckCheck, MoreHorizontal, Pencil, Reply, Trash2 } from "lucide-react";

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageBubbleProps {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  readAt?: string | null;
  editedAt?: string;
  deletedAt?: string;
  reactions?: Reaction[];
  replyToContent?: string | null;
  replyToSenderName?: string | null;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (messageId: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function MessageBubble({
  id, content, timestamp, isOwn, readAt, editedAt, deletedAt,
  reactions = [], replyToContent, replyToSenderName, onReact, onEdit, onDelete, onReply,
}: MessageBubbleProps) {
  const [hovered,   setHovered]   = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [editValue, setEditValue] = useState(content);
  const menuRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyToContent !== undefined && replyToContent !== null) {
      console.log('[MessageBubble] reply props received:', { id, replyToContent, replyToSenderName });
    }
  }, [id, replyToContent, replyToSenderName]);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  useEffect(() => {
    if (editMode) {
      setEditValue(content);
      setTimeout(() => {
        inputRef.current?.focus();
        const len = inputRef.current?.value.length ?? 0;
        inputRef.current?.setSelectionRange(len, len);
      }, 0);
    }
  }, [editMode, content]);

  const submitEdit = () => {
    if (editValue.trim() && editValue.trim() !== content) {
      onEdit(id, editValue.trim());
    }
    setEditMode(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(); }
    if (e.key === "Escape") setEditMode(false);
  };

  if (deletedAt) {
    return (
      <div style={{ display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", marginBottom: 2 }}>
        <div style={{
          padding: "8px 14px",
          borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          border: "1px solid var(--border)",
          color: "var(--text3)",
          fontSize: 13,
          fontStyle: "italic",
        }}>
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative", display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start", marginBottom: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && !editMode && (
        <div style={{
          position: "absolute",
          top: -38,
          ...(isOwn ? { right: 0 } : { left: 0 }),
          display: "flex", gap: 2,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-hi)",
          borderRadius: 20,
          padding: "4px 6px",
          zIndex: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}>
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onReact(id, emoji)}
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", fontSize: 16, lineHeight: 1,
                width: 28, height: 28, borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => onReply(id)}
            style={{
              background: "transparent", border: "none",
              cursor: "pointer",
              width: 28, height: 28, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text2)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <Reply size={14} />
          </button>
          {isOwn && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowMenu(v => !v)}
                style={{
                  background: "transparent", border: "none",
                  cursor: "pointer",
                  width: 28, height: 28, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text2)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <MoreHorizontal size={15} />
              </button>
              {showMenu && (
                <div style={{
                  position: "absolute", top: 32, right: 0,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-hi)",
                  borderRadius: 8,
                  overflow: "hidden",
                  zIndex: 30,
                  minWidth: 120,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}>
                  <button
                    onClick={() => { setEditMode(true); setShowMenu(false); }}
                    style={{
                      width: "100%", padding: "8px 12px",
                      background: "transparent", border: "none",
                      color: "var(--text1)", fontSize: 13,
                      display: "flex", alignItems: "center", gap: 8,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(id); setShowMenu(false); }}
                    style={{
                      width: "100%", padding: "8px 12px",
                      background: "transparent", border: "none",
                      color: "#FF6B6B", fontSize: 13,
                      display: "flex", alignItems: "center", gap: 8,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{
        maxWidth: "65%",
        padding: "10px 14px",
        borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        background: isOwn ? "var(--accent-dim)" : "var(--bg-surface)",
        border: isOwn ? "1px solid rgba(0, 212, 168, 0.2)" : "1px solid var(--border)",
        color: "var(--text1)",
      }}>
        {replyToContent && (
          <div style={{
            borderLeft: "2px solid var(--accent)",
            background: "rgba(0,212,168,0.05)",
            padding: "4px 8px",
            borderRadius: "0 4px 4px 0",
            marginBottom: 6,
          }}>
            {replyToSenderName && (
              <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, marginBottom: 2 }}>
                {replyToSenderName}
              </div>
            )}
            <p style={{
              margin: 0, fontSize: 11, color: "var(--text2)", lineHeight: 1.4,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {replyToContent}
            </p>
          </div>
        )}
        {editMode ? (
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            rows={1}
            style={{
              width: "100%", minWidth: 180,
              background: "var(--bg-active)",
              border: "1px solid var(--border-hi)",
              borderRadius: 6,
              color: "var(--text1)",
              fontSize: 14, lineHeight: 1.5,
              padding: "4px 8px",
              resize: "none", outline: "none",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          />
        ) : (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>
            {content}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
          {editedAt && (
            <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
              edited
            </span>
          )}
          <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
            {timestamp}
          </span>
          {isOwn && (
            readAt
              ? <CheckCheck size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
              : <Check      size={12} style={{ color: "var(--text3)",  flexShrink: 0 }} />
          )}
        </div>

        {reactions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {reactions.map(rx => (
              <button
                key={rx.emoji}
                onClick={() => onReact(id, rx.emoji)}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  padding: "2px 6px",
                  borderRadius: 10,
                  background: rx.userReacted ? "rgba(0,212,168,0.15)" : "var(--bg-active)",
                  border: rx.userReacted ? "1px solid rgba(0,212,168,0.4)" : "1px solid var(--border)",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text1)",
                }}
              >
                <span>{rx.emoji}</span>
                <span style={{ fontSize: 11, color: "var(--text2)", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
                  {rx.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}