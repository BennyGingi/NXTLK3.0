"use client";

import { useState, useMemo } from "react";
import SidebarHeader    from "@/components/sidebar/SidebarHeader";
import SearchBar        from "@/components/sidebar/SearchBar";
import ConversationList from "@/components/sidebar/ConversationList";
import SidebarFooter    from "@/components/sidebar/SidebarFooter";
import NewChatModal     from "@/components/sidebar/NewChatModal";
import ChatHeader        from "@/components/chat/ChatHeader";
import MessageList       from "@/components/chat/MessageList";
import ChatInputBar      from "@/components/chat/ChatInputBar";
import TypingIndicator   from "@/components/chat/TypingIndicator";
import { useConversations } from "@/hooks/useConversations";
import { useMessages }      from "@/hooks/useMessages";
import { usePresence }      from "@/hooks/usePresence";
import { useTyping }        from "@/hooks/useTyping";

interface ChatClientProps {
  user: {
    id:        string;
    name:      string;
    email:     string;
    initials:  string;
    avatarUrl?: string;
    status:    "online" | "away" | "offline";
  };
}

export default function ChatClient({ user }: ChatClientProps) {
  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [query,       setQuery]       = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  usePresence(user.id);
  const { conversations, loading: convosLoading, refetch } = useConversations(user.id);
  const { messages, sendMessage } = useMessages(activeId, user.id);
  const { typingNames, sendTyping } = useTyping({
    conversationId:  activeId,
    currentUserId:   user.id,
    currentUserName: user.name,
  });

  const filtered = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.preview.toLowerCase().includes(q)
    );
  }, [query, conversations]);

  const activeConvo = conversations.find(c => c.id === activeId) ?? null;

  const handleConversationCreated = (id: string) => {
    refetch();
    setActiveId(id);
    setShowNewChat(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{
        width: 280, flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}>
        <SidebarHeader
          showTagline
          showNotifDot={false}
          onNewChat={() => setShowNewChat(true)}
        />
        <SearchBar onSearch={setQuery} />
        <ConversationList
          convos={filtered}
          activeId={activeId}
          onSelect={setActiveId}
          currentUserId={user.id}
          loading={convosLoading}
          emptyQuery={query.length > 0 && filtered.length === 0}
        />
        <SidebarFooter
          user={user}
          onSettings={() => {}}
        />
      </div>

      {/* Main chat area */}
      <div style={{
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        background: "var(--bg-base)",
        overflow: "hidden",
      }}>
        {activeConvo ? (
          <>
            <ChatHeader
              name={activeConvo.name}
              initials={activeConvo.initials}
              status={activeConvo.online ?? "offline"}
              userId={activeConvo.id}
              avatarUrl={activeConvo.avatarUrl}
            />
            <MessageList
              messages={messages}
              currentUserId={user.id}
            />
            <TypingIndicator names={typingNames} />
            <ChatInputBar onSend={sendMessage} onTyping={sendTyping} />
          </>
        ) : (
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 14, color: "var(--text3)",
              fontFamily: "var(--font-dm-sans, sans-serif)",
            }}>
              ← Select a conversation
            </span>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <NewChatModal
          currentUserId={user.id}
          onClose={() => setShowNewChat(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
