"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";

interface SidebarHeaderProps {
  appName?: string;
  tagline?: string;
  showTagline?: boolean;
  showNotifDot?: boolean;
  onNewChat?: () => void;
}

export default function SidebarHeader({
  appName = "nxtlk",
  tagline = "fast talk",
  showTagline = true,
  showNotifDot = false,
  onNewChat,
}: SidebarHeaderProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [flashing, setFlashing]             = useState(false);
  const [btnHovered, setBtnHovered]         = useState(false);

  const handleClick = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 300);
    onNewChat?.();
  };

  return (
    <div style={{
      height: 56, padding: "0 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
    }}>

      {/* Logo group */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <LogoMark />
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{
            fontSize: 16, fontWeight: 700, lineHeight: 1,
            color: "var(--text1)",
            fontFamily: "var(--font-bricolage, sans-serif)",
          }}>
            {appName}
          </span>
          {showTagline && (
            <span style={{ fontSize: 10, color: "var(--text3)", lineHeight: 1 }}>{tagline}</span>
          )}
        </div>
      </div>

      {/* Compose button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={handleClick}
          onMouseEnter={() => { setBtnHovered(true); setTooltipVisible(true); }}
          onMouseLeave={() => { setBtnHovered(false); setTooltipVisible(false); }}
          onMouseDown={e =>  { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)"; }}
          onMouseUp={e =>    { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          style={{
            position: "relative",
            width: 32, height: 32,
            background: flashing ? "rgba(0,212,168,0.15)" : btnHovered ? "var(--bg-active)" : "transparent",
            border: `1px solid ${btnHovered ? "var(--border-hi)" : "var(--border)"}`,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: btnHovered ? "var(--text1)" : "var(--text2)",
            transition: "background 0.12s, border-color 0.12s, color 0.12s",
            animation: flashing ? "btn-flash 0.3s ease forwards" : "none",
          }}
        >
          <SquarePen size={16} />

          {showNotifDot && (
            <div style={{
              position: "absolute", top: -3, right: -3,
              width: 9, height: 9, borderRadius: "50%",
              background: "var(--accent)",
              border: "1.5px solid var(--bg-surface)",
            }} />
          )}
        </button>

        {/* Tooltip */}
        {tooltipVisible && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "var(--bg-active)",
            border: "1px solid var(--border-hi)",
            borderRadius: 6, padding: "5px 10px",
            fontSize: 11.5, color: "var(--text1)",
            whiteSpace: "nowrap",
            zIndex: 100,
            animation: "slide-down 0.15s ease forwards",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}>
            {/* Arrow */}
            <div style={{
              position: "absolute", top: -5, right: 10,
              width: 8, height: 8,
              background: "var(--bg-active)",
              border: "1px solid var(--border-hi)",
              borderBottom: "none", borderRight: "none",
              transform: "rotate(45deg)",
            }} />
            New chat{" "}
            <span style={{ color: "var(--text3)", fontSize: 10, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>⌘N</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LogoMark() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: "var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-bricolage, sans-serif)",
        fontSize: 10, fontWeight: 700, color: "#06080C",
        animation: "pulse-ring 3s ease-out infinite",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        boxShadow: hovered ? "0 0 12px rgba(0,212,168,0.4)" : "none",
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "pointer",
      }}
    >
      nxt
    </div>
  );
}
