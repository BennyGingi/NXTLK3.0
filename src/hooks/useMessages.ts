"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageItem } from "@/components/chat/MessageList";

type RawReplyMessage = {
  content: string;
  profiles?: { name: string } | { name: string }[] | null;
};

type RawMessage = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  reply_to_id: string | null;
  // Supabase returns joined rows as arrays even for to-one FK relationships
  messages?: RawReplyMessage | RawReplyMessage[] | null;
};

type RawReaction = {
  message_id: string;
  user_id: string;
  emoji: string;
};

function toItem(m: RawMessage): MessageItem {
  const replyRaw   = Array.isArray(m.messages) ? m.messages[0] : m.messages;
  const profileRaw = replyRaw?.profiles;
  const profileName = Array.isArray(profileRaw) ? profileRaw[0]?.name : profileRaw?.name;

  if (m.reply_to_id) {
    console.log('[useMessages] reply raw data:', JSON.stringify(m.messages), '→ content:', replyRaw?.content, 'name:', profileName);
  }

  return {
    id:                m.id,
    content:           m.content,
    senderId:          m.sender_id,
    createdAt:         m.created_at,
    readAt:            m.read_at,
    editedAt:          m.edited_at  ?? undefined,
    deletedAt:         m.deleted_at ?? undefined,
    reactions:         [],
    replyToId:         m.reply_to_id ?? undefined,
    replyToContent:    replyRaw?.content ?? undefined,
    replyToSenderName: profileName ?? undefined,
  };
}

export function useMessages(conversationId: string | null, currentUserId: string) {
  const [messages,  setMessages]  = useState<MessageItem[]>([]);
  const [reactions, setReactions] = useState<RawReaction[]>([]);
  const [loading,   setLoading]   = useState(false);
  const messageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) { setMessages([]); setReactions([]); return; }

    const supabase = createClient();
    let cancelled  = false;

    setLoading(true);
    setMessages([]);
    setReactions([]);
    messageIdsRef.current = new Set();

    const markAsRead = () =>
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .is("read_at", null)
        .then(() => {
          window.dispatchEvent(new CustomEvent("messages-read", { detail: { conversationId } }));
        });

    supabase
      .from("messages")
      .select("id, content, sender_id, created_at, read_at, edited_at, deleted_at, reply_to_id, messages!reply_to_id(content, profiles(name))")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        const items = (data ?? []).map(m => toItem(m as unknown as RawMessage));
        setMessages(items);
        setLoading(false);
        messageIdsRef.current = new Set(items.map(i => i.id));
        markAsRead();

        if (items.length > 0) {
          supabase
            .from("message_reactions")
            .select("message_id, user_id, emoji")
            .in("message_id", items.map(i => i.id))
            .then(({ data: rxData }) => {
              if (cancelled) return;
              setReactions((rxData ?? []) as RawReaction[]);
            });
        }
      });

    const insertChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          if (cancelled) return;
          const msg = payload.new as RawMessage;
          messageIdsRef.current.add(msg.id);
          setMessages(prev => [...prev, toItem(msg)]);
          if (msg.sender_id !== currentUserId) markAsRead();
        }
      )
      .subscribe();

    const updateChannel = supabase
      .channel(`messages-updates:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          if (cancelled) return;
          const updated = payload.new as RawMessage;
          setMessages(prev =>
            prev.map(m => m.id === updated.id
              ? {
                  ...m,
                  content:   updated.content,
                  readAt:    updated.read_at,
                  editedAt:  updated.edited_at  ?? undefined,
                  deletedAt: updated.deleted_at ?? undefined,
                }
              : m
            )
          );
        }
      )
      .subscribe();

    const rxInsertChannel = supabase
      .channel(`reactions-insert:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reactions" },
        (payload) => {
          if (cancelled) return;
          const rx = payload.new as RawReaction;
          if (messageIdsRef.current.has(rx.message_id)) {
            setReactions(prev => [...prev, rx]);
          }
        }
      )
      .subscribe();

    const rxDeleteChannel = supabase
      .channel(`reactions-delete:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "message_reactions" },
        (payload) => {
          if (cancelled) return;
          const old = payload.old as RawReaction;
          setReactions(prev =>
            prev.filter(r => !(r.message_id === old.message_id && r.user_id === old.user_id && r.emoji === old.emoji))
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
      supabase.removeChannel(rxInsertChannel);
      supabase.removeChannel(rxDeleteChannel);
    };
  }, [conversationId, currentUserId]);

  const messagesWithReactions = useMemo(() => {
    return messages.map(m => {
      const msgRxs = reactions.filter(r => r.message_id === m.id);
      const emojiMap: Record<string, { count: number; userReacted: boolean }> = {};
      for (const rx of msgRxs) {
        if (!emojiMap[rx.emoji]) emojiMap[rx.emoji] = { count: 0, userReacted: false };
        emojiMap[rx.emoji].count++;
        if (rx.user_id === currentUserId) emojiMap[rx.emoji].userReacted = true;
      }
      return {
        ...m,
        reactions: Object.entries(emojiMap).map(([emoji, { count, userReacted }]) => ({ emoji, count, userReacted })),
      };
    });
  }, [messages, reactions, currentUserId]);

  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!conversationId || !content.trim()) return;
    const supabase = createClient();
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id:       currentUserId,
      content:         content.trim(),
      reply_to_id:     replyToId ?? null,
    });
  }, [conversationId, currentUserId]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const supabase = createClient();
    const existing = reactions.find(r => r.message_id === messageId && r.user_id === currentUserId && r.emoji === emoji);
    if (existing) {
      await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", currentUserId)
        .eq("emoji", emoji);
    } else {
      await supabase
        .from("message_reactions")
        .insert({ message_id: messageId, user_id: currentUserId, emoji });
    }
  }, [reactions, currentUserId]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ content: newContent.trim(), edited_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", currentUserId);
  }, [currentUserId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId)
      .eq("sender_id", currentUserId);
  }, [currentUserId]);

  return { messages: messagesWithReactions, loading, sendMessage, toggleReaction, editMessage, deleteMessage };
}