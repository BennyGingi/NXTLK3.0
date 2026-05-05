"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/lib/types";

// ── Raw Supabase response types ──────────────────────────────────────────────
type ProfileRow = {
  id: string;
  name: string;
  initials: string;
  avatar_url: string | null;
  status: string;
};

type InnerMember = {
  user_id: string;
  profiles: ProfileRow | null;
};

type ConvRow = {
  id: string;
  name: string | null;
  is_group: boolean;
  updated_at: string;
  conversation_members: InnerMember[];
};

type LastMsgRow = {
  conversation_id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

// ── Avatar palette (deterministic from id) ───────────────────────────────────
const PALETTES = [
  { bg: "#1A2D4A", color: "#5BB8FF" },
  { bg: "#2A1A3A", color: "#C084FC" },
  { bg: "#1F2D1A", color: "#86EFAC" },
  { bg: "#2D1A1A", color: "#FCA5A5" },
  { bg: "#1A2A2D", color: "#67E8F9" },
  { bg: "#1A1A2D", color: "#818CF8" },
  { bg: "#2D1A2A", color: "#F0ABFC" },
];

function palette(id: string) {
  const n = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return PALETTES[n % PALETTES.length];
}

function formatConvoTime(iso: string): string {
  const d     = new Date(iso);
  const now   = new Date();
  const today = now.toDateString() === d.toDateString();
  if (today) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
}

function toConversation(conv: ConvRow, currentUserId: string): Conversation {
  // Filter on user_id first (always present) — don't rely on profiles.id surviving RLS
  const otherMembers = conv.conversation_members.filter(m => m.user_id !== currentUserId);
  const other        = otherMembers[0]?.profiles ?? null;
  const allOthers    = otherMembers
    .map(m => m.profiles)
    .filter((p): p is ProfileRow => p !== null);

  const name     = conv.is_group ? (conv.name ?? "Group Chat") : (other?.name     ?? "Unknown");
  const initials = conv.is_group ? (conv.name?.slice(0, 2).toUpperCase() ?? "GC") : (other?.initials ?? "?");
  const pal      = palette(other?.id ?? conv.id);
  const status   = (!conv.is_group && other?.status)
    ? (other.status as "online" | "away" | "offline")
    : undefined;

  const groupMembers = conv.is_group
    ? allOthers.slice(0, 2).map(m => ({
        initials:    m.initials,
        avatarBg:    palette(m.id).bg,
        avatarColor: palette(m.id).color,
      }))
    : undefined;

  return {
    id:          conv.id,
    name,
    initials,
    avatarUrl:   (!conv.is_group && other?.avatar_url) ? other.avatar_url : undefined,
    avatarBg:    pal.bg,
    avatarColor: pal.color,
    preview:     "",
    time:        formatConvoTime(conv.updated_at),
    unread:      0,
    online:      status,
    typing:      false,
    pinned:      false,
    muted:       false,
    isMine:      false,
    group:       conv.is_group,
    groupMembers,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useConversations(currentUserId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [trigger,       setTrigger]       = useState(0);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    let cancelled  = false;

    const fetch = async () => {
      setLoading(true);

      // Step 1: conversation IDs the current user belongs to
      const { data: memberRows } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", currentUserId);

      if (cancelled) return;

      if (!memberRows || memberRows.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convIds = memberRows.map(r => r.conversation_id);

      // Step 2: full conversations with members + profiles
      const { data: convos } = await supabase
        .from("conversations")
        .select(`
          id, name, is_group, updated_at,
          conversation_members (
            user_id,
            profiles (
              id, name, initials, avatar_url, status
            )
          )
        `)
        .in("id", convIds)
        .order("updated_at", { ascending: false });

      if (cancelled) return;

      const rows  = (convos ?? []) as unknown as ConvRow[];
      const items = rows.map(r => toConversation(r, currentUserId));

      // Step 3: batch-fetch unread counts + last messages in parallel
      const [{ data: unreadRows }, { data: lastMsgRows }] = await Promise.all([
        supabase
          .from("messages")
          .select("conversation_id")
          .in("conversation_id", convIds)
          .neq("sender_id", currentUserId)
          .is("read_at", null),
        supabase
          .from("messages")
          .select("conversation_id, content, sender_id, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false })
          .limit(Math.max(convIds.length * 5, 50)),
      ]);

      const unreadMap: Record<string, number> = {};
      ((unreadRows ?? []) as { conversation_id: string }[]).forEach(r => {
        unreadMap[r.conversation_id] = (unreadMap[r.conversation_id] ?? 0) + 1;
      });

      // First occurrence per conversation_id = latest message
      const lastMsgMap: Record<string, LastMsgRow> = {};
      for (const row of (lastMsgRows ?? []) as LastMsgRow[]) {
        if (!lastMsgMap[row.conversation_id]) {
          lastMsgMap[row.conversation_id] = row;
        }
      }

      const result = items.map(c => {
        const lm = lastMsgMap[c.id];
        return {
          ...c,
          unread:              unreadMap[c.id] ?? 0,
          isMine:              (lm?.sender_id ?? "") === currentUserId,
          lastMessage:         lm?.content,
          lastMessageSenderId: lm?.sender_id,
          lastMessageTime:     lm ? formatConvoTime(lm.created_at) : undefined,
          time:                lm ? formatConvoTime(lm.created_at) : c.time,
        };
      });

      if (cancelled) return;
      setConversations(result);
      setLoading(false);
    };

    fetch();

    // Realtime: re-fetch when current user's memberships change
    const membersChannel = supabase
      .channel(`convos:${currentUserId}:${trigger}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_members", filter: `user_id=eq.${currentUserId}` },
        () => { fetch(); }
      )
      .subscribe();

    // Realtime: re-fetch on profile status changes (online dots)
    const presenceChannel = supabase
      .channel("profiles-presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => { fetch(); }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUserId, trigger]);

  return { conversations, loading, refetch };
}
