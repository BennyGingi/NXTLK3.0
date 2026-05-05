"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";

interface ChatInputBarProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
}

export interface ChatInputBarHandle {
  focus: () => void;
}

function AttachBtn() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
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
      <Paperclip size={15} />
    </button>
  );
}

const ChatInputBar = forwardRef<ChatInputBarHandle, ChatInputBarProps>(
  function ChatInputBar({ onSend, onTyping }, ref) {
    const [value,   setValue]   = useState("");
    const [focused, setFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }));

    const submit = () => {
      const trimmed = value.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "36px";
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
      onTyping?.();
    };

    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", flexShrink: 0,
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
      }}>
        <AttachBtn />

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
    );
  }
);

export default ChatInputBar;
