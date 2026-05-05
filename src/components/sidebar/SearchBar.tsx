"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  showKbdHint?: boolean;
  onSearch?: (v: string) => void;
  onFilterChange?: (f: string | null) => void;
}

const FILTERS = ["All", "Unread", "Groups", "Direct"];

export default function SearchBar({
  placeholder = "Search",
  showFilters = true,
  showKbdHint = true,
  onSearch,
  onFilterChange,
}: SearchBarProps) {
  const [value, setValue]             = useState("");
  const [focused, setFocused]         = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    onSearch?.(v);
  };

  const handleClear = () => {
    setValue("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleFilter = (f: string) => {
    const next = activeFilter === f ? null : f;
    setActiveFilter(next);
    onFilterChange?.(next);
  };

  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, background: "var(--bg-surface)", flexShrink: 0 }}>

      {/* Input */}
      <div style={{ position: "relative" }}>
        <Search
          size={14}
          style={{
            position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)",
            color: focused ? "var(--accent)" : "var(--text3)",
            transition: "color 0.15s", pointerEvents: "none",
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%", height: 34,
            padding: "0 32px",
            background: focused ? "var(--bg-active)" : "var(--bg-input)",
            border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
            boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
            borderRadius: 10,
            color: "var(--text1)", fontSize: 12.5,
            outline: "none", boxSizing: "border-box",
            caretColor: "var(--accent)",
            transition: "background 0.15s, border 0.15s, box-shadow 0.15s",
          }}
        />

        {/* Kbd hint */}
        {!value && !focused && showKbdHint && (
          <span style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            fontSize: 9.5, color: "var(--text3)",
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            background: "var(--bg-hover)",
            border: "1px solid var(--border)",
            borderRadius: 4, padding: "1px 4px",
            pointerEvents: "none",
          }}>⌘K</span>
        )}

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            style={{
              position: "absolute", right: 8, top: "50%",
              transform: "translateY(-50%)",
              width: 18, height: 18,
              background: "var(--text3)",
              border: "none", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0,
              animation: "scale-in 0.15s ease forwards",
            }}
          >
            <X size={10} color="var(--bg-base)" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div style={{ display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none" as const }}>
          {FILTERS.map(f => (
            <FilterChip
              key={f}
              label={f}
              active={activeFilter === f}
              onClick={() => handleFilter(f)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, height: 24, padding: "0 10px",
        borderRadius: 20, fontSize: 11, fontWeight: 500,
        cursor: "pointer",
        border: active ? "1px solid rgba(0,212,168,0.4)" : `1px solid ${hovered ? "var(--border-hi)" : "var(--border)"}`,
        background: active ? "var(--accent-dim)" : "transparent",
        color: active ? "var(--accent)" : hovered ? "var(--text1)" : "var(--text2)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
