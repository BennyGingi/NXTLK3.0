"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const BUBBLES = [
  { text: "yo, just pushed the new build 🔥", right: false, left: "8%",  delay: "0s",   dur: "7.2s" },
  { text: "ship it 🚀",                        right: true,  left: "52%", delay: "1.5s", dur: "8.5s" },
  { text: "code review done, lgtm",            right: false, left: "14%", delay: "3s",   dur: "6.8s" },
  { text: "meeting at 3pm?",                   right: true,  left: "58%", delay: "0.8s", dur: "9s"   },
  { text: "on it ✓",                           right: false, left: "24%", delay: "2.2s", dur: "7.5s" },
  { text: "design looks clean btw 👌",          right: true,  left: "44%", delay: "4s",   dur: "8s"   },
];

const STATS        = ["12k+ Users", "<80ms Latency", "99.9% Uptime"];
const AVATAR_SEEDS = ["alex", "sarah", "mike", "luna", "nova"];

const CHAT_MESSAGES: { user: string; text: string }[] = [
  { user: "alex",  text: "hey everyone 👋" },
  { user: "sarah", text: "yo! what's good" },
  { user: "mike",  text: "just pushed the fix 🔧" },
  { user: "luna",  text: "finally!! was waiting for that" },
  { user: "nova",  text: "ship it ship it ship it 🚀" },
  { user: "jake",  text: "lol calm down nova 😂" },
  { user: "zara",  text: "the new UI looks insane btw" },
  { user: "kai",   text: "fr the dark mode is 🔥" },
  { user: "alex",  text: "benny designed it right?" },
  { user: "sarah", text: "yeah he's been cooking" },
  { user: "mike",  text: "merged ✅" },
  { user: "luna",  text: "let's gooo 🎉" },
  { user: "nova",  text: "anyone on the call later?" },
  { user: "jake",  text: "3pm works for me" },
  { user: "zara",  text: "same, adding to calendar" },
  { user: "kai",   text: "wait did you see the typing indicator??" },
  { user: "alex",  text: "bro it's so smooth" },
  { user: "sarah", text: "the reactions too 👀" },
  { user: "mike",  text: "this is actually better than slack" },
  { user: "luna",  text: "don't let slack hear that 😭" },
  { user: "nova",  text: "too late, already switched" },
  { user: "jake",  text: "nxtlk > everything" },
  { user: "zara",  text: "facts 🤝" },
  { user: "kai",   text: "okay back to work everyone lol" },
  { user: "alex",  text: "5 more minutes 😅" },
];

type VisibleMsg = {
  key: number;
  user: string;
  text: string;
  outgoing: boolean;
};

function InputField({
  type, value, onChange, placeholder, icon, label, right, delay,
}: {
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  delay: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14, animation: `fade-up 0.5s ease ${delay} both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 11.5, color: "var(--text2)", fontWeight: 500 }}>{label}</label>
        {right}
      </div>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          color: focused ? "var(--accent)" : "var(--text3)",
          transition: "color 0.15s", pointerEvents: "none",
          display: "flex", alignItems: "center",
        }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%", height: 40,
            padding: "0 12px 0 34px",
            background: focused ? "var(--bg-active)" : "var(--bg-input)",
            border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
            boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
            borderRadius: 8,
            color: "var(--text1)", fontSize: 13,
            outline: "none", boxSizing: "border-box",
            caretColor: "var(--accent)",
            transition: "background 0.15s, border 0.15s, box-shadow 0.15s",
          }}
        />
      </div>
    </div>
  );
}

function RegisteredBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") !== "1") return null;
  return (
    <div style={{
      marginBottom: 14, padding: "9px 12px", borderRadius: 8,
      background: "rgba(0,212,168,0.07)", border: "1px solid rgba(0,212,168,0.25)",
      fontSize: 12, color: "var(--accent)",
      animation: "fade-up 0.3s ease both",
    }}>
      Account created! Check your email to confirm, then sign in.
    </div>
  );
}

function FeatureCard({ icon, title, subtitle, delay }: {
  icon: string; title: string; subtitle: string; delay: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(0,212,168,0.30)" : "var(--border)"}`,
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: hovered ? "0 0 16px rgba(0,212,168,0.07)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        animation: `fade-up 0.5s ease ${delay} both`,
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text1)" }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.4 }}>{subtitle}</div>
    </div>
  );
}

