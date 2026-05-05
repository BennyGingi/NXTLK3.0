# NXTLK — Claude Code Context

## Project
Real-time encrypted chat app. Next.js 16+ (App Router), TypeScript, Tailwind CSS, Supabase, pnpm.
Live: https://nxtlk.vercel.app

## Commands
- `pnpm dev` — start dev server (port 3000)
- `pnpm build` — production build
- `pnpm lint` — lint check

## Theme (CSS variables in globals.css)
--bg-base: #06080C
--bg-surface: #0B0E14
--bg-hover: #111520
--bg-active: #1A1E28
--border: rgba(255,255,255,0.07)
--border-hi: rgba(255,255,255,0.13)
--accent: #00D4A8
--accent-dim: rgba(0,212,168,0.10)
--text1: #EEF0F5
--text2: #8891A8
--text3: #3E4456

## Fonts
- Headings: Bricolage Grotesque
- Body: DM Sans
- Timestamps/badges: JetBrains Mono

## Folder Structure
src/
  app/
    (auth)/login/page.tsx       ← split-screen login page
    (chat)/chat/page.tsx        ← main chat layout
    layout.tsx
    globals.css
  components/
    sidebar/
      SidebarHeader.tsx         ✅ done — logo + new chat button
      SearchBar.tsx             ✅ done — dark input with icon
      ConversationList.tsx      ✅ done — scrollable list
      ConversationItem.tsx      ✅ done — avatar, online dot, preview, unread badge
      SidebarFooter.tsx         ✅ done — user strip + settings icon (needs logout dropdown)
    chat/
      ChatHeader.tsx            ❌ not started
      MessageList.tsx           ❌ not started
      MessageBubble.tsx         ❌ not started
      ChatInputBar.tsx          ❌ not started
    ui/
      Avatar.tsx
      Badge.tsx
      IconButton.tsx
  lib/
    types.ts                    ← User, Conversation, Message, OnlineStatus interfaces
    supabase/
      client.ts                 ← createClient() for browser
      server.ts                 ← createClient() for server

## Auth
Supabase Auth. Logout: `await supabase.auth.signOut()` then `router.push('/login')`.

## Key Patterns
- Use CSS variables (var(--accent)) NOT hardcoded colors
- lucide-react for all icons
- No external dropdown/modal libraries — build with useState
- All components: TypeScript, named exports
- pnpm dev must pass with zero TS errors after every change

## Next Up (in order)
1. SidebarFooter logout dropdown
2. ChatHeader
3. MessageBubble (incoming dark / outgoing teal variants)
4. MessageList
5. ChatInputBar


## Database Schema (Supabase PostgreSQL)

### Tables
- **profiles** — id (UUID, FK auth.users), name, initials, avatar_url, status (online/away/offline), created_at, updated_at
- **conversations** — id, created_at, updated_at
- **conversation_members** — conversation_id + user_id (composite PK), joined_at
- **messages** — id, conversation_id, sender_id, content, created_at, read_at

### Key behaviors
- New user signup → trigger auto-creates profile (name from metadata or email prefix, initials computed)
- RLS enabled on all tables — users only see their own conversations/messages
- Authenticated users can view any profile (for search/chat)

### Status: schema.sql exists in repo root — apply in Supabase SQL Editor if tables don't exist yet
