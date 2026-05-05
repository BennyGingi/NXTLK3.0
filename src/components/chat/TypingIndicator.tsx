interface TypingIndicatorProps {
  names: string[];
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const text =
    names.length === 1 ? `${names[0]} is typing...` :
    names.length === 2 ? `${names[0]} and ${names[1]} are typing...` :
    `${names.length} people are typing...`;

  return (
    <div style={{
      height: 28, padding: "0 16px", flexShrink: 0,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 4, height: 4, borderRadius: "50%",
              background: "var(--accent)",
              animation: `bounce-dot 1s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{
        fontSize: 11, color: "var(--text3)",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
      }}>
        {text}
      </span>
    </div>
  );
}