function LiveChatMockup() {
  const [msgs, setMsgs] = useState<VisibleMsg[]>(() =>
    [0, 1, 2, 3, 4].map(idx => ({
      key:      idx,
      user:     CHAT_MESSAGES[idx].user,
      text:     CHAT_MESSAGES[idx].text,
      outgoing: idx % 2 === 1,
    }))
  );
  const [showTyping, setShowTyping] = useState(false);
  const cursorRef = useRef({ idx: 5, key: 5 });

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout> | undefined;
    const iv = setInterval(() => {
      setShowTyping(true);
      tid = setTimeout(() => {
        setShowTyping(false);
        const { idx, key } = cursorRef.current;
        const def = CHAT_MESSAGES[idx % CHAT_MESSAGES.length];
        cursorRef.current = { idx: idx + 1, key: key + 1 };
        setMsgs(prev => [
          ...prev.slice(-5),
          { key, user: def.user, text: def.text, outgoing: idx % 2 === 1 },
        ]);
      }, 500);
    }, 1200);
    return () => {
      clearInterval(iv);
      clearTimeout(tid);
    };
  }, []);

  return (
    <div
      className="chat-mockup"
      style={{
        position: "absolute", right: "5%", top: "25%", zIndex: 15,
        width: 280,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-hi)",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        transform: "rotate(-2deg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "1px solid rgba(0,212,168,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "var(--accent)",
          }}>
            #
          </div>
          <div style={{
            position: "absolute", bottom: -1, right: -1,
            width: 7, height: 7, borderRadius: "50%",
            background: "#4ADE80",
            border: "1.5px solid var(--bg-surface)",
          }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text1)", lineHeight: 1 }}>nxtlk chat</div>
          <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>8 members online</div>
        </div>
      </div>

      {/* Scrolling messages */}
      <div style={{
        height: 300,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "8px 12px",
        gap: 5,
      }}>
        {msgs.map(msg => (
          <div
            key={msg.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.outgoing ? "flex-end" : "flex-start",
              flexShrink: 0,
              animation: "chat-bubble-appear 0.3s ease both",
            }}
          >
            {!msg.outgoing && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.user}`}
                  alt={msg.user}
                  width={24}
                  height={24}
                  style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "var(--bg-active)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 9, color: "var(--text3)" }}>{msg.user}</span>
              </div>
            )}
            <div style={{
              padding: "6px 10px",
              borderRadius: msg.outgoing ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
              background: msg.outgoing ? "var(--accent-dim)" : "var(--bg-active)",
              border: msg.outgoing
                ? "1px solid rgba(0,212,168,0.2)"
                : "1px solid var(--border)",
              color: "var(--text1)",
              fontSize: 11,
              maxWidth: 200,
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "4px 2px",
            flexShrink: 0,
            animation: "chat-bubble-appear 0.2s ease both",
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--text3)",
                  animation: `bounce-dot 0.8s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail,        setForgotEmail]        = useState("");
  const [forgotLoading,      setForgotLoading]      = useState(false);
  const [forgotError,        setForgotError]        = useState<string | null>(null);
  const [forgotSent,         setForgotSent]         = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); }
    else {
      if (!rememberMe) {
        sessionStorage.setItem("nxtlk_no_persist", "true");
      } else {
        sessionStorage.removeItem("nxtlk_no_persist");
        localStorage.setItem("nxtlk_remember", "true");
      }
      localStorage.setItem("nxtlk_login_time", Date.now().toString());
      window.location.replace("/chat");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setForgotError("Please enter your email address."); return; }
    setForgotLoading(true);
    setForgotError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: "https://nxtlk3.gingi2603.workers.dev/auth/reset-password",
    });
    if (resetError) { setForgotError(resetError.message); setForgotLoading(false); }
    else { setForgotSent(true); setForgotLoading(false); }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── LEFT PANEL ────────────────────────────────────── */}
      <div style={{ flex: "1.1", position: "relative", overflow: "hidden", background: "#06080C" }}>

        {/* Orb 1 — teal, top-left */}
        <div style={{
          position: "absolute", width: 520, height: 520, top: "-8%", left: "-4%",
          background: "radial-gradient(circle, rgba(0,212,168,0.22) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-1 18s ease-in-out infinite",
        }} />

        {/* Orb 2 — blue, bottom-right */}
        <div style={{
          position: "absolute", width: 420, height: 420, bottom: "4%", right: "3%",
          background: "radial-gradient(circle, rgba(0,120,255,0.18) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-2 22s ease-in-out infinite",
        }} />

        {/* Orb 3 — teal, center */}
        <div style={{
          position: "absolute", width: 360, height: 360, top: "38%", left: "38%",
          background: "radial-gradient(circle, rgba(0,212,168,0.13) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-3 15s ease-in-out infinite",
        }} />

        {/* Orb 4 — purple */}
        <div style={{
          position: "absolute", width: 300, height: 300, top: "60%", right: "15%",
          background: "radial-gradient(circle, rgba(100,60,255,0.12) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-2 20s ease-in-out infinite",
        }} />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* SVG grain */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Live chat mockup */}
        <LiveChatMockup />

        {/* Content layer */}
        <div style={{
          position: "relative", zIndex: 10,
          padding: "40px 48px", height: "100%",
          display: "flex", flexDirection: "column",
        }}>

          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse-ring 2.5s ease-out infinite",
              fontFamily: "var(--font-bricolage, sans-serif)",
              fontWeight: 700, fontSize: 13, color: "#06080C",
            }}>
              nxt
            </div>
            <span style={{ fontFamily: "var(--font-bricolage, sans-serif)", fontWeight: 700, fontSize: 20, color: "var(--text1)" }}>
              nxtlk
            </span>
          </div>

          {/* Center hero section */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 60 }}>
            <h1 style={{
              fontFamily: "var(--font-bricolage, sans-serif)",
              fontSize: 52, fontWeight: 800, lineHeight: 1.1,
              color: "var(--text1)", margin: 0,
            }}>
              Talk fast.<br />
              <span style={{ color: "var(--accent)" }}>Stay close.</span>
            </h1>
            <p style={{ marginTop: 16, marginBottom: 0, fontSize: 15, color: "var(--text2)", maxWidth: 360, lineHeight: 1.6 }}>
              Real-time conversations, calls, and file sharing — all in one place.
            </p>

            {/* Feature cards */}
            <div style={{ display: "flex", gap: 10, marginTop: 28, maxWidth: 460 }}>
              <FeatureCard icon="🔒" title="End-to-End Encrypted" subtitle="Your messages stay private"   delay="0.2s"  />
              <FeatureCard icon="⚡" title="Real-time"            subtitle="Instant delivery, zero lag"   delay="0.35s" />
              <FeatureCard icon="🌍" title="Works Everywhere"     subtitle="Desktop, tablet, mobile"       delay="0.5s"  />
            </div>

            {/* Avatar stack + social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, animation: "fade-up 0.5s ease 0.65s both" }}>
              <div style={{ display: "flex" }}>
                {AVATAR_SEEDS.map((seed, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={seed}
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`}
                    alt={seed}
                    width={32}
                    height={32}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      border: "2px solid var(--bg-base)",
                      marginLeft: i > 0 ? -8 : 0,
                      background: "var(--bg-active)",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>Join 2,400+ users already chatting</span>
            </div>
          </div>

          {/* Floating bubbles */}
          <div style={{ position: "absolute", top: "18%", bottom: "14%", left: 0, right: 0, overflow: "hidden", pointerEvents: "none" }}>
            {BUBBLES.map((b, i) => (
              <div key={i} style={{
                position: "absolute", left: b.left, bottom: 0,
                padding: "8px 14px", borderRadius: 18, fontSize: 12, whiteSpace: "nowrap",
                background: b.right ? "var(--accent)" : "var(--bg-surface)",
                border:     b.right ? "none" : "1px solid var(--border)",
                color:      b.right ? "#06080C" : "var(--text1)",
                animation:  `float-up ${b.dur} linear ${b.delay} infinite`,
              }}>
                {b.text}
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ position: "absolute", bottom: 32, left: 48, display: "flex", alignItems: "center" }}>
            {STATS.map((stat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div style={{ width: 1, height: 24, background: "var(--border-hi)", margin: "0 18px" }} />
                )}
                <span style={{ fontSize: 12, color: "var(--text2)" }}>{stat}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────── */}
      <div style={{
        width: 460, background: "var(--bg-surface)",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>

        {/* Corner decoration */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 120, height: 120,
          borderTop: "1.5px solid var(--border-hi)",
          borderRight: "1.5px solid var(--border-hi)",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", bottom: -4, left: -4,
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 12px var(--accent)",
          }} />
        </div>

        {/* Form */}
        <div style={{ width: "100%", padding: "0 48px" }}>

          {showForgotPassword ? (
            <>
              {/* Back button */}
              <button
                type="button"
                onClick={() => { setShowForgotPassword(false); setForgotEmail(""); setForgotError(null); setForgotSent(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text2)", fontSize: 12.5, padding: 0, marginBottom: 28,
                  animation: "fade-up 0.3s ease both",
                }}
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>

              <h2 style={{
                fontFamily: "var(--font-bricolage, sans-serif)",
                fontSize: 34, fontWeight: 700, lineHeight: 1.15,
                color: "var(--text1)", margin: "0 0 6px 0",
                animation: "fade-up 0.3s ease 0.05s both",
              }}>
                Reset<br />
                <span style={{ color: "var(--accent)" }}>password.</span>
              </h2>

              <p style={{
                fontSize: 13, color: "var(--text2)", marginBottom: 28,
                animation: "fade-up 0.3s ease 0.1s both",
              }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {forgotSent ? (
                <div style={{
                  padding: "14px 16px", borderRadius: 8,
                  background: "rgba(0,212,168,0.07)", border: "1px solid rgba(0,212,168,0.25)",
                  fontSize: 13, color: "var(--accent)", lineHeight: 1.6,
                  animation: "fade-up 0.3s ease both",
                }}>
                  Check your inbox! We sent a reset link to <strong>{forgotEmail}</strong>.
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleForgotPassword(); }}>
                  <InputField
                    type="email" value={forgotEmail} onChange={setForgotEmail}
                    placeholder="you@example.com" label="Email"
                    icon={<Mail size={15} />} delay="0.15s"
                  />

                  {forgotError && (
                    <div style={{
                      marginBottom: 14, padding: "9px 12px", borderRadius: 8,
                      background: "rgba(255,90,90,0.07)", border: "1px solid rgba(255,90,90,0.18)",
                      fontSize: 12, color: "#FF7B7B",
                      animation: "fade-up 0.3s ease both",
                    }}>
                      {forgotError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: "100%", height: 42,
                      background: "var(--accent)", color: "#06080C",
                      border: "none", borderRadius: 8,
                      fontSize: 14, fontWeight: 600,
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      opacity: forgotLoading ? 0.7 : 1,
                      transition: "box-shadow 0.2s, transform 0.1s, opacity 0.15s",
                      fontFamily: "var(--font-dm-sans, sans-serif)",
                      animation: "fade-up 0.3s ease 0.2s both",
                    }}
                    onMouseEnter={e => { if (!forgotLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,212,168,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                    onMouseDown={e =>  { if (!forgotLoading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
                    onMouseUp={e =>    { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  >
                    {forgotLoading ? "Sending..." : "Send reset link →"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Eyebrow */}
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
                color: "var(--accent)", textTransform: "uppercase", marginBottom: 12,
                animation: "fade-up 0.5s ease 0.05s both",
              }}>
                — Secure sign in
              </div>

              {/* Heading */}
              <h2 style={{
                fontFamily: "var(--font-bricolage, sans-serif)",
                fontSize: 34, fontWeight: 700, lineHeight: 1.15,
                color: "var(--text1)", margin: "0 0 6px 0",
                animation: "fade-up 0.5s ease 0.1s both",
              }}>
                Welcome<br />
                <span style={{ color: "var(--accent)" }}>back.</span>
              </h2>

              {/* Subtext */}
              <p style={{
                fontSize: 13, color: "var(--text2)", marginBottom: 28,
                animation: "fade-up 0.5s ease 0.15s both",
              }}>
                Your conversations are waiting for you.
              </p>

              <form onSubmit={e => { e.preventDefault(); handleSignIn(); }}>
                <InputField
                  type="email" value={email} onChange={setEmail}
                  placeholder="you@example.com" label="Email"
                  icon={<Mail size={15} />} delay="0.2s"
                />

                <InputField
                  type="password" value={password} onChange={setPassword}
                  placeholder="••••••••" label="Password"
                  icon={<Lock size={15} />} delay="0.25s"
                  right={
                    <button type="button" onClick={() => setShowForgotPassword(true)} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Forgot it?
                    </button>
                  }
                />

                {/* Remember Me */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                  animation: "fade-up 0.5s ease 0.28s both",
                }}>
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--accent)" }}
                  />
                  <label
                    htmlFor="remember-me"
                    style={{ fontSize: 12.5, color: "var(--text2)", cursor: "pointer", userSelect: "none" }}
                  >
                    Remember me
                  </label>
                </div>

                {/* Registration success */}
                <Suspense fallback={null}>
                  <RegisteredBanner />
                </Suspense>

                {/* Error */}
                {error && (
                  <div style={{
                    marginBottom: 14, padding: "9px 12px", borderRadius: 8,
                    background: "rgba(255,90,90,0.07)", border: "1px solid rgba(255,90,90,0.18)",
                    fontSize: 12, color: "#FF7B7B",
                    animation: "fade-up 0.3s ease both",
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", height: 42,
                    background: "var(--accent)", color: "#06080C",
                    border: "none", borderRadius: 8,
                    fontSize: 14, fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer", marginBottom: 22,
                    opacity: loading ? 0.7 : 1,
                    transition: "box-shadow 0.2s, transform 0.1s, opacity 0.15s",
                    fontFamily: "var(--font-dm-sans, sans-serif)",
                    animation: "fade-up 0.5s ease 0.3s both",
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,212,168,0.4)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                  onMouseDown={e =>  { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
                  onMouseUp={e =>    { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  {loading ? "Signing in..." : "Sign in →"}
                </button>
              </form>

              {/* OR divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                animation: "fade-up 0.5s ease 0.35s both",
              }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              {/* OAuth */}
              <div style={{ display: "flex", gap: 10, marginBottom: 28, animation: "fade-up 0.5s ease 0.4s both" }}>
                {[
                  {
                    label: "Google",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    ),
                  },
                  { label: "GitHub", icon: <GitHubIcon /> },
                ].map(({ label, icon }) => (
                  <OAuthButton
                    key={label}
                    label={label}
                    icon={icon}
                    onClick={() => handleOAuth(label === "Google" ? "google" : "github")}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Footer */}
              <p style={{
                textAlign: "center", fontSize: 12.5, color: "var(--text2)",
                animation: "fade-up 0.5s ease 0.45s both",
              }}>
                No account yet?{" "}
                <a
                  href="/register"
                  style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
                >
                  Create one free
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OAuthButton({
  label, icon, onClick, disabled,
}: {
  label: string; icon: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, height: 38,
        background: hovered ? "var(--bg-hover)" : "var(--bg-active)",
        border: `1px solid ${hovered ? "var(--border-hi)" : "var(--border)"}`,
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        color: "var(--text1)", fontSize: 13, fontWeight: 500, cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}