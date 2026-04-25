-- ====================================================================
-- SALOON DASHBOARD MASTER SCHEMA (Final Production Version)
-- Optimized for Single-Tenant Environment with Autonomous Chat Logic
-- ====================================================================

-- 1. Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- --------------------------------------------------------
-- Table: Channel (e.g. WhatsApp, Facebook, Instagram configurations)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Channel" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT FALSE,
    "credentials" JSONB DEFAULT '[]'::jsonb,
    "variables" JSONB DEFAULT '{}'::jsonb,
    "imageSets" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Channel";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Channel" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- --------------------------------------------------------
-- Table: Product (Services/Items)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Product" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "nameAr" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',
    "descriptionAr" TEXT DEFAULT '',
    "price" DOUBLE PRECISION DEFAULT 0,
    "image" TEXT DEFAULT '',
    "isAvailable" BOOLEAN DEFAULT TRUE,
    "category" TEXT DEFAULT '',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Product";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Product" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- --------------------------------------------------------
-- Table: Booking
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Booking" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT DEFAULT '',
    "clientAddress" TEXT DEFAULT '',
    "serviceSummary" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "bookingDate" TIMESTAMPTZ DEFAULT NOW(),
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Booking";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Booking" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- --------------------------------------------------------
-- Table: Client (CRM CRM Profiles)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Client" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT DEFAULT '',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Client";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Client" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- --------------------------------------------------------
-- Table: BlacklistEntry
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."BlacklistEntry" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "identifier" TEXT NOT NULL,
    "identifierType" TEXT DEFAULT 'phone',
    "reason" TEXT DEFAULT '',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- Table: DashboardStat
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."DashboardStat" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "activeChannels" INTEGER DEFAULT 0,
    "totalMessages" INTEGER DEFAULT 0,
    "totalBookings" INTEGER DEFAULT 0,
    "conversionRate" DOUBLE PRECISION DEFAULT 0,
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."DashboardStat";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."DashboardStat" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- ====================================================================
-- CHAT MODULE (Contact & Message with Triggers)
-- ====================================================================

-- --------------------------------------------------------
-- Table: Contact
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Contact" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "channel_id" UUID REFERENCES "public"."Channel"("id") ON DELETE CASCADE,
    "platform" TEXT NOT NULL,
    "platform_user_id" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "last_interaction_at" TIMESTAMPTZ DEFAULT NOW(),
    "last_message_preview" TEXT,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT DEFAULT 'active',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_contact_per_channel UNIQUE ("channel_id", "platform_user_id")
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Contact";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Contact" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- --------------------------------------------------------
-- Table: Message
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Message" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "channel_id" UUID REFERENCES "public"."Channel"("id") ON DELETE CASCADE,
    "contact_id" UUID NOT NULL REFERENCES "public"."Contact"("id") ON DELETE CASCADE,
    "message_platform_id" TEXT,
    "sender_type" TEXT NOT NULL CHECK ("sender_type" IN ('user', 'agent', 'bot', 'system')),
    "content_type" TEXT NOT NULL DEFAULT 'text',
    "text_content" TEXT,
    "attachment_url" TEXT,
    "is_read_by_agent" BOOLEAN NOT NULL DEFAULT FALSE,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "platform_timestamp" TIMESTAMPTZ
);

-- --------------------------------------------------------
-- Automated Triggers for Chat Logic
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_contact_summary_on_message()
RETURNS TRIGGER AS $$
DECLARE
    v_contact_id UUID;
BEGIN
    v_contact_id := COALESCE(NEW.contact_id, OLD.contact_id);

    UPDATE public."Contact"
    SET 
        "last_interaction_at" = (SELECT MAX(m.sent_at) FROM public."Message" m WHERE m.contact_id = v_contact_id),
        "last_message_preview" = (
            SELECT CASE 
                WHEN sub.content_type = 'text' THEN LEFT(sub.text_content, 70)
                ELSE '[' || sub.content_type || ']'
            END
            FROM public."Message" sub WHERE sub.contact_id = v_contact_id ORDER BY sub.sent_at DESC LIMIT 1
        ),
        "unread_count" = (
            SELECT COUNT(*) FROM public."Message" m
            WHERE m.contact_id = v_contact_id AND m.sender_type = 'user' AND m.is_read_by_agent = FALSE
        )
    WHERE id = v_contact_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear any existing trigger before creating a new one
DROP TRIGGER IF EXISTS messages_summary_trigger ON public."Message";

CREATE TRIGGER messages_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."Message"
FOR EACH ROW EXECUTE FUNCTION public.update_contact_summary_on_message();

-- ====================================================================
-- SECURITY (Row Level Security)
-- ====================================================================
-- Note: RLS is disabled by default. If your Next.js API uses the
-- Service Role key, it will bypass RLS. If you plan to expose the
-- Anon key to the client side, you MUST enable RLS and write policies.

-- ====================================================================
-- SALOON DASHBOARD MIGRATION SCRIPT
-- Transitions the current database to the Unified Client + Message Schema
-- Safely applies updates without deleting existing basic data.
-- ====================================================================

