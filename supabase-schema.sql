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
-- Table: Client (Unified CRM Profile & Messaging Identity)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Client" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "channel_id" UUID REFERENCES "public"."Channel"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT DEFAULT '',
    "notes" TEXT DEFAULT '',
    "platform" TEXT DEFAULT 'whatsapp',
    "platform_user_id" TEXT,
    "avatar_url" TEXT,
    "last_interaction_at" TIMESTAMPTZ DEFAULT NOW(),
    "last_message_preview" TEXT,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT DEFAULT 'active',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_client_per_channel UNIQUE ("channel_id", "platform_user_id")
);
DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Client";
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Client" 
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- --------------------------------------------------------
-- Table: Message
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."Message" (
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

-- --------------------------------------------------------
-- Automated Triggers for Chat Logic
-- --------------------------------------------------------
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

-- Clear any existing trigger before creating a new one
DROP TRIGGER IF EXISTS messages_summary_trigger ON public."Message";

CREATE TRIGGER messages_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."Message"
FOR EACH ROW EXECUTE FUNCTION public.update_client_summary_on_message();

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
-- SECURITY (Row Level Security)
-- ====================================================================
-- Note: RLS is disabled by default. If your Next.js API uses the
-- Service Role key, it will bypass RLS. If you plan to expose the
-- Anon key to the client side, you MUST enable RLS and write policies.
