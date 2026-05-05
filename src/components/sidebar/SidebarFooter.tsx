"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Trash2 } from "lucide-react";
import type { OnlineStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getDefaultAvatar } from "@/lib/avatar";

interface SidebarFooterProps {
  user: {
    id: string;
    name: string;
    email: string;
    initials: string;
    avatarUrl?: string;
    status: OnlineStatus;
  };
  onSettings?: () => void;
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

function MenuRow({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px", borderRadius: 7,
        background: hovered ? "var(--bg-hover)" : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
        color: danger && hovered ? "var(--accent)" : "var(--text1)",
        fontSize: 13,
        transition: "background 0.12s, color 0.12s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function SidebarFooter({ user, onSettings }: SidebarFooterProps) {
  const [open, setOpen]           = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const router        = useRouter();
  const containerRef  = useRef<HTMLDivElement>(null);
  const dotColor      = STATUS_COLOR[user.status];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    const supabase = createClient();
    await supabase.from("profiles").update({ status: "offline" }).eq("id", user.id);
    await supabase.auth.signOut();
    localStorage.removeItem("nxtlk_login_time");
    localStorage.removeItem("nxtlk_remember");
    router.push("/login");
  };

  const handleForgetDevice = async () => {
    setOpen(false);
    const supabase = createClient();
    await supabase.from("profiles").update({ status: "offline" }).eq("id", user.id);
    localStorage.removeItem("nxtlk_remember");
    localStorage.removeItem("nxtlk_login_time");
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
  };

  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", bottom: 64, left: 8, minWidth: 220,
          background: "var(--bg-surface)", border: "1px solid var(--border-hi)",
          borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 50,
          padding: 6,
          animation: "scale-in 0.15s ease both",
        }}>

          {/* User header */}
          <div style={{ padding: "8px 12px", marginBottom: 2 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "var(--text1)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user.name}
            </div>
            <div style={{
              fontSize: 11, color: "var(--text2)", marginTop: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user.email}
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          <MenuRow
            icon={<Settings size={14} />}
            label="Settings"
            onClick={() => { setOpen(false); router.push("/settings"); onSettings?.(); }}
          />
          <MenuRow
            icon={<Trash2 size={14} />}
            label="Forget this device"
            onClick={handleForgetDevice}
            danger
          />

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          <MenuRow
            icon={<LogOut size={14} />}
            label="Log out"
            onClick={handleSignOut}
            danger
          />
        </div>
      )}

      {/* Footer bar */}
      <div style={{
        height: 56, padding: "0 12px",
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        marginTop: "auto",
      }}>

        {/* Avatar */}
        <div
          onClick={() => setOpen(o => !o)}
          style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatarUrl ?? getDefaultAvatar(user.id, user.name)}
            alt={user.name}
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 8, height: 8, borderRadius: "50%",
            background: dotColor, border: "1.5px solid var(--bg-surface)",
          }} />
        </div>

        {/* User info */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{
            fontSize: 13, fontWeight: 500, color: "var(--text1)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {user.name}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: dotColor, flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: dotColor }}>
              {STATUS_LABEL[user.status]}
            </span>
          </div>
        </div>

        {/* Settings icon — toggles dropdown */}
        <button
          onClick={() => setOpen(o => !o)}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: open || btnHovered ? "var(--bg-hover)" : "transparent",
            border: open || btnHovered ? "1px solid var(--border-hi)" : "1px solid transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            color: open || btnHovered ? "var(--text2)" : "var(--text3)",
            transition: "background 0.15s, border-color 0.15s, color 0.15s",
          }}
        >
          <Settings
            size={14}
            style={{
              transition: "transform 0.3s ease",
              transform: open ? "rotate(45deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
