"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { PropsWithChildren, SVGProps } from "react";

/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
html { scroll-behavior: smooth; }

:root {
  --bg:        #06080C;
  --surface:   #0B0E14;
  --surface2:  #0F1318;
  --hover:     #141820;
  --active:    #1A1F2C;
  --border:    rgba(255,255,255,0.07);
  --border-hi: rgba(255,255,255,0.13);
  --accent:    #00D4A8;
  --accent2:   #5B8EFF;
  --accent-d:  rgba(0,212,168,0.10);
  --accent-g:  rgba(0,212,168,0.20);
  --text1:     #EEF0F5;
  --text2:     #8891A8;
  --text3:     #3E4456;
  --yellow:    #F5C542;
  --r-sm: 6px; --r-md: 10px; --r-lg: 16px; --r-xl: 24px;
}

body { overflow-x: hidden; }

.lp .container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }
.lp .accent   { color: var(--accent); }

/* badge */
.lp .badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 20px;
  border: 1px solid var(--border-hi); background: var(--surface);
  font-size: 12px; font-weight: 500; color: var(--text2); letter-spacing: 0.3px;
}
.lp .badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); animation: lp-pulse-dot 2s ease-in-out infinite;
}
@keyframes lp-pulse-dot {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.8); }
}

/* ─── NAV ───────────────────────────────────────────────────────── */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid var(--border);
  transition: background 0.3s;
  backdrop-filter: blur(16px);
}
.lp-nav .nav-logo {
  display: flex; align-items: center; gap: 9px;
  cursor: pointer; text-decoration: none;
}
.lp-nav .nav-mark {
  width: 32px; height: 32px; border-radius: 9px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-bricolage, 'Bricolage Grotesque', sans-serif);
  font-size: 12px; font-weight: 800; color: #06080C;
}
.lp-nav .nav-name {
  font-family: var(--font-bricolage, 'Bricolage Grotesque', sans-serif);
  font-size: 17px; font-weight: 700; letter-spacing: -0.5px; color: var(--text1);
}
.lp-nav .nav-links { display: flex; align-items: center; gap: 6px; }
.lp-nav .nav-link {
  padding: 7px 14px; border-radius: var(--r-md);
  font-size: 13.5px; font-weight: 500; color: var(--text2);
  text-decoration: none; cursor: pointer;
  transition: all 0.13s; border: 1px solid transparent; background: transparent;
}
.lp-nav .nav-link:hover { color: var(--text1); background: var(--hover); }
.lp-nav .nav-cta {
  padding: 8px 18px; border-radius: var(--r-md);
  font-size: 13.5px; font-weight: 500;
  background: var(--accent); color: #06080C;
  border: none; cursor: pointer;
  transition: opacity 0.15s, box-shadow 0.2s;
  text-decoration: none; display: flex; align-items: center;
}
.lp-nav .nav-cta:hover { opacity: 0.9; box-shadow: 0 4px 20px var(--accent-g); }

/* ─── HERO ──────────────────────────────────────────────────────── */
.lp .hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; position: relative; overflow: hidden;
  padding: 120px 32px 80px;
}
.lp .orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
.lp .orb-1 { width:500px;height:500px;background:var(--accent);top:-120px;left:-100px;opacity:0.09;animation:lp-orb1 16s ease-in-out infinite; }
.lp .orb-2 { width:380px;height:380px;background:var(--accent2);bottom:-80px;right:-60px;opacity:0.10;animation:lp-orb2 20s ease-in-out infinite; }
.lp .orb-3 { width:260px;height:260px;background:var(--accent);top:50%;left:55%;opacity:0.05;animation:lp-orb3 24s ease-in-out infinite; }
@keyframes lp-orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,80px)} }
@keyframes lp-orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-70px,-50px)} }
@keyframes lp-orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,60px)} }
.lp .hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
  background-size: 52px 52px; pointer-events: none;
}
.lp .hero-grid::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, var(--bg) 100%);
}
.lp .hero-content { position: relative; z-index: 2; max-width: 780px; }
.lp .hero-badge { margin-bottom: 28px; }
.lp .hero-title {
  font-family: var(--font-bricolage, 'Bricolage Grotesque', sans-serif);
  font-size: clamp(52px, 8vw, 88px);
  font-weight: 800; letter-spacing: -3px; line-height: 0.95;
  color: var(--text1); margin-bottom: 24px;
}
.lp .hero-title .line2 {
  display: block;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.lp .hero-sub {
  font-size: 18px; font-weight: 300; color: var(--text2);
  line-height: 1.65; max-width: 520px; margin: 0 auto 40px; letter-spacing: 0.1px;
}
.lp .hero-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }

