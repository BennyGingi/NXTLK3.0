"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageItem } from "@/components/chat/MessageList";

type RawMessage = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
};

function toItem(m: RawMessage): MessageItem {
  return {
    id:        m.id,
    content:   m.content,
    senderId:  m.sender_id,
    createdAt: m.created_at,
    readAt:    m.read_at,
  };
}

export function useMessages(conversationId: string | null, currentUserId: string) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }

    const supabase = createClient();
    let cancelled  = false;

    setLoading(true);
    setMessages([]);

    const markAsRead = () =>
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .is("read_at", null);

    // Initial fetch then mark unread messages from others as read
    supabase
      .from("messages")
      .select("id, content, sender_id, created_at, read_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setMessages((data ?? []).map(m => toItem(m as RawMessage)));
        setLoading(false);
        markAsRead();
      });

    // Realtime: new messages
    const insertChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (cancelled) return;
          setMessages(prev => [...prev, toItem(payload.new as RawMessage)]);
          if ((payload.new as RawMessage).sender_id !== currentUserId) {
            markAsRead();
          }
        }
      )
      .subscribe();

    // Realtime: read_at updates (so CheckCheck ticks update live)
    const updateChannel = supabase
      .channel(`messages-updates:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (cancelled) return;
          const updated = payload.new as RawMessage;
          setMessages(prev =>
            prev.map(m => m.id === updated.id ? { ...m, readAt: updated.read_at } : m)
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [conversationId, currentUserId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;
    const supabase = createClient();
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id:       currentUserId,
      content:         content.trim(),
    });
  }, [conversationId, currentUserId]);

  return { messages, loading, sendMessage };
}
