"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User, Shield, Palette, ArrowLeft,
  Camera, Check, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDefaultAvatar } from "@/lib/avatar";

// ── Types ────────────────────────────────────────────────────────────────────

type Section = "profile" | "security" | "appearance";

type ProfileData = {
  name:       string | null;
  initials:   string | null;
  username:   string | null;
  avatar_url: string | null;
  status:     string | null;
};

interface SettingsClientProps {
  user:    { id: string; email: string };
  profile: ProfileData | null;
}

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        margin: 0, fontSize: 20, fontWeight: 700,
        color: "var(--text1)",
        fontFamily: "var(--font-bricolage, sans-serif)",
      }}>
        {title}
      </h2>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text2)" }}>{subtitle}</p>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11.5, fontWeight: 500, color: "var(--text2)",
      marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {children}
    </div>
  );
}

function FieldInput({
  value, onChange, placeholder, disabled, type = "text",
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: 40, boxSizing: "border-box",
        padding: "0 12px",
        background: disabled ? "var(--bg-hover)" : focused ? "var(--bg-active)" : "var(--bg-active)",
        border: focused ? "1px solid var(--border-hi)" : "1px solid var(--border)",
        borderRadius: 8, color: disabled ? "var(--text3)" : "var(--text1)",
        fontSize: 13, outline: "none",
        fontFamily: "var(--font-dm-sans, sans-serif)",
        transition: "border-color 0.15s",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  );
}

function FeedbackBanner({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 14px", borderRadius: 8, marginTop: 16,
      background: type === "success" ? "rgba(0,212,168,0.07)" : "rgba(255,90,90,0.07)",
      border: `1px solid ${type === "success" ? "rgba(0,212,168,0.25)" : "rgba(255,90,90,0.25)"}`,
      animation: "fade-up 0.25s ease both",
    }}>
      {type === "success"
        ? <Check size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
        : <AlertCircle size={14} style={{ color: "#FF7B7B", flexShrink: 0 }} />}
      <span style={{ fontSize: 12.5, color: type === "success" ? "var(--accent)" : "#FF7B7B" }}>
        {message}
      </span>
    </div>
  );
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 38, padding: "0 24px",
        background: loading ? "var(--bg-active)" : hovered ? "var(--accent)" : "var(--accent)",
        border: "none", borderRadius: 8,
        fontSize: 13.5, fontWeight: 600,
        color: loading ? "var(--text3)" : "#06080C",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "opacity 0.15s, filter 0.15s",
        filter: hovered && !loading ? "brightness(1.08)" : "brightness(1)",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {loading ? "Saving…" : "Save changes"}
    </button>
  );
}

// ── Left navigation ───────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "profile",    label: "Profile",    icon: <User    size={15} /> },
  { id: "security",   label: "Security",   icon: <Shield  size={15} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={15} /> },
];

function SettingsNav({ active, onSelect }: { active: Section; onSelect: (s: Section) => void }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      display: "flex", flexDirection: "column",
      height: "100vh", overflowY: "auto",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      padding: "20px 12px",
    }}>
      {/* Logo + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingLeft: 4 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-bricolage, sans-serif)",
          fontWeight: 700, fontSize: 11, color: "#06080C",
          flexShrink: 0,
        }}>
          nxt
        </div>
        <span style={{
          fontFamily: "var(--font-bricolage, sans-serif)",
          fontWeight: 700, fontSize: 15, color: "var(--text1)",
        }}>
          Settings
        </span>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.id === active;
          return (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              onClick={() => onSelect(item.id)}
            />
          );
        })}
      </div>

      {/* Back to chat */}
      <Link
        href="/chat"
        style={{
          marginTop: "auto",
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px", borderRadius: 8,
          color: "var(--text3)", fontSize: 13,
          textDecoration: "none",
          transition: "color 0.15s, background 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text1)";
          (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-hover)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text3)";
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        <ArrowLeft size={14} />
        Back to chat
      </Link>
    </div>
  );
}

