-- ============================================================================
-- SALON DASHBOARD — MASTER SCHEMA
-- Generated: 2026-04-24T17:38:20.266Z
-- Source: Supabase Cloud (schema-only, no data)
-- ============================================================================

-- ═══════════════════════════════════════════════════
-- TABLE: AppUserRole
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."AppUserRole" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "role" text NOT NULL,
  "permissions" jsonb DEFAULT '[]'::jsonb,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT "AppUserRole_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."AppUserRole" ADD CONSTRAINT "AppUserRole_email_key" UNIQUE ("email");
ALTER TABLE public."AppUserRole" ADD CONSTRAINT "AppUserRole_user_id_key" UNIQUE ("user_id");

-- ═══════════════════════════════════════════════════
-- TABLE: Booking
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."Booking" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "serviceSummary" text NOT NULL,
  "channelType" text NOT NULL,
  "bookingDate" timestamp with time zone DEFAULT now(),
  "status" text DEFAULT 'pending'::text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  "client_id" uuid NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."Booking" ADD CONSTRAINT "Booking_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES public."Client"("id") ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════
-- TABLE: Channel
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."Channel" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "type" text NOT NULL,
  "isActive" boolean DEFAULT false,
  "credentials" jsonb DEFAULT '[]'::jsonb,
  "variables" jsonb DEFAULT '{}'::jsonb,
  "imageSets" jsonb DEFAULT '[]'::jsonb,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  "webhookUrl" text DEFAULT ''::text,
  CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════
-- TABLE: Client
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."Client" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" text,
  "phone" text NOT NULL,
  "address" text DEFAULT ''::text,
  "notes" text DEFAULT ''::text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  "channel_id" uuid,
  "platform" text DEFAULT 'whatsapp'::text,
  "platform_user_id" text,
  "avatar_url" text,
  "last_interaction_at" timestamp with time zone DEFAULT now(),
  "last_message_preview" text,
  "unread_count" integer NOT NULL DEFAULT 0,
  "status" text DEFAULT 'active'::text,
  "ai_enabled" boolean NOT NULL DEFAULT true,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."Client" ADD CONSTRAINT "unique_client_per_channel" UNIQUE ("channel_id", "platform_user_id");
ALTER TABLE public."Client" ADD CONSTRAINT "Client_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES public."Channel"("id") ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════
-- TABLE: DashboardStat
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."DashboardStat" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "activeChannels" integer DEFAULT 0,
  "totalMessages" integer DEFAULT 0,
  "totalBookings" integer DEFAULT 0,
  "conversionRate" double precision DEFAULT 0,
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT "DashboardStat_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════
-- TABLE: Message
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."Message" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "channel_id" uuid,
  "client_id" uuid NOT NULL,
  "message_platform_id" text,
  "sender_type" text NOT NULL,
  "content_type" text NOT NULL DEFAULT 'text'::text,
  "text_content" text,
  "attachment_url" text,
  "is_read_by_agent" boolean NOT NULL DEFAULT false,
  "sent_at" timestamp with time zone NOT NULL DEFAULT now(),
  "platform_timestamp" timestamp with time zone,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."Message" ADD CONSTRAINT "Message_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES public."Client"("id") ON DELETE CASCADE;
ALTER TABLE public."Message" ADD CONSTRAINT "Message_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES public."Channel"("id") ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════
-- TABLE: Product
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."Product" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL DEFAULT ''::text,
  "description" text DEFAULT ''::text,
  "price" double precision DEFAULT 0,
  "isAvailable" boolean DEFAULT true,
  "category" text DEFAULT ''::text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  "images" jsonb DEFAULT '[]'::jsonb,
  "notes" text DEFAULT ''::text,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════
-- TABLE: SystemSetting
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."SystemSetting" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "key" text NOT NULL,
  "value" text,
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public."SystemSetting" ADD CONSTRAINT "SystemSetting_key_key" UNIQUE ("key");

-- ═══════════════════════════════════════════════════
-- TABLE: queue
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public."queue" (
  "id" bigint NOT NULL,
  "sender_id" text NOT NULL,
  "message" text,
  CONSTRAINT "queue_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════
ALTER TABLE public."AppUserRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DashboardStat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."queue" ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.moddatetime()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/moddatetime', $function$moddatetime$function$
;
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_client_summary_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

-- ═══════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════
CREATE TRIGGER handle_updated_at_roles BEFORE UPDATE ON "AppUserRole" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "Booking" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "Channel" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "Client" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "DashboardStat" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
CREATE TRIGGER messages_summary_trigger AFTER INSERT OR DELETE OR UPDATE ON "Message" FOR EACH ROW EXECUTE FUNCTION update_client_summary_on_message();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
CREATE TRIGGER handle_updated_at_settings BEFORE UPDATE ON "SystemSetting" FOR EACH ROW EXECUTE FUNCTION moddatetime('updatedAt');
