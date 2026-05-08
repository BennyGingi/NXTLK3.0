"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { ChevronDown } from "lucide-react";
import MessageBubble from "./MessageBubble";

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  readAt?: string | null;
  editedAt?: string;
  deletedAt?: string;
  reactions?: Reaction[];
  replyToId?: string | null;
  replyToContent?: string | null;
  replyToSenderName?: string | null;
}

export interface MessageListHandle {
  scrollToMessage: (id: string) => void;
}

interface MessageListProps {
  messages: MessageItem[];
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onQuoteClick?: (replyToId: string) => void;
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

const MessageList = forwardRef<MessageListHandle, MessageListProps>(
function MessageList({ messages, currentUserId, onReact, onEdit, onDelete, onReply, onQuoteClick }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const messageRefs  = useRef<Map<string, HTMLDivElement>>(new Map());
  const [showBtn, setShowBtn] = useState(false);

  useImperativeHandle(ref, () => ({
    scrollToMessage(id: string) {
      const el = messageRefs.current.get(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.classList.remove('message-highlight');
      void el.offsetWidth;
      el.classList.add('message-highlight');
      setTimeout(() => el.classList.remove('message-highlight'), 2000);
    },
  }));

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
        className="message-list-scroll"
        style={{
          position: "absolute", inset: 0,
          overflowY: "auto", overflowX: "hidden", padding: 16,
          display: "flex", flexDirection: "column", gap: 2,
        }}
      >
        {groups.map(({ dateKey, items }) => (
          <div key={dateKey}>
            <DayDivider label={formatDayLabel(dateKey)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {items.map(msg => (
                <div key={msg.id}>
                  <MessageBubble
                    id={msg.id}
                    content={msg.content}
                    timestamp={formatTime(msg.createdAt)}
                    isOwn={msg.senderId === currentUserId}
                    readAt={msg.readAt}
                    editedAt={msg.editedAt}
                    deletedAt={msg.deletedAt}
                    reactions={msg.reactions}
                    replyToId={msg.replyToId}
                    replyToContent={msg.replyToContent}
                    replyToSenderName={msg.replyToSenderName}
                    onReact={onReact}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReply={onReply}
                    onQuoteClick={onQuoteClick}
                    bubbleRef={el => { if (el) messageRefs.current.set(msg.id, el); else messageRefs.current.delete(msg.id); }}
                  />
                </div>
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
});

export default MessageList;