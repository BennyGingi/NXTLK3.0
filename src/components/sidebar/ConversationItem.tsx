"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCheck, VolumeX, MapPin } from "lucide-react";
import type { Conversation } from "@/lib/types";
import { getDefaultAvatar } from "@/lib/avatar";

interface ConversationItemProps {
  convo: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  currentUserId: string;
}

type MenuItem =
  | { type: "action"; label: string; action: string; danger?: boolean }
  | { type: "divider" };

const MENU: MenuItem[] = [
  { type: "action", label: "Pin chat",         action: "pin" },
  { type: "action", label: "Mute",             action: "mute" },
  { type: "action", label: "Mark as unread",   action: "unread" },
  { type: "divider" },
  { type: "action", label: "Delete chat",      action: "delete", danger: true },
];

/* ── Typing indicator ──────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 3, height: 3, borderRadius: "50%",
            background: "var(--accent)",
            animation: `bounce-dot 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Avatar ────────────────────────────────────────────── */
function ConvoAvatar({ convo }: { convo: Conversation }) {
  if (convo.group && convo.groupMembers && convo.groupMembers.length >= 2) {
    const [m1, m2] = convo.groupMembers;
    return (
      <div style={{ position: "relative", width: 38, height: 38, flexShrink: 0 }}>
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: 24, height: 24, borderRadius: "50%",
          background: m1.avatarBg, color: m1.avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, zIndex: 2,
          border: "1.5px solid var(--bg-surface)",
        }}>
          {m1.initials}
        </div>
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: 24, height: 24, borderRadius: "50%",
          background: m2.avatarBg, color: m2.avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, zIndex: 1,
          border: "1.5px solid var(--bg-surface)",
        }}>
          {m2.initials}
        </div>
      </div>
    );
  }

  const dotColor =
    convo.online === "online" ? "#00D4A8" :
    convo.online === "away"   ? "#F5A623" :
    "#3E4456";

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={convo.avatarUrl ?? getDefaultAvatar(convo.id, convo.name)}
        alt={convo.name}
        style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
      {convo.online && (
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: 9, height: 9, borderRadius: "50%",
          background: dotColor,
          border: "2px solid var(--bg-surface)",
        }} />
      )}
    </div>
  );
}

/* ── Context menu ──────────────────────────────────────── */
function ContextMenu({
  x, y, onClose,
}: { x: number; y: number; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", top: y, left: x,
        zIndex: 1000,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-hi)",
        borderRadius: 10, padding: "4px 0",
        minWidth: 172,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        animation: "scale-in 0.12s ease forwards",
        transformOrigin: "top left",
      }}
    >
      {MENU.map((item, i) => {
        if (item.type === "divider") {
          return <div key={i} style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />;
        }
        return (
          <MenuRow key={i} label={item.label} danger={item.danger} onClose={onClose} />
        );
      })}
    </div>
  );
}

function MenuRow({ label, danger, onClose }: { label: string; danger?: boolean; onClose: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", width: "100%",
        padding: "7px 14px",
        background: hovered ? "var(--bg-hover)" : "none",
        border: "none", textAlign: "left",
        fontSize: 12.5,
        color: danger ? "#FF5A5A" : "var(--text1)",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      {label}
    </button>
  );
}

/* ── Main component ────────────────────────────────────── */
export default function ConversationItem({ convo, isActive, onSelect, currentUserId }: ConversationItemProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [menu, setMenu]       = useState<{ x: number; y: number } | null>(null);

  const bg = isActive ? "var(--accent-dim)" :
             pressed  ? "var(--bg-active)"  :
             hovered  ? "var(--bg-hover)"   : "transparent";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        onClick={() => onSelect(convo.id)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          position: "relative",
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 10,
          background: bg, cursor: "pointer",
          transition: "background 0.12s",
          userSelect: "none",
        }}
      >
        {/* Active bar */}
        {isActive && (
          <div style={{
            position: "absolute", left: 0, top: "20%", height: "60%",
            width: 2.5, background: "var(--accent)", borderRadius: 2,
          }} />
        )}

        {/* Pin icon */}
        {convo.pinned && (
          <MapPin
            size={10}
            style={{ position: "absolute", top: 6, right: 8, color: "#F5A623" }}
          />
        )}

        <ConvoAvatar convo={convo} />

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Name + time */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 13.5, fontWeight: 500, color: "var(--text1)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: 145,
            }}>
              {convo.name}
            </span>
            <span style={{
              fontSize: 10, flexShrink: 0,
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              color: convo.unread > 0 ? "var(--accent)" : "var(--text3)",
            }}>
              {convo.time}
            </span>
          </div>

          {/* Preview row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
              {convo.isMine && !convo.typing && (
                <CheckCheck size={14} style={{ flexShrink: 0, color: "var(--accent)" }} />
              )}
              {convo.typing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <TypingDots />
                  <span style={{ fontSize: 11.5, color: "var(--accent)" }}>typing</span>
                </div>
              ) : (
                <span style={{
                  fontSize: 12,
                  color: convo.unread > 0 ? "var(--text1)" : "var(--text2)",
                  fontWeight: convo.unread > 0 ? 600 : 400,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {(() => {
                    const raw = convo.lastMessage ?? convo.preview;
                    if (!raw) return null;
                    const prefix = convo.lastMessageSenderId === currentUserId ? "You: " : "";
                    const text   = prefix + raw;
                    return text.length > 35 ? text.slice(0, 35) + "…" : text;
                  })()}
                </span>
              )}
            </div>

            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
              {convo.muted && <VolumeX size={11} style={{ color: "var(--text3)" }} />}
              {convo.unread > 0 && !convo.muted && (
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  fontFamily: "var(--font-jetbrains-mono, monospace)",
                  color: "#06080C",
                }}>
                  {convo.unread}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}
