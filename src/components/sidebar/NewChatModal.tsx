"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDefaultAvatar } from "@/lib/avatar";

interface NewChatModalProps {
  currentUserId: string;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

type Mode = "dm" | "group";

type ProfileResult = {
  id: string;
  name: string;
  initials: string;
  username: string;
  avatar_url: string | null;
  status: string;
};

// ── Sub-components ───────────────────────────────────────────────────────────
function ProfileAvatar({ profile, size = 32 }: { profile: ProfileResult; size?: number }) {
  const src = profile.avatar_url ?? getDefaultAvatar(profile.id, profile.username);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={profile.name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }}
    />
  );
}

function ResultRow({
  profile, selected, onToggle,
}: {
  profile: ProfileResult;
  selected: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 8,
        background: selected ? "var(--accent-dim)" : hovered ? "var(--bg-hover)" : "transparent",
        border: selected ? "1px solid rgba(0,212,168,0.25)" : "1px solid transparent",
        cursor: "pointer",
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <ProfileAvatar profile={profile} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "var(--text1)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>@{profile.username}</div>
      </div>
    </div>
  );
}

function Chip({ profile, onRemove }: { profile: ProfileResult; onRemove: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "3px 8px 3px 4px",
      background: "var(--accent-dim)",
      border: "1px solid rgba(0,212,168,0.3)",
      borderRadius: 20,
    }}>
      <ProfileAvatar profile={profile} size={18} />
      <span style={{ fontSize: 12, color: "var(--text1)" }}>{profile.name}</span>
      <button
        onClick={onRemove}
        style={{
          width: 14, height: 14, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text2)", fontSize: 10, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export default function NewChatModal({ currentUserId, onClose, onConversationCreated }: NewChatModalProps) {
  const [mode,          setMode]          = useState<Mode>("dm");
  const [query,         setQuery]         = useState("");
  const [results,       setResults]       = useState<ProfileResult[]>([]);
  const [selected,      setSelected]      = useState<ProfileResult[]>([]);
  const [groupName,     setGroupName]     = useState("");
  const [searching,     setSearching]     = useState(false);
  const [creating,      setCreating]      = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Debounced profile search
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, name, initials, username, avatar_url, status")
        .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
        .neq("id", currentUserId)
        .limit(10);
      setResults((data ?? []) as ProfileResult[]);
      setSearching(false);
    }, 300);
    return () => { clearTimeout(timer); setSearching(false); };
  }, [query, currentUserId]);

  // Reset selection when switching modes
  useEffect(() => { setSelected([]); setQuery(""); setResults([]); }, [mode]);

  const toggleUser = useCallback((profile: ProfileResult) => {
    if (mode === "dm") {
      // DM: single-select
      setSelected(prev => prev[0]?.id === profile.id ? [] : [profile]);
    } else {
      // Group: multi-select
      setSelected(prev =>
        prev.find(p => p.id === profile.id)
          ? prev.filter(p => p.id !== profile.id)
          : [...prev, profile]
      );
    }
  }, [mode]);

  const removeUser = useCallback((id: string) => {
    setSelected(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Find existing DM ────────────────────────────────────────────────────
  const findExistingDm = async (otherId: string): Promise<string | null> => {
    const supabase = createClient();
    const [{ data: mine }, { data: theirs }] = await Promise.all([
      supabase.from("conversation_members").select("conversation_id").eq("user_id", currentUserId),
      supabase.from("conversation_members").select("conversation_id").eq("user_id", otherId),
    ]);
    const mySet     = new Set((mine ?? []).map(m => m.conversation_id));
    const sharedIds = (theirs ?? []).filter(m => mySet.has(m.conversation_id)).map(m => m.conversation_id);
    if (!sharedIds.length) return null;
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .in("id", sharedIds)
      .eq("is_group", false)
      .limit(1);
    return convs?.[0]?.id ?? null;
  };

  // ── Create handlers ─────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (creating || !selected.length) return;
    if (mode === "group" && !groupName.trim()) return;

    setCreating(true);
    try {
      const supabase = createClient();

      if (mode === "dm") {
        const otherId    = selected[0].id;
        const existingId = await findExistingDm(otherId);
        if (existingId) { onConversationCreated(existingId); return; }

        const { data: conv, error } = await supabase
          .from("conversations")
          .insert({ is_group: false, created_by: currentUserId })
          .select("id")
          .single();
        if (error || !conv) throw error ?? new Error("Failed to create conversation");

        await supabase.from("conversation_members").insert([
          { conversation_id: conv.id, user_id: currentUserId },
          { conversation_id: conv.id, user_id: otherId },
        ]);
        onConversationCreated(conv.id);

      } else {
        const { data: conv, error } = await supabase
          .from("conversations")
          .insert({ is_group: true, created_by: currentUserId, name: groupName.trim() })
          .select("id")
          .single();
        if (error || !conv) throw error ?? new Error("Failed to create group");

        const members = [currentUserId, ...selected.map(u => u.id)].map(uid => ({
          conversation_id: conv.id,
          user_id:         uid,
        }));
        await supabase.from("conversation_members").insert(members);
        onConversationCreated(conv.id);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    } finally {
      setCreating(false);
    }
  };

  const canCreate = mode === "dm"
    ? selected.length > 0
    : selected.length > 0 && groupName.trim().length > 0;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, maxHeight: "80vh",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-hi)",
          borderRadius: 14, padding: 20,
          display: "flex", flexDirection: "column", gap: 14,
          animation: "scale-in 0.15s ease both",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text1)" }}>
            New Message
          </span>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["dm", "group"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 500,
                cursor: "pointer",
                background:   mode === m ? "var(--accent-dim)" : "transparent",
                border:       mode === m ? "1px solid var(--accent)" : "1px solid var(--border)",
                color:        mode === m ? "var(--accent)" : "var(--text3)",
                transition:   "background 0.12s, border-color 0.12s, color 0.12s",
              }}
            >
              {m === "dm" ? "Direct Message" : "Group Chat"}
            </button>
          ))}
        </div>

        {/* Selected chips (group mode) */}
        {mode === "group" && selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selected.map(p => (
              <Chip key={p.id} profile={p} onRemove={() => removeUser(p.id)} />
            ))}
          </div>
        )}

        {/* Search input */}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or username..."
          autoFocus
          className="chat-textarea"
          style={{
            width: "100%", boxSizing: "border-box",
            background: "var(--bg-active)",
            border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 12px",
            color: "var(--text1)", fontSize: 13,
            outline: "none",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        />

        {/* Results list */}
        {(results.length > 0 || searching) && (
          <div style={{ overflowY: "auto", maxHeight: 260, display: "flex", flexDirection: "column", gap: 2 }}>
            {searching && !results.length ? (
              <div style={{ padding: "12px 10px", fontSize: 12, color: "var(--text3)" }}>Searching…</div>
            ) : (
              results.map(p => (
                <ResultRow
                  key={p.id}
                  profile={p}
                  selected={selected.some(s => s.id === p.id)}
                  onToggle={() => toggleUser(p)}
                />
              ))
            )}
          </div>
        )}

        {query && !searching && results.length === 0 && (
          <div style={{ padding: "12px 10px", fontSize: 12, color: "var(--text3)" }}>
            No users found for "{query}"
          </div>
        )}

        {/* Group name input */}
        {mode === "group" && (
          <input
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="Group name (required)"
            className="chat-textarea"
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--bg-active)",
              border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 12px",
              color: "var(--text1)", fontSize: 13,
              outline: "none",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}
          />
        )}

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={!canCreate || creating}
          style={{
            width: "100%", padding: "10px 0",
            background: canCreate && !creating ? "var(--accent)" : "var(--bg-active)",
            border: "none", borderRadius: 8,
            fontSize: 13.5, fontWeight: 600,
            color: canCreate && !creating ? "#06080C" : "var(--text3)",
            cursor: canCreate && !creating ? "pointer" : "not-allowed",
            transition: "background 0.15s, color 0.15s",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          {creating
            ? "Creating…"
            : mode === "dm"
              ? "Start Direct Message"
              : "Create Group"}
        </button>
      </div>
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28, height: 28, borderRadius: 7,
        background: hovered ? "var(--bg-hover)" : "transparent",
        border: "1px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--text3)",
        transition: "background 0.12s",
      }}
    >
      <X size={15} />
    </button>
  );
}
