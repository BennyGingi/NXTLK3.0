"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, AtSign, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUBBLES = [
  { text: "yo, just pushed the new build 🔥", right: false, left: "8%",  delay: "0s",   dur: "7.2s" },
  { text: "ship it 🚀",                        right: true,  left: "52%", delay: "1.5s", dur: "8.5s" },
  { text: "code review done, lgtm",            right: false, left: "14%", delay: "3s",   dur: "6.8s" },
  { text: "meeting at 3pm?",                   right: true,  left: "58%", delay: "0.8s", dur: "9s"   },
  { text: "on it ✓",                           right: false, left: "24%", delay: "2.2s", dur: "7.5s" },
  { text: "design looks clean btw 👌",          right: true,  left: "44%", delay: "4s",   dur: "8s"   },
];

const STATS = ["12k+ Users", "<80ms Latency", "99.9% Uptime"];

function toUsername(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "");
}

function validateEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

interface FieldProps {
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  label: string;
  delay: string;
  error?: string;
  right?: React.ReactNode;
}

function InputField({ type, value, onChange, placeholder, icon, label, delay, error, right }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: 14, animation: `fade-up 0.5s ease ${delay} both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 11.5, color: "var(--text2)", fontWeight: 500 }}>{label}</label>
        {right}
      </div>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          color: hasError ? "#FF5A5A" : focused ? "var(--accent)" : "var(--text3)",
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
            border: hasError
              ? "1px solid rgba(255,90,90,0.45)"
              : focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
            boxShadow: hasError
              ? "0 0 0 3px rgba(255,90,90,0.07)"
              : focused ? "0 0 0 3px var(--accent-glow)" : "none",
            borderRadius: 8,
            color: "var(--text1)", fontSize: 13,
            outline: "none", boxSizing: "border-box",
            caretColor: "var(--accent)",
            transition: "background 0.15s, border 0.15s, box-shadow 0.15s",
          }}
        />
      </div>
      {hasError && (
        <div style={{ marginTop: 4, fontSize: 11, color: "#FF5A5A" }}>{error}</div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName]     = useState("");
  const [username, setUsername]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Auto-derive username from full name until user manually edits it
  useEffect(() => {
    if (!usernameEdited) {
      setUsername(toUsername(fullName));
    }
  }, [fullName, usernameEdited]);

  const handleUsernameChange = (v: string) => {
    setUsernameEdited(true);
    setUsername(v);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 2)
      e.fullName = "Full name must be at least 2 characters";
    if (!username || username.length < 3)
      e.username = "Username must be at least 3 characters";
    else if (!/^[a-z0-9_]+$/.test(username))
      e.username = "Only lowercase letters, numbers, and underscores";
    if (!email || !validateEmail(email))
      e.email = "Please enter a valid email address";
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), username } },
    });

    if (authError) {
      setSubmitError(authError.message);
      setLoading(false);
    } else if (data.session) {
      localStorage.setItem("nxtlk_login_time", Date.now().toString());
      router.refresh();
      router.push("/chat");
    } else {
      // Email confirmation required — show message instead of redirecting to /chat
      router.push("/login?registered=1");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── LEFT PANEL ────────────────────────────────────── */}
      <div style={{ flex: "1.1", position: "relative", overflow: "hidden", background: "#06080C" }}>

        {/* Orbs */}
        <div style={{
          position: "absolute", width: 520, height: 520, top: "-8%", left: "-4%",
          background: "radial-gradient(circle, rgba(0,212,168,0.22) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-1 18s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 420, height: 420, bottom: "4%", right: "3%",
          background: "radial-gradient(circle, rgba(0,120,255,0.18) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-2 22s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 360, height: 360, top: "38%", left: "38%",
          background: "radial-gradient(circle, rgba(0,212,168,0.13) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-3 15s ease-in-out infinite",
        }} />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* SVG grain */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="grain-reg">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-reg)" />
        </svg>

        {/* Content layer */}
        <div style={{ position: "relative", zIndex: 10, padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>

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

          {/* Tagline */}
          <div style={{ marginTop: "auto", marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "var(--font-bricolage, sans-serif)",
              fontSize: 52, fontWeight: 800, lineHeight: 1.1,
              color: "var(--text1)", margin: 0,
            }}>
              Talk fast.<br />
              <span style={{ color: "var(--accent)" }}>Stay close.</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: 15, color: "var(--text2)", maxWidth: 360, lineHeight: 1.6 }}>
              Real-time conversations, calls, and file sharing — all in one place.
            </p>
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
        overflowY: "auto",
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
        <div style={{ width: "100%", padding: "40px 48px" }}>

          {/* Eyebrow */}
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
            color: "var(--accent)", textTransform: "uppercase", marginBottom: 12,
            animation: "fade-up 0.5s ease 0.05s both",
          }}>
            — Create your account
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: "var(--font-bricolage, sans-serif)",
            fontSize: 34, fontWeight: 700, lineHeight: 1.15,
            color: "var(--text1)", margin: "0 0 6px 0",
            animation: "fade-up 0.5s ease 0.1s both",
          }}>
            Join the<br />
            <span style={{ color: "var(--accent)" }}>conversation.</span>
          </h2>

          {/* Subtext */}
          <p style={{
            fontSize: 13, color: "var(--text2)", marginBottom: 24,
            animation: "fade-up 0.5s ease 0.15s both",
          }}>
            Free forever. No credit card required.
          </p>

          <InputField
            type="text"
            value={fullName}
            onChange={v => { setFullName(v); clearFieldError("fullName"); }}
            placeholder="Benny Gingi"
            label="Full name"
            icon={<User size={15} />}
            delay="0.2s"
            error={errors.fullName}
          />

          <InputField
            type="text"
            value={username}
            onChange={v => { handleUsernameChange(v); clearFieldError("username"); }}
            placeholder="bennygx"
            label="Username"
            icon={<AtSign size={15} />}
            delay="0.25s"
            error={errors.username}
          />

          <InputField
            type="email"
            value={email}
            onChange={v => { setEmail(v); clearFieldError("email"); }}
            placeholder="you@example.com"
            label="Email"
            icon={<Mail size={15} />}
            delay="0.3s"
            error={errors.email}
          />

          <InputField
            type="password"
            value={password}
            onChange={v => { setPassword(v); clearFieldError("password"); }}
            placeholder="••••••••••"
            label="Password"
            icon={<Lock size={15} />}
            delay="0.35s"
            error={errors.password}
          />

          {/* Submit error */}
          {submitError && (
            <div style={{
              marginBottom: 14, padding: "9px 12px", borderRadius: 8,
              background: "rgba(255,90,90,0.07)", border: "1px solid rgba(255,90,90,0.18)",
              fontSize: 12, color: "#FF7B7B",
              animation: "fade-up 0.3s ease both",
            }}>
              {submitError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
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
              animation: "fade-up 0.5s ease 0.4s both",
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,212,168,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            onMouseDown={e =>  { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
            onMouseUp={e =>    { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>

          {/* Footer */}
          <p style={{
            textAlign: "center", fontSize: 12.5, color: "var(--text2)",
            animation: "fade-up 0.5s ease 0.45s both",
          }}>
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