/* buttons */
.lp .btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: var(--r-lg);
  font-size: 15px; font-weight: 500;
  background: var(--accent); color: #06080C; border: none; cursor: pointer;
  transition: opacity 0.15s, transform 0.12s, box-shadow 0.2s; text-decoration: none;
}
.lp .btn-primary:hover { opacity: 0.9; box-shadow: 0 8px 32px var(--accent-g); transform: translateY(-1px); }
.lp .btn-primary:active { transform: scale(0.98); }
.lp .btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 24px; border-radius: var(--r-lg);
  font-size: 15px; font-weight: 500;
  background: transparent; color: var(--text2);
  border: 1px solid var(--border-hi); cursor: pointer;
  transition: all 0.15s; text-decoration: none;
}
.lp .btn-secondary:hover { background: var(--hover); color: var(--text1); border-color: rgba(255,255,255,0.2); }

/* ─── MOCKUP ────────────────────────────────────────────────────── */
.lp .hero-mockup { position: relative; z-index: 2; margin-top: 72px; width: 100%; max-width: 820px; }
.lp .mockup-glow {
  position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 200px; background: var(--accent);
  filter: blur(80px); opacity: 0.06; pointer-events: none;
}
.lp .mockup-frame {
  background: var(--surface); border: 1px solid var(--border-hi);
  border-radius: var(--r-xl); overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0,212,168,0.08), 0 32px 80px rgba(0,0,0,0.6), 0 0 120px rgba(0,212,168,0.04);
  animation: lp-float 6s ease-in-out infinite;
}
@keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.lp .mockup-bar {
  height: 38px; padding: 0 16px;
  display: flex; align-items: center; gap: 7px;
  background: var(--bg); border-bottom: 1px solid var(--border);
}
.lp .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
.lp .mockup-body { display: flex; height: 300px; }
.lp .mock-sidebar { width: 200px; border-right: 1px solid var(--border); padding: 10px 8px; display: flex; flex-direction: column; gap: 3px; }
.lp .mock-conv-row { display: flex; align-items: center; gap: 8px; padding: 7px; border-radius: 8px; cursor: pointer; transition: background 0.12s; }
.lp .mock-conv-row:hover { background: var(--hover); }
.lp .mock-conv-row.active { background: var(--accent-d); }
.lp .mock-av { width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600; }
.lp .mock-ci { flex: 1; min-width: 0; }
.lp .mock-cn { font-size:11px;font-weight:500;color:var(--text1);margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.lp .mock-cp { font-size:10px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.lp .mock-ub { min-width:15px;height:15px;border-radius:8px;background:var(--accent);color:#06080C;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px; }
.lp .mock-chat { flex: 1; display: flex; flex-direction: column; }
.lp .mock-chat-hdr { height:44px;padding:0 14px;display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--border); }
.lp .mock-chat-hdr-av { width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600; }
.lp .mock-hdr-name { font-size:12px;font-weight:500; }
.lp .mock-hdr-status { font-size:10px;color:var(--accent);margin-left:4px; }
.lp .mock-hdr-actions { margin-left:auto;display:flex;gap:5px; }
.lp .mock-hdr-btn { width:22px;height:22px;border-radius:5px;background:var(--hover);border:1px solid var(--border);display:flex;align-items:center;justify-content:center; }
.lp .mock-msgs { flex:1;padding:12px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px; }
.lp .mock-bubble { max-width:65%;padding:7px 10px;font-size:11px;line-height:1.45;border-radius:12px; }
.lp .mock-bubble.them { background:var(--surface2);border:1px solid var(--border);color:var(--text1);border-bottom-left-radius:3px; }
.lp .mock-bubble.me { background:var(--accent);color:#06080C;font-weight:500;border-bottom-right-radius:3px;margin-left:auto; }
.lp .mock-bubble.typing { display:flex;align-items:center;gap:3px;padding:10px 12px; }
.lp .t-dot { width:4px;height:4px;border-radius:50%;background:var(--text2);animation:lp-tdot 1.1s ease-in-out infinite; }
.lp .t-dot:nth-child(2) { animation-delay:0.18s; }
.lp .t-dot:nth-child(3) { animation-delay:0.36s; }
@keyframes lp-tdot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-4px);opacity:1} }
.lp .mock-input { height:42px;margin:0 10px 10px;border-radius:20px;background:var(--active);border:1px solid var(--border-hi);display:flex;align-items:center;padding:0 12px;gap:8px; }
.lp .mock-input-inner { flex:1;font-size:11px;color:var(--text3); }
.lp .mock-send { width:24px;height:24px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center; }

