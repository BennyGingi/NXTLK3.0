"use client";

import { useState } from "react";
import { Phone, Video, Info } from "lucide-react";
import type { OnlineStatus } from "@/lib/types";
import { getDefaultAvatar } from "@/lib/avatar";

interface ChatHeaderProps {
  name: string;
  initials: string;
  status: OnlineStatus;
  userId: string;
  avatarUrl?: string;
}

const STATUS_COLOR: Record<OnlineStatus, string> = {
  online:  "var(--accent)",
  away:    "#F5C542",
  offline: "var(--text3)",
};

const STATUS_LABEL: Record<OnlineStatus, string> = {
  online:  "Online",
  away:    "Away",
  offline: "Offline",
};

function IconBtn({ icon }: { icon: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32, borderRadius: 7,
        background: hovered ? "var(--bg-hover)" : "transparent",
        border: hovered ? "1px solid var(--border-hi)" : "1px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: hovered ? "var(--text2)" : "var(--text3)",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

export default function ChatHeader({ name, initials, status, userId, avatarUrl }: ChatHeaderProps) {
  const dotColor = STATUS_COLOR[status];

  return (
    <div style={{
      height: 56, padding: "0 16px", flexShrink: 0,
      display: "flex", alignItems: "center", gap: 12,
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Left: avatar + info */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl ?? getDefaultAvatar(userId, name)}
            alt={name}
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 9, height: 9, borderRadius: "50%",
            background: dotColor, border: "1.5px solid var(--bg-surface)",
          }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: "var(--text1)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>
            {STATUS_LABEL[status]}
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <IconBtn icon={<Phone size={15} />} />
        <IconBtn icon={<Video size={15} />} />
        <IconBtn icon={<Info size={15} />} />
      </div>
    </div>
  );
}
