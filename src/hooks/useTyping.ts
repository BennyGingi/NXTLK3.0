"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PresencePayload = {
  user_id?: string;
  name?: string;
  typing?: boolean;
};

interface UseTypingProps {
  conversationId: string | null;
  currentUserId: string;
  currentUserName: string;
}

export function useTyping({ conversationId, currentUserId, currentUserName }: UseTypingProps) {
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const channelRef  = useRef<RealtimeChannel | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) { setTypingNames([]); return; }

    const supabase = createClient();
    const channel  = supabase.channel(`typing:${conversationId}`);
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresencePayload>();
        const names = Object.values(state)
          .flat()
          .filter(p => p.user_id !== currentUserId && p.typing === true)
          .map(p => p.name ?? "Someone");
        setTypingNames(names);
      })
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
      setTypingNames([]);
    };
  }, [conversationId, currentUserId]);

  const sendTyping = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;

    channel.track({ user_id: currentUserId, name: currentUserName, typing: true });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      channel.track({ user_id: currentUserId, name: currentUserName, typing: false });
    }, 2000);
  }, [currentUserId, currentUserName]);

  return { typingNames, sendTyping };
}