-- 1. CLEANUP PREVIOUS ATTEMPTS
-- This will wipe the broken tables you were struggling with,
-- as well as the old JSONB Conversation table.
DROP TRIGGER IF EXISTS messages_summary_trigger ON public."Message";

DROP FUNCTION IF EXISTS public.update_contact_summary_on_message ();

DROP FUNCTION IF EXISTS public.update_client_summary_on_message ();

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

-- ====================================================================
-- SALOON DASHBOARD MIGRATION SCRIPT
-- Transitions from Blacklist table to ai_enabled Client column
-- ====================================================================

-- 1. Add ai_enabled to Client
ALTER TABLE "public"."Client"
    ADD COLUMN IF NOT EXISTS "ai_enabled" BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Drop the old BlacklistEntry table
DROP TABLE IF EXISTS "public"."BlacklistEntry" CASCADE;

-- Migration to Link Bookings to Clients

-- 1. Wipe existing bookings (safe for dev) to avoid constraint violations
TRUNCATE TABLE "public"."Booking";

-- 2. Modify the Booking table
ALTER TABLE "public"."Booking" 
  DROP COLUMN IF EXISTS "clientName",
  DROP COLUMN IF EXISTS "clientPhone",
  DROP COLUMN IF EXISTS "clientAddress",
  ADD COLUMN IF NOT EXISTS "client_id" UUID NOT NULL REFERENCES "public"."Client"("id") ON DELETE CASCADE;

-- Migration to Link Bookings to Clients

-- 1. Wipe existing bookings (safe for dev) to avoid constraint violations
TRUNCATE TABLE "public"."Booking";

-- 2. Modify the Booking table
ALTER TABLE "public"."Booking" 
  DROP COLUMN IF EXISTS "clientName",
  DROP COLUMN IF EXISTS "clientPhone",
  DROP COLUMN IF EXISTS "clientAddress",
  ADD COLUMN IF NOT EXISTS "client_id" UUID NOT NULL REFERENCES "public"."Client"("id") ON DELETE CASCADE;

-- 3. Make Client name nullable
ALTER TABLE "public"."Client" ALTER COLUMN "name" DROP NOT NULL;

-- Migration: Products Overhaul, Settings, Roles, and Storage

-- ====================================================================
-- 1. Product Table Overhaul
-- ====================================================================
-- Note: We assume it's safe to drop the old English columns in this development phase.
-- We rename the Arabic ones to be the primary ones.

ALTER TABLE "public"."Product"
  DROP COLUMN IF EXISTS "name",
  DROP COLUMN IF EXISTS "description";

ALTER TABLE "public"."Product" RENAME COLUMN "nameAr" TO "name";

ALTER TABLE "public"."Product"
  RENAME COLUMN "descriptionAr" TO "description";

-- Change image from TEXT to JSONB to store an array of URLs
ALTER TABLE "public"."Product"
  DROP COLUMN IF EXISTS "image",
  ADD COLUMN IF NOT EXISTS "images" JSONB DEFAULT '[]'::jsonb;

-- Ensure name is NOT NULL now that it is the primary name
-- First we update any nulls to empty string
UPDATE "public"."Product" SET "name" = '' WHERE "name" IS NULL;

ALTER TABLE "public"."Product" ALTER COLUMN "name" SET NOT NULL;

-- ====================================================================
-- 2. System Settings Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS "public"."SystemSetting" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT,
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at_settings ON "public"."SystemSetting";

CREATE TRIGGER handle_updated_at_settings BEFORE UPDATE ON "public"."SystemSetting" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- Insert default values
INSERT INTO "public"."SystemSetting" ("key", "value") VALUES 
  ('salon_address', ''),
  ('order_notification_whatsapp', '')
ON CONFLICT ("key") DO NOTHING;

-- ====================================================================
-- 3. App User Role Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS "public"."AppUserRole" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID UNIQUE, -- Can map to auth.users.id later
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "role" TEXT NOT NULL CHECK ("role" IN ('admin', 'team')),
    "permissions" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at_roles ON "public"."AppUserRole";

CREATE TRIGGER handle_updated_at_roles BEFORE UPDATE ON "public"."AppUserRole" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- ====================================================================
-- 4. Supabase Storage Bucket Setup
-- ====================================================================
-- Create the storage bucket
INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'saloon_uploads',
        'saloon_uploads',
        true
    ) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (bucket_id = 'saloon_uploads');
-- Allow all authenticated users (or anon for this dev scope) to upload
CREATE POLICY "Upload Access" ON storage.objects FOR
INSERT
WITH
    CHECK (bucket_id = 'saloon_uploads');

CREATE POLICY "Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'saloon_uploads');

CREATE POLICY "Update Access" ON storage.objects FOR
UPDATE USING (bucket_id = 'saloon_uploads');

ALTER TABLE "public"."Product"
ADD COLUMN IF NOT EXISTS "notes" TEXT DEFAULT '';

ALTER TABLE "public"."Product" ADD COLUMN IF NOT EXISTS "notes" TEXT DEFAULT '';

-- Add webhookUrl to Channel table
ALTER TABLE "public"."Channel" ADD COLUMN IF NOT EXISTS "webhookUrl" TEXT DEFAULT '';