/* ─── STATS ─────────────────────────────────────────────────────── */
.lp .stats-bar { padding:28px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--surface); }
.lp .stats-inner { max-width:1100px;margin:0 auto;padding:0 32px;display:flex;align-items:center;justify-content:center;gap:0; }
.lp .stat { text-align:center;flex:1; }
.lp .stat-num { font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:32px;font-weight:800;letter-spacing:-1px;color:var(--text1);margin-bottom:4px; }
.lp .stat-num span { color:var(--accent); }
.lp .stat-label { font-size:13px;color:var(--text3);font-weight:400; }
.lp .stat-sep { width:1px;height:40px;background:var(--border);flex-shrink:0;margin:0 20px; }

/* ─── FEATURES ──────────────────────────────────────────────────── */
.lp .features { padding: 120px 0; }
.lp .section-eyebrow {
  font-family: var(--font-jetbrains-mono, 'JetBrains Mono', monospace);
  font-size:11px;font-weight:500;color:var(--accent);letter-spacing:2px;text-transform:uppercase;
  margin-bottom:16px;display:flex;align-items:center;gap:10px;
}
.lp .section-eyebrow::before { content: '//'; opacity: 0.5; }
.lp .section-title {
  font-family: var(--font-bricolage, 'Bricolage Grotesque', sans-serif);
  font-size:clamp(32px,4vw,48px);font-weight:800;letter-spacing:-1.5px;color:var(--text1);margin-bottom:16px;
}
.lp .section-sub { font-size:17px;color:var(--text2);font-weight:300;line-height:1.6;max-width:500px; }
.lp .features-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:64px; }
.lp .feat-card {
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);
  padding:32px 28px;position:relative;overflow:hidden;
  transition:border-color 0.2s,transform 0.2s;cursor:default;
}
.lp .feat-card:hover { border-color:var(--border-hi);transform:translateY(-3px); }
.lp .feat-card::before {
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);
  opacity:0;transition:opacity 0.3s;
}
.lp .feat-card:hover::before { opacity:1; }
.lp .feat-icon { width:48px;height:48px;border-radius:var(--r-lg);background:var(--accent-d);border:1px solid var(--accent-g);display:flex;align-items:center;justify-content:center;margin-bottom:22px;font-size:22px; }
.lp .feat-title { font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:20px;font-weight:700;letter-spacing:-0.4px;margin-bottom:10px;color:var(--text1); }
.lp .feat-desc { font-size:14px;color:var(--text2);line-height:1.65;font-weight:300; }
.lp .feat-tag { display:inline-flex;align-items:center;margin-top:20px;font-family:var(--font-jetbrains-mono,'JetBrains Mono',monospace);font-size:10.5px;color:var(--accent);background:var(--accent-d);padding:3px 9px;border-radius:20px;border:1px solid var(--accent-g); }
.lp .tech-row { display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:64px; }
.lp .tech-label { font-size:11px;color:var(--text3);letter-spacing:0.5px;text-transform:uppercase;font-weight:500;margin-right:4px; }
.lp .tech-chip { padding:5px 12px;border-radius:20px;background:var(--surface);border:1px solid var(--border);font-size:12px;font-weight:500;color:var(--text2);font-family:var(--font-jetbrains-mono,'JetBrains Mono',monospace); }

