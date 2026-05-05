"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import MessageBubble from "./MessageBubble";

export interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  readAt?: string | null;
}

interface MessageListProps {
  messages: MessageItem[];
  currentUserId: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDayLabel(dateKey: string): string {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateKey === today)     return "Today";
  if (dateKey === yesterday) return "Yesterday";
  return new Date(dateKey + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function DayDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "12px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{
        padding: "0 10px", fontSize: 11,
        color: "var(--text3)",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);
  const [showBtn, setShowBtn] = useState(false);

  const distFromBottom = () => {
    const el = containerRef.current;
    if (!el) return 0;
    return el.scrollHeight - el.scrollTop - el.clientHeight;
  };

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  };

  const handleScroll = () => {
    setShowBtn(distFromBottom() > 200);
  };

  useEffect(() => {
    if (distFromBottom() < 300) {
      scrollToBottom();
    } else {
      setShowBtn(true);
    }
  }, [messages]);

  // Group consecutive messages by calendar date
  const groups: Array<{ dateKey: string; items: MessageItem[] }> = [];
  for (const msg of messages) {
    const key  = getDateKey(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === key) {
      last.items.push(msg);
    } else {
      groups.push({ dateKey: key, items: [msg] });
    }
  }

  return (
    <div style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden" }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          position: "absolute", inset: 0,
          overflowY: "auto", padding: 16,
          display: "flex", flexDirection: "column", gap: 2,
        }}
      >
        {groups.map(({ dateKey, items }) => (
          <div key={dateKey}>
            <DayDivider label={formatDayLabel(dateKey)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {items.map(msg => (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  timestamp={formatTime(msg.createdAt)}
                  isOwn={msg.senderId === currentUserId}
                  readAt={msg.readAt}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showBtn && (
        <button
          onClick={() => { scrollToBottom(); setShowBtn(false); }}
          style={{
            position: "absolute", bottom: 16, right: 16,
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--accent)",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            animation: "scale-in 0.15s ease both",
          }}
        >
          <ChevronDown size={18} style={{ color: "#06080C" }} />
        </button>
      )}
    </div>
  );
}
