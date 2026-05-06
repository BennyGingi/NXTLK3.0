"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import SidebarHeader    from "@/components/sidebar/SidebarHeader";
import SearchBar        from "@/components/sidebar/SearchBar";
import ConversationList from "@/components/sidebar/ConversationList";
import SidebarFooter    from "@/components/sidebar/SidebarFooter";
import NewChatModal     from "@/components/sidebar/NewChatModal";
import ChatHeader        from "@/components/chat/ChatHeader";
import MessageList       from "@/components/chat/MessageList";
import ChatInputBar, { type ChatInputBarHandle } from "@/components/chat/ChatInputBar";
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
  const [isMobile,    setIsMobile]    = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const inputBarRef = useRef<ChatInputBarHandle>(null);

  usePresence(user.id);
  const { conversations, loading: convosLoading, refetch } = useConversations(user.id);
  const { messages, sendMessage, toggleReaction, editMessage, deleteMessage } = useMessages(activeId, user.id);
  const { typingNames, sendTyping } = useTyping({
    conversationId:  activeId,
    currentUserId:   user.id,
    currentUserName: user.name,
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
    document.title = totalUnread > 0 ? `(${totalUnread}) nxtlk` : "nxtlk";
  }, [conversations]);

  useEffect(() => {
    if (!activeId) return;
    const t = setTimeout(() => inputBarRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [activeId]);

  const filtered = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.preview.toLowerCase().includes(q)
    );
  }, [query, conversations]);

  const activeConvo = conversations.find(c => c.id === activeId) ?? null;

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (isMobile) setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
    setActiveId(null);
  };

  const handleConversationCreated = (id: string) => {
    refetch();
    setActiveId(id);
    setShowNewChat(false);
    if (isMobile) setShowSidebar(false);
  };

  const renderSidebar = !isMobile || showSidebar;
  const renderChat    = !isMobile || !showSidebar;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {renderSidebar && (
        <div style={{
          width: isMobile ? "100%" : 280,
          flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "var(--bg-surface)",
          borderRight: isMobile ? "none" : "1px solid var(--border)",
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
            onSelect={handleSelect}
            currentUserId={user.id}
            loading={convosLoading}
            emptyQuery={query.length > 0 && filtered.length === 0}
          />
          <SidebarFooter
            user={user}
            onSettings={() => {}}
          />
        </div>
      )}

      {renderChat && (
        <div style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column",
          background: "var(--bg-base)",
          overflow: "hidden",
          width: isMobile ? "100%" : undefined,
        }}>
          {activeConvo ? (
            <>
              <ChatHeader
                name={activeConvo.name}
                initials={activeConvo.initials}
                status={activeConvo.online ?? "offline"}
                userId={activeConvo.id}
                avatarUrl={activeConvo.avatarUrl}
                onBack={isMobile ? handleBack : undefined}
              />
              <MessageList
                messages={messages}
                currentUserId={user.id}
                onReact={toggleReaction}
                onEdit={editMessage}
                onDelete={deleteMessage}
              />
              <TypingIndicator names={typingNames} />
              <ChatInputBar ref={inputBarRef} onSend={sendMessage} onTyping={sendTyping} />
            </>
          ) : (
            <div style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                padding: "40px 32px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                maxWidth: 320, width: "90%",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: 28, fontWeight: 700,
                  fontFamily: "var(--font-bricolage-grotesque, sans-serif)",
                  color: "var(--accent)",
                  letterSpacing: "-0.5px",
                }}>
                  nxtlk
                </div>
                <div>
                  <div style={{
                    fontSize: 16, fontWeight: 600,
                    color: "var(--text1)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                    marginBottom: 6,
                  }}>
                    Welcome to nxtlk
                  </div>
                  <div style={{
                    fontSize: 13, color: "var(--text2)",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                    lineHeight: 1.5,
                  }}>
                    Select a conversation or start a new one
                  </div>
                </div>
                <button
                  onClick={() => setShowNewChat(true)}
                  style={{
                    padding: "8px 20px",
                    background: "var(--accent)",
                    border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                    color: "#06080C",
                    cursor: "pointer",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                    transition: "filter 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
                >
                  New conversation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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