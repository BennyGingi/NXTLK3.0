"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { Paperclip, Smile, SendHorizontal, X } from "lucide-react";
import data from "@emoji-mart/data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EmojiPicker = dynamic<any>(() => import("@emoji-mart/react"), { ssr: false });

interface ChatInputBarProps {
  onSend: (content: string, replyToId?: string) => void;
  onTyping?: () => void;
  replyTo?: { id: string; content: string; senderName: string } | null;
  onCancelReply?: () => void;
}

export interface ChatInputBarHandle {
  focus: () => void;
}

function IconBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32, borderRadius: 7, flexShrink: 0,
        background: hovered ? "var(--bg-hover)" : "transparent",
        border: hovered ? "1px solid var(--border-hi)" : "1px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: hovered ? "var(--text2)" : "var(--text3)",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

const ChatInputBar = forwardRef<ChatInputBarHandle, ChatInputBarProps>(
  function ChatInputBar({ onSend, onTyping, replyTo, onCancelReply }, ref) {
    const [value,      setValue]     = useState("");
    const [focused,    setFocused]   = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const textareaRef       = useRef<HTMLTextAreaElement>(null);
    const pickerContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }));

    useEffect(() => {
      if (!showPicker) return;
      const handler = (e: MouseEvent) => {
        if (pickerContainerRef.current && !pickerContainerRef.current.contains(e.target as Node)) {
          setShowPicker(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [showPicker]);

    const insertEmoji = (emoji: { native: string }) => {
      const el = textareaRef.current;
      if (!el) { setValue(v => v + emoji.native); return; }
      const start  = el.selectionStart ?? value.length;
      const end    = el.selectionEnd   ?? value.length;
      const newVal = value.slice(0, start) + emoji.native + value.slice(end);
      setValue(newVal);
      setTimeout(() => {
        el.focus();
        const pos = start + emoji.native.length;
        el.setSelectionRange(pos, pos);
      }, 0);
    };

    const submit = () => {
      const trimmed = value.trim();
      if (!trimmed) return;
      onSend(trimmed, replyTo?.id);
      setValue("");
      if (textareaRef.current) textareaRef.current.style.height = "36px";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
      onTyping?.();
    };

    return (
      <div style={{ position: "relative", flexShrink: 0 }}>
        {showPicker && (
          <div
            ref={pickerContainerRef}
            style={{ position: "absolute", bottom: "100%", left: 0, zIndex: 100, paddingBottom: 4 }}
          >
            <EmojiPicker
              data={data}
              onEmojiSelect={insertEmoji}
              theme="dark"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}

        {replyTo && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 16px 6px 12px",
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 1 }}>
                {replyTo.senderName}
              </div>
              <div style={{
                fontSize: 12, color: "var(--text2)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {replyTo.content}
              </div>
            </div>
            <button
              onClick={onCancelReply}
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", color: "var(--text3)",
                display: "flex", alignItems: "center",
                padding: 2, borderRadius: 4, flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"; }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
        }}>
          <IconBtn onClick={() => setShowPicker(v => !v)}>
            <Smile size={15} />
          </IconBtn>
          <IconBtn>
            <Paperclip size={15} />
          </IconBtn>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Write a message..."
            rows={1}
            className="chat-textarea"
            style={{
              flex: 1,
              background: "var(--bg-active)",
              border: focused ? "1px solid var(--border-hi)" : "1px solid var(--border)",
              borderRadius: 10,
              padding: "8px 12px",
              color: "var(--text1)",
              fontSize: 14,
              lineHeight: 1.5,
              minHeight: 36,
              maxHeight: 120,
              resize: "none",
              outline: "none",
              overflowY: "auto",
              fontFamily: "var(--font-dm-sans, sans-serif)",
              transition: "border-color 0.15s",
            }}
          />

          <button
            onClick={submit}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
            style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "var(--accent)",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
          >
            <SendHorizontal size={16} style={{ color: "#06080C" }} />
          </button>
        </div>
      </div>
    );
  }
);

export default ChatInputBar;