function NavItem({ label, icon, isActive, onClick }: {
  label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 8,
        background: isActive ? "var(--accent-dim)" : hovered ? "var(--bg-hover)" : "transparent",
        border: isActive ? "1px solid rgba(0,212,168,0.2)" : "1px solid transparent",
        color: isActive ? "var(--accent)" : hovered ? "var(--text1)" : "var(--text2)",
        fontSize: 13, fontWeight: isActive ? 500 : 400,
        cursor: "pointer", textAlign: "left",
        transition: "background 0.12s, color 0.12s, border-color 0.12s",
        fontFamily: "var(--font-dm-sans, sans-serif)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Profile section ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "online",  label: "Online",  dot: "var(--accent)" },
  { value: "away",    label: "Away",    dot: "#F5C542" },
  { value: "offline", label: "Offline", dot: "var(--text3)" },
] as const;

function AvatarUpload({
  userId, username, avatarUrl,
  onUploadComplete,
}: {
  userId: string;
  username: string;
  avatarUrl: string | null;
  onUploadComplete: (url: string) => void;
}) {
  const [hovered,  setHovered]  = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setError(null);
    setProgress(20);
    const supabase = createClient();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    setProgress(40);
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setError("Upload failed");
      setProgress(null);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setProgress(80);
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    setProgress(100);
    onUploadComplete(publicUrl);
    setTimeout(() => setProgress(null), 600);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
      {/* Avatar circle */}
      <div
        style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => inputRef.current?.click()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl ?? getDefaultAvatar(userId, username)}
          alt="Avatar"
          style={{
            width: 80, height: 80, borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid var(--border-hi)",
          }}
        />

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
        }}>
          <Camera size={20} style={{ color: "#fff" }} />
        </div>
      </div>

      {/* Right side: info + progress */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--text1)", fontWeight: 500, marginBottom: 4 }}>
          Profile photo
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: progress !== null ? 10 : 0 }}>
          JPG, PNG or GIF · Max 5 MB
        </div>

        {progress !== null && (
          <div style={{
            height: 3, borderRadius: 2, background: "var(--bg-active)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: "var(--accent)",
              width: `${progress}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        )}

        {error && (
          <div style={{ fontSize: 11.5, color: "#FF7B7B", marginTop: 4 }}>{error}</div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </div>
  );
}

function ProfileSection({ user, profile }: { user: { id: string; email: string }; profile: ProfileData | null }) {
  const derivedInitials = (n: string) =>
    n.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  const [name,      setName]      = useState(profile?.name      ?? "");
  const [username,  setUsername]  = useState(profile?.username  ?? "");
  const [status,    setStatus]    = useState(profile?.status    ?? "online");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [saving,    setSaving]    = useState(false);
  const [feedback,  setFeedback]  = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setUsername(profile.username ?? "");
    setStatus(profile.status ?? "online");
    setAvatarUrl(profile.avatar_url);
  }, [profile]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const initials = derivedInitials(name);
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim(), username: username.trim(), status, initials })
        .eq("id", user.id);
      if (error) throw error;
      setFeedback({ type: "success", message: "Profile updated." });
    } catch {
      setFeedback({ type: "error", message: "Failed to save changes." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div>
      <SectionHeading title="Profile" subtitle="Manage how you appear to others" />

      <AvatarUpload
        userId={user.id}
        username={username || name || user.email.split("@")[0] || "user"}
        avatarUrl={avatarUrl}
        onUploadComplete={setAvatarUrl}
      />

      <Divider />

      {/* Full name */}
      <div style={{ marginBottom: 18 }}>
        <Label>Full name</Label>
        <FieldInput value={name} onChange={setName} placeholder="Your name" />
      </div>

      {/* Username */}
      <div style={{ marginBottom: 18, position: "relative" }}>
        <Label>Username</Label>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 13, color: "var(--text3)", pointerEvents: "none",
          }}>
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="yourusername"
            style={{
              width: "100%", height: 40, boxSizing: "border-box",
              padding: "0 12px 0 26px",
              background: "var(--bg-active)",
              border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text1)",
              fontSize: 13, outline: "none",
              fontFamily: "var(--font-dm-sans, sans-serif)",
              transition: "border-color 0.15s",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--border-hi)"; }}
            onBlur={e  => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div style={{ marginBottom: 18 }}>
        <Label>Email address</Label>
        <FieldInput value={user.email} disabled placeholder="" />
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 5 }}>
          Email cannot be changed here. Contact support to update it.
        </div>
      </div>

      <Divider />

      {/* Status */}
      <div style={{ marginBottom: 24 }}>
        <Label>Status</Label>
        <div style={{ display: "flex", gap: 8 }}>
          {STATUS_OPTIONS.map(opt => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 8,
                  background: active ? "var(--accent-dim)" : "var(--bg-active)",
                  border: `1px solid ${active ? "rgba(0,212,168,0.3)" : "var(--border)"}`,
                  color: active ? "var(--text1)" : "var(--text2)",
                  fontSize: 13, cursor: "pointer",
                  transition: "background 0.12s, border-color 0.12s",
                  fontFamily: "var(--font-dm-sans, sans-serif)",
                }}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: opt.dot, flexShrink: 0,
                }} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <SaveButton loading={saving} onClick={handleSave} />
      {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}
    </div>
  );
}

// ── Security section ──────────────────────────────────────────────────────────

function PasswordField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 18 }}>
      <Label>{label}</Label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", height: 40, boxSizing: "border-box",
            padding: "0 40px 0 12px",
            background: "var(--bg-active)",
            border: focused ? "1px solid var(--border-hi)" : "1px solid var(--border)",
            borderRadius: 8, color: "var(--text1)",
            fontSize: 13, outline: "none",
            fontFamily: "var(--font-dm-sans, sans-serif)",
            transition: "border-color 0.15s",
          }}
        />
        <button
          onClick={() => setShow(s => !s)}
          type="button"
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text3)", padding: 2, display: "flex",
          }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving,          setSaving]          = useState(false);
  const [feedback,        setFeedback]        = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChangePassword = async () => {
    if (saving) return;
    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setFeedback({ type: "success", message: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div>
      <SectionHeading title="Security" subtitle="Manage your password and account security" />

      <div style={{
        padding: "16px 20px", borderRadius: 10,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text1)", marginBottom: 2 }}>
          Change password
        </div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>
          Choose a strong password of at least 6 characters.
        </div>

        <PasswordField
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="New password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat new password"
        />

        <SaveButton loading={saving} onClick={handleChangePassword} />
        {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}
      </div>
    </div>
  );
}

// ── Appearance section ────────────────────────────────────────────────────────

function AppearanceSection() {
  return (
    <div>
      <SectionHeading title="Appearance" subtitle="Customise the look and feel of nxtlk" />
      <div style={{
        padding: "40px 24px",
        borderRadius: 10,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", gap: 8,
      }}>
        <Palette size={32} style={{ color: "var(--text3)", marginBottom: 4 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>
          Theme customisation coming soon
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text3)", maxWidth: 300, lineHeight: 1.6 }}>
          Dark mode, accent colours, font size and compact mode will be configurable here.
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function SettingsClient({ user, profile }: SettingsClientProps) {
  const [section, setSection] = useState<Section>("profile");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      <SettingsNav active={section} onSelect={setSection} />

      <div style={{
        flex: 1, overflowY: "auto",
        padding: "40px 48px",
        maxWidth: 640,
      }}>
        {section === "profile"    && <ProfileSection    user={user} profile={profile} />}
        {section === "security"   && <SecuritySection />}
        {section === "appearance" && <AppearanceSection />}
      </div>
    </div>
  );
}