/* ─── ABOUT ─────────────────────────────────────────────────────── */
.lp .about { padding:120px 0;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border); }
.lp .about-inner { display:grid;grid-template-columns:1fr 1.4fr;gap:80px;align-items:center; }
.lp .about-left { display:flex;flex-direction:column;gap:28px; }
.lp .maker-card { display:flex;align-items:center;gap:16px;padding:20px;background:var(--bg);border:1px solid var(--border-hi);border-radius:var(--r-xl); }
.lp .maker-avatar { width:64px;height:64px;border-radius:50%;flex-shrink:0;background:var(--accent-d);border:2px solid var(--accent-g);display:flex;align-items:center;justify-content:center;font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:22px;font-weight:800;color:var(--accent); }
.lp .maker-info { flex:1; }
.lp .maker-name { font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:20px;font-weight:800;letter-spacing:-0.5px;margin-bottom:3px; }
.lp .maker-role { font-size:13px;color:var(--text2);margin-bottom:8px;line-height:1.5; }
.lp .maker-links { display:flex;gap:8px; }
.lp .maker-link { padding:4px 10px;border-radius:var(--r-md);font-size:11.5px;font-weight:500;background:var(--surface);border:1px solid var(--border-hi);color:var(--text2);text-decoration:none;display:flex;align-items:center;gap:5px;transition:all 0.13s; }
.lp .maker-link:hover { color:var(--text1);border-color:rgba(255,255,255,0.22);background:var(--hover); }
.lp .about-bio { font-size:15px;color:var(--text2);line-height:1.75;font-weight:300; }
.lp .about-bio strong { color:var(--text1);font-weight:500; }
.lp .about-bio .hl { color:var(--accent);font-weight:500; }
.lp .skills-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px; }
.lp .skill-item { display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:var(--r-md);background:var(--bg);border:1px solid var(--border);font-size:12.5px;color:var(--text2); }
.lp .skill-dot { width:6px;height:6px;border-radius:50%;flex-shrink:0; }
.lp .about-right { display:flex;flex-direction:column;gap:24px; }
.lp .about-right .section-title { font-size:36px; }
.lp .about-cta-row { display:flex;gap:10px;flex-wrap:wrap;margin-top:8px; }

/* ─── CTA ───────────────────────────────────────────────────────── */
.lp .cta-section { padding:120px 32px;text-align:center;position:relative;overflow:hidden; }
.lp .cta-orb { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:300px;background:var(--accent);filter:blur(120px);opacity:0.06;pointer-events:none; }
.lp .cta-title { font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:clamp(36px,5vw,58px);font-weight:800;letter-spacing:-2px;color:var(--text1);margin-bottom:18px;position:relative;z-index:2; }
.lp .cta-sub { font-size:17px;color:var(--text2);margin-bottom:40px;font-weight:300;position:relative;z-index:2; }
.lp .cta-actions { display:flex;justify-content:center;gap:12px;position:relative;z-index:2;flex-wrap:wrap; }

