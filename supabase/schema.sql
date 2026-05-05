-- ─────────────────────────────────────────────────────────────────
-- nxtlk database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────────

-- ── profiles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  initials    TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  status      TEXT        NOT NULL DEFAULT 'offline'
                          CHECK (status IN ('online', 'away', 'offline')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── conversations ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── conversation_members ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id  UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- ── messages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  content          TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at          TIMESTAMPTZ
);

-- ── indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversation_members_user        ON public.conversation_members (user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation ON public.conversation_members (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation             ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender                   ON public.messages (sender_id);

-- ── trigger: auto-create profile on signup ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name     TEXT;
  _initials TEXT;
BEGIN
  _name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );
  _initials := UPPER(LEFT(REGEXP_REPLACE(_name, '\s+', ''), 1))
    || UPPER(SUBSTRING(REVERSE(REGEXP_REPLACE(_name, '^[^ ]+ ', '')), 1, 1));

  INSERT INTO public.profiles (id, name, initials)
  VALUES (NEW.id, _name, _initials)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── updated_at trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at      ON public.profiles;
DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Authenticated users can view any profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- conversations
CREATE POLICY "Members can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- conversation_members
CREATE POLICY "Members can view conversation members"
  ON public.conversation_members FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can join conversations"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- messages
CREATE POLICY "Members can read messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT conversation_id FROM public.conversation_members
      WHERE user_id = auth.uid()
    )
  );
