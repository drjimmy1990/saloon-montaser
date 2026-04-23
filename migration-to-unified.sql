-- ====================================================================
-- SALOON DASHBOARD MIGRATION SCRIPT
-- Transitions the current database to the Unified Client + Message Schema
-- Safely applies updates without deleting existing basic data.
-- ====================================================================

-- 1. CLEANUP PREVIOUS ATTEMPTS
-- This will wipe the broken tables you were struggling with, 
-- as well as the old JSONB Conversation table.
DROP TRIGGER IF EXISTS messages_summary_trigger ON public."Message";
DROP FUNCTION IF EXISTS public.update_contact_summary_on_message();
DROP FUNCTION IF EXISTS public.update_client_summary_on_message();

DROP TABLE IF EXISTS "public"."Message" CASCADE;
DROP TABLE IF EXISTS "public"."Contact" CASCADE;
DROP TABLE IF EXISTS "public"."Conversation" CASCADE;

-- 2. UPGRADE EXISTING CLIENT TABLE
-- Adds the new chat-related columns to your existing CRM Client table.
ALTER TABLE "public"."Client"
    ADD COLUMN IF NOT EXISTS "channel_id" UUID REFERENCES "public"."Channel"("id") ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS "platform" TEXT DEFAULT 'whatsapp',
    ADD COLUMN IF NOT EXISTS "platform_user_id" TEXT,
    ADD COLUMN IF NOT EXISTS "avatar_url" TEXT,
    ADD COLUMN IF NOT EXISTS "last_interaction_at" TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS "last_message_preview" TEXT,
    ADD COLUMN IF NOT EXISTS "unread_count" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';

-- Add unique constraint for platform routing, wrapping it to prevent "already exists" errors
DO $$ 
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'unique_client_per_channel'
  ) THEN
      ALTER TABLE "public"."Client" ADD CONSTRAINT unique_client_per_channel UNIQUE ("channel_id", "platform_user_id");
  END IF;
END $$;

-- 3. RECREATE MESSAGE TABLE
-- Properly referencing the newly unified Client table.
CREATE TABLE "public"."Message" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "channel_id" UUID REFERENCES "public"."Channel"("id") ON DELETE CASCADE,
    "client_id" UUID NOT NULL REFERENCES "public"."Client"("id") ON DELETE CASCADE,
    "message_platform_id" TEXT,
    "sender_type" TEXT NOT NULL CHECK ("sender_type" IN ('user', 'agent', 'bot', 'system')),
    "content_type" TEXT NOT NULL DEFAULT 'text',
    "text_content" TEXT,
    "attachment_url" TEXT,
    "is_read_by_agent" BOOLEAN NOT NULL DEFAULT FALSE,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "platform_timestamp" TIMESTAMPTZ
);

-- 4. INSTALL UNIFIED TRIGGER
-- Calculates unread counts directly onto the Client row.
CREATE OR REPLACE FUNCTION public.update_client_summary_on_message()
RETURNS TRIGGER AS $$
DECLARE
    v_client_id UUID;
BEGIN
    v_client_id := COALESCE(NEW.client_id, OLD.client_id);

    UPDATE public."Client"
    SET 
        "last_interaction_at" = (SELECT MAX(m.sent_at) FROM public."Message" m WHERE m.client_id = v_client_id),
        "last_message_preview" = (
            SELECT CASE 
                WHEN sub.content_type = 'text' THEN LEFT(sub.text_content, 70)
                ELSE '[' || sub.content_type || ']'
            END
            FROM public."Message" sub WHERE sub.client_id = v_client_id ORDER BY sub.sent_at DESC LIMIT 1
        ),
        "unread_count" = (
            SELECT COUNT(*) FROM public."Message" m
            WHERE m.client_id = v_client_id AND m.sender_type = 'user' AND m.is_read_by_agent = FALSE
        )
    WHERE id = v_client_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER messages_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."Message"
FOR EACH ROW EXECUTE FUNCTION public.update_client_summary_on_message();
