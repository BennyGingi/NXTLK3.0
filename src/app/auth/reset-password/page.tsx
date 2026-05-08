"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function InputField({
  type, value, onChange, placeholder, icon, label, delay,
}: {
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  label: string;
  delay: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14, animation: `fade-up 0.5s ease ${delay} both` }}>
      <label style={{
        display: "block", fontSize: 11.5, color: "var(--text2)",
        fontWeight: 500, marginBottom: 6,
      }}>
        {label}
      </label>
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!password)              { setError("Please enter a new password."); return; }
    if (password.length < 6)    { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)   { setError("Passwords don't match."); return; }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); }
    else { router.push("/chat"); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── LEFT PANEL ────────────────────────────────────── */}
      <div style={{ flex: "1.1", position: "relative", overflow: "hidden", background: "#06080C" }}>

        {/* Orb 1 */}
        <div style={{
          position: "absolute", width: 520, height: 520, top: "-8%", left: "-4%",
          background: "radial-gradient(circle, rgba(0,212,168,0.22) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-1 18s ease-in-out infinite",
        }} />
        {/* Orb 2 */}
        <div style={{
          position: "absolute", width: 420, height: 420, bottom: "4%", right: "3%",
          background: "radial-gradient(circle, rgba(0,120,255,0.18) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-2 22s ease-in-out infinite",
        }} />
        {/* Orb 3 */}
        <div style={{
          position: "absolute", width: 360, height: 360, top: "38%", left: "38%",
          background: "radial-gradient(circle, rgba(0,212,168,0.13) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "drift-3 15s ease-in-out infinite",
        }} />
        {/* Orb 4 */}
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

        {/* Content */}
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
            <span style={{
              fontFamily: "var(--font-bricolage, sans-serif)",
              fontWeight: 700, fontSize: 20, color: "var(--text1)",
            }}>
              nxtlk
            </span>
          </div>

          {/* Hero */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 60 }}>
            <h1 style={{
              fontFamily: "var(--font-bricolage, sans-serif)",
              fontSize: 52, fontWeight: 800, lineHeight: 1.1,
              color: "var(--text1)", margin: 0,
            }}>
              Talk fast.<br />
              <span style={{ color: "var(--accent)" }}>Stay close.</span>
            </h1>
            <p style={{
              marginTop: 16, marginBottom: 0,
              fontSize: 15, color: "var(--text2)", maxWidth: 360, lineHeight: 1.6,
            }}>
              Real-time conversations, calls, and file sharing — all in one place.
            </p>
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

          {/* Eyebrow */}
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
            color: "var(--accent)", textTransform: "uppercase", marginBottom: 12,
            animation: "fade-up 0.5s ease 0.05s both",
          }}>
            — Secure reset
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: "var(--font-bricolage, sans-serif)",
            fontSize: 34, fontWeight: 700, lineHeight: 1.15,
            color: "var(--text1)", margin: "0 0 6px 0",
            animation: "fade-up 0.5s ease 0.1s both",
          }}>
            New<br />
            <span style={{ color: "var(--accent)" }}>password.</span>
          </h2>

          {/* Subtext */}
          <p style={{
            fontSize: 13, color: "var(--text2)", marginBottom: 28,
            animation: "fade-up 0.5s ease 0.15s both",
          }}>
            Choose a strong password to secure your account.
          </p>

          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <InputField
              type="password" value={password} onChange={setPassword}
              placeholder="New password" label="New password"
              icon={<Lock size={15} />} delay="0.2s"
            />
            <InputField
              type="password" value={confirm} onChange={setConfirm}
              placeholder="Confirm password" label="Confirm password"
              icon={<Lock size={15} />} delay="0.25s"
            />

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
              {loading ? "Updating..." : "Update password →"}
            </button>
          </form>

          <p style={{
            textAlign: "center", fontSize: 12.5, color: "var(--text2)",
            animation: "fade-up 0.5s ease 0.45s both",
          }}>
            Remember it after all?{" "}
            <a href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
