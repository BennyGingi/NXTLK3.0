"use client";

import { MessageCircle, Pin } from "lucide-react";
import type { ReactNode } from "react";
import type { Conversation } from "@/lib/types";
import ConversationItem from "./ConversationItem";

interface ConversationListProps {
  convos: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  currentUserId: string;
  loading?: boolean;
  emptyQuery?: boolean;
}

function SkeletonItem() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 10px",
      animation: "shimmer 1.5s ease-in-out infinite",
    }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-active)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 11, width: "55%", borderRadius: 4, background: "var(--bg-active)" }} />
        <div style={{ height: 10, width: "80%", borderRadius: 4, background: "var(--bg-hover)" }} />
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 10px 4px" }}>
      {icon}
      <span style={{
        fontSize: 10, fontWeight: 600,
        letterSpacing: "0.08em",
        color: "var(--text3)",
        textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

export default function ConversationList({
  convos, activeId, onSelect, currentUserId, loading, emptyQuery,
}: ConversationListProps) {

  if (loading) {
    return (
      <div className="message-list-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 6px" }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)}
      </div>
    );
  }

  if (emptyQuery || convos.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <MessageCircle size={28} color="var(--text3)" />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", margin: "0 0 4px" }}>
            No conversations found
          </p>
          <p style={{ fontSize: 11.5, color: "var(--text3)", margin: 0 }}>
            Try a different search or filter
          </p>
        </div>
      </div>
    );
  }

  const pinned = convos.filter(c => c.pinned);
  const recent = convos.filter(c => !c.pinned);

  return (
    <div className="message-list-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 6px" }}>

      {pinned.length > 0 && (
        <>
          <SectionLabel icon={<Pin size={9} color="var(--text3)" />} label="Pinned" />
          {pinned.map(c => (
            <ConversationItem key={c.id} convo={c} isActive={activeId === c.id} onSelect={onSelect} currentUserId={currentUserId} />
          ))}
        </>
      )}

      {recent.length > 0 && (
        <>
          {pinned.length > 0 && (
            <SectionLabel icon={null} label="Recent" />
          )}
          {recent.map(c => (
            <ConversationItem key={c.id} convo={c} isActive={activeId === c.id} onSelect={onSelect} currentUserId={currentUserId} />
          ))}
        </>
      )}
    </div>
  );
}