/* ─── FOOTER ────────────────────────────────────────────────────── */
.lp-footer { padding:28px 40px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface); }
.lp-footer .footer-left { display:flex;align-items:center;gap:10px; }
.lp-footer .footer-brand { display:flex;align-items:center;gap:7px; }
.lp-footer .footer-mark { width:22px;height:22px;border-radius:6px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:8px;font-weight:800;color:#06080C; }
.lp-footer .footer-name { font-family:var(--font-bricolage,'Bricolage Grotesque',sans-serif);font-size:13px;font-weight:700;letter-spacing:-0.3px; }
.lp-footer .footer-sep  { color:var(--text3);font-size:12px; }
.lp-footer .footer-copy { font-size:12px;color:var(--text3); }
.lp-footer .footer-right { display:flex;align-items:center;gap:6px; }
.lp-footer .footer-link { font-size:12px;color:var(--text3);text-decoration:none;padding:4px 8px;border-radius:5px;transition:color 0.12s; }
.lp-footer .footer-link:hover { color:var(--text2); }

/* ─── ANIMATIONS ────────────────────────────────────────────────── */
.lp .fade-in    { animation: lp-fadeIn    0.7s ease both; }
.lp .fade-in-up { animation: lp-fadeInUp  0.6s ease both; }
@keyframes lp-fadeIn   { from{opacity:0}           to{opacity:1} }
@keyframes lp-fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
.lp .d1{animation-delay:0.1s} .lp .d2{animation-delay:0.2s}
.lp .d3{animation-delay:0.3s} .lp .d4{animation-delay:0.4s}
.lp .d5{animation-delay:0.5s} .lp .d6{animation-delay:0.6s}
`;

/* ─── Icon primitives ──────────────────────────────────────────── */
type IconProps = PropsWithChildren<SVGProps<SVGSVGElement> & { size?: number }>;

function Ico({ children, size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

function ArrowRight() {
  return <Ico><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ico>;
}
function GithubIco() {
  return (
    <Ico size={14}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </Ico>
  );
}
function LinkedInIco() {
  return (
    <Ico size={14}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </Ico>
  );
}
function ExternalIco() {
  return (
    <Ico size={12}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </Ico>
  );
}
function SendIco() {
  return (
    <Ico size={11}>
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </Ico>
  );
}

/* ─── Data ─────────────────────────────────────────────────────── */
interface MockConv { initials: string; bg: string; color: string; name: string; preview: string; unread: number; }
interface Feature  { icon: string; title: string; tag: string; desc: string; }
interface Skill    { dot: string; label: string; }

const MOCK_CONVS: MockConv[] = [
  { initials:"AC", bg:"rgba(91,142,255,0.2)",  color:"#6495ED", name:"Amir Cohen",  preview:"push the PR!",    unread:2 },
  { initials:"DT", bg:"rgba(167,139,250,0.2)", color:"#A78BFA", name:"Design Team", preview:"new mockups 🔥",  unread:0 },
  { initials:"NL", bg:"rgba(0,212,168,0.18)",  color:"#00D4A8", name:"Noa Levy",    preview:"on it ✓",          unread:0 },
];

const FEATURES: Feature[] = [
  { icon:"💬", title:"Instant messaging", tag:"Supabase Realtime", desc:"Sub-100ms message delivery via Supabase Realtime channels. Text, emoji reactions, read receipts, typing indicators — the full experience." },
  { icon:"📞", title:"Voice calls",       tag:"WebRTC P2P",        desc:"Peer-to-peer audio via WebRTC. Calls go directly between users — no relay servers, no latency penalty. Google STUN, Metered TURN fallback." },
  { icon:"🎥", title:"Video chat",        tag:"LiveKit SFU",       desc:"HD video calls powered by LiveKit for group sessions. Stable, adaptive bitrate, works on any modern browser with zero plugins." },
];

const SKILLS: Skill[] = [
  { dot:"#6495ED", label:"React / Next.js"        },
  { dot:"#00D4A8", label:"Node.js / TypeScript"   },
  { dot:"#A78BFA", label:"Supabase / PostgreSQL"  },
  { dot:"#FB923C", label:"CrowdStrike / SIEM"     },
  { dot:"#F472B6", label:"Palo Alto / IronPort"   },
  { dot:"#F5C542", label:"DevSecOps path"         },
];

const STATS: ([string, string] | null)[] = [
  ["<80","ms latency"], null,
  ["100%","free & open"], null,
  ["WebRTC","P2P calls"], null,
  ["Supabase","realtime"],
];

const TECH = ["Next.js 16","TypeScript","Tailwind CSS","Supabase","WebRTC","LiveKit","Vercel"];

/* ─── MockChat ─────────────────────────────────────────────────── */
function MockChat() {
  return (
    <div className="mockup-frame">
      <div className="mockup-bar">
        <div className="mock-dot" style={{ background:"#FF5F56" }}/>
        <div className="mock-dot" style={{ background:"#FFBD2E" }}/>
        <div className="mock-dot" style={{ background:"#27C93F" }}/>
        <div style={{ marginLeft:10, fontFamily:"var(--font-jetbrains-mono,'JetBrains Mono',monospace)", fontSize:11, color:"var(--text3)" }}>
          nxtlk — chat
        </div>
      </div>
      <div className="mockup-body">
        {/* sidebar */}
        <div className="mock-sidebar">
          <div style={{ padding:"4px 7px 8px", fontSize:10, fontWeight:600, color:"var(--text3)", letterSpacing:"0.7px", textTransform:"uppercase" }}>Recent</div>
          {MOCK_CONVS.map((c, i) => (
            <div key={i} className={`mock-conv-row${i === 0 ? " active" : ""}`}>
              <div className="mock-av" style={{ background:c.bg, color:c.color }}>{c.initials}</div>
              <div className="mock-ci">
                <div className="mock-cn">{c.name}</div>
                <div className="mock-cp">{c.preview}</div>
              </div>
              {c.unread > 0 && <div className="mock-ub">{c.unread}</div>}
            </div>
          ))}
        </div>
        {/* chat */}
        <div className="mock-chat">
          <div className="mock-chat-hdr">
            <div className="mock-chat-hdr-av" style={{ background:"rgba(91,142,255,0.2)", color:"#6495ED" }}>AC</div>
            <div>
              <span className="mock-hdr-name">Amir Cohen</span>
              <span className="mock-hdr-status">● online</span>
            </div>
            <div className="mock-hdr-actions">
              {[0,1,2].map(i => (
                <div key={i} className="mock-hdr-btn">
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--border-hi)" }}/>
                </div>
              ))}
            </div>
          </div>
          <div className="mock-msgs">
            <div className="mock-bubble them">hey, merged the auth PR 👌</div>
            <div className="mock-bubble me">let&apos;s ship it 🚀</div>
            <div className="mock-bubble them">staging looks clean</div>
            <div className="mock-bubble typing">
              <div className="t-dot"/><div className="t-dot"/><div className="t-dot"/>
            </div>
          </div>
          <div className="mock-input">
            <div className="mock-input-inner">Message Amir...</div>
            <div className="mock-send"><SendIco /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LandingPage ──────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav
        className="lp-nav"
        style={{ background: scrolled ? "rgba(6,8,12,0.95)" : "rgba(6,8,12,0.6)" }}
      >
        <Link href="/" className="nav-logo">
          <div className="nav-mark">nxt</div>
          <span className="nav-name">nxtlk</span>
        </Link>
        <div className="nav-links">
          <a className="nav-link" href="#features">Features</a>
          <a className="nav-link" href="#about">About</a>
          <a className="nav-link" href="https://github.com/BennyGingi" target="_blank" rel="noreferrer">GitHub</a>
          <Link href="/login" className="nav-cta">Get started</Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <div className="lp">
        <section className="hero" id="hero">
          <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
          <div className="hero-grid"/>

          <div className="hero-content">
            <div className="hero-badge fade-in">
              <span className="badge">
                <span className="badge-dot"/>Open source · Built by Benny Gingi
              </span>
            </div>
            <h1 className="hero-title fade-in-up d1">
              Real-time chat<br/>
              <span className="line2">built different.</span>
            </h1>
            <p className="hero-sub fade-in-up d2">
              Instant messaging, voice calls, and video — all running on WebRTC and Supabase Realtime.
              Fast, free, and open source.
            </p>
            <div className="hero-actions fade-in-up d3">
              <Link href="/login" className="btn-primary">
                Start chatting <ArrowRight />
              </Link>
              <a className="btn-secondary" href="https://github.com/BennyGingi/nxtlk" target="_blank" rel="noreferrer">
                <GithubIco /> View source
              </a>
            </div>
          </div>

          <div className="hero-mockup fade-in-up d4">
            <div className="mockup-glow"/>
            <MockChat />
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────── */}
        <div className="stats-bar">
          <div className="stats-inner">
            {STATS.map((s, i) =>
              s === null
                ? <div key={i} className="stat-sep"/>
                : (
                  <div key={i} className="stat">
                    <div className="stat-num">
                      {s[0].includes("<") ? <span>{s[0]}</span> : s[0]}
                    </div>
                    <div className="stat-label">{s[1]}</div>
                  </div>
                )
            )}
          </div>
        </div>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section className="features" id="features">
          <div className="container">
            <div className="section-eyebrow">features</div>
            <h2 className="section-title">
              Everything you need<br/>to <span className="accent">communicate.</span>
            </h2>
            <p className="section-sub">No subscriptions, no servers to manage. Just fast, encrypted, real-time communication.</p>

            <div className="features-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feat-card">
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <p className="feat-desc">{f.desc}</p>
                  <div className="feat-tag">{f.tag}</div>
                </div>
              ))}
            </div>

            <div className="tech-row">
              <span className="tech-label">Built with</span>
              {TECH.map(t => <span key={t} className="tech-chip">{t}</span>)}
            </div>
          </div>
        </section>

        {/* ── ABOUT ────────────────────────────────────────────── */}
        <section className="about" id="about">
          <div className="container">
            <div className="about-inner">
              <div className="about-left">
                <div className="maker-card">
                  <div className="maker-avatar">BG</div>
                  <div className="maker-info">
                    <div className="maker-name">Benny Gingi</div>
                    <div className="maker-role">
                      SOC Analyst @ Mobileye (Intel)<br/>
                      Full-Stack Developer · Tel Aviv
                    </div>
                    <div className="maker-links">
                      <a className="maker-link" href="https://github.com/BennyGingi" target="_blank" rel="noreferrer">
                        <GithubIco /> GitHub
                      </a>
                      <a className="maker-link" href="https://linkedin.com/in/benny-gingihasvili" target="_blank" rel="noreferrer">
                        <LinkedInIco /> LinkedIn
                      </a>
                    </div>
                  </div>
                </div>

                <div className="skills-grid">
                  {SKILLS.map(s => (
                    <div key={s.label} className="skill-item">
                      <div className="skill-dot" style={{ background: s.dot }}/>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="about-right">
                <div className="section-eyebrow">the maker</div>
                <h2 className="section-title">
                  Designed and<br/>built by <span className="accent">one person.</span>
                </h2>
                <p className="about-bio">
                  I&apos;m a <strong>full-stack developer</strong> and <strong>SOC Analyst</strong> at{" "}
                  <span className="hl">Mobileye (Intel)</span> in Jerusalem,
                  with a rare hybrid background combining real security operations with active product development.
                  <br/><br/>
                  nxtlk is a personal project I built to explore{" "}
                  <strong>WebRTC, Supabase Realtime</strong>, and
                  modern chat UX from scratch — every component designed and coded by hand.
                  <br/><br/>
                  I&apos;m currently targeting a transition into{" "}
                  <span className="hl">DevSecOps / Security Engineering</span> and
                  building this kind of work into my portfolio.
                </p>
                <div className="about-cta-row">
                  <a className="btn-secondary" href="https://github.com/BennyGingi" target="_blank" rel="noreferrer">
                    <GithubIco /> See all projects
                  </a>
                  <a className="btn-secondary" href="https://linkedin.com/in/benny-gingihasvili" target="_blank" rel="noreferrer">
                    <LinkedInIco /> Connect <ExternalIco />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="cta-section">
          <div className="cta-orb"/>
          <h2 className="cta-title">Ready to try it?</h2>
          <p className="cta-sub">Free, open source, no account required to explore.</p>
          <div className="cta-actions">
            <Link href="/login" className="btn-primary">
              Open the app <ArrowRight />
            </Link>
            <a className="btn-secondary" href="https://github.com/BennyGingi/nxtlk" target="_blank" rel="noreferrer">
              <GithubIco /> Star on GitHub
            </a>
          </div>
        </section>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="footer-left">
          <div className="footer-brand">
            <div className="footer-mark">n</div>
            <span className="footer-name">nxtlk</span>
          </div>
          <span className="footer-sep">·</span>
          <span className="footer-copy">Built by Benny Gingi · 2025</span>
        </div>
        <div className="footer-right">
          <a className="footer-link" href="https://github.com/BennyGingi" target="_blank" rel="noreferrer">GitHub</a>
          <a className="footer-link" href="https://linkedin.com/in/benny-gingihasvili" target="_blank" rel="noreferrer">LinkedIn</a>
          <Link href="/login" className="footer-link">Login</Link>
        </div>
      </footer>
    </>
  );
}
