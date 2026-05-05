-- Add name column for group conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS name TEXT;

-- Allow conversation creators to add other members (required for NewChatModal flow).
-- The original policy only lets users insert themselves; this extends it so the
-- conversation creator can also insert other participants.
DROP POLICY IF EXISTS "Members can join conversations" ON public.conversation_members;

CREATE POLICY "Members can join conversations"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND created_by = auth.uid()
    )
  );
