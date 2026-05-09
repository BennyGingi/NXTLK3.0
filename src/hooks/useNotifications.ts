"use client";

import { useEffect, useCallback } from "react";

export function useNotifications(
  currentUserId: string,
  activeConversationId: string | null
) {
  useEffect(() => {
    // Request permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback(
    (senderName: string, content: string, conversationId: string) => {
      // Don't show if:
      // - permission not granted
      // - tab is visible AND this conversation is active
      if (Notification.permission !== "granted") return;
      if (!document.hidden && activeConversationId === conversationId) return;

      const notification = new Notification(senderName, {
        body: content.length > 60 ? content.slice(0, 60) + "..." : content,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: conversationId, // replaces previous notification from same convo
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 4 seconds
      setTimeout(() => notification.close(), 4000);
    },
    [activeConversationId]
  );

  return { showNotification };
}
