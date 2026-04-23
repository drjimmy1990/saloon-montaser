-- Migration: Products Overhaul, Settings, Roles, and Storage

-- ====================================================================
-- 1. Product Table Overhaul
-- ====================================================================
-- Note: We assume it's safe to drop the old English columns in this development phase.
-- We rename the Arabic ones to be the primary ones.

ALTER TABLE "public"."Product"
  DROP COLUMN IF EXISTS "name",
  DROP COLUMN IF EXISTS "description";

ALTER TABLE "public"."Product"
  RENAME COLUMN "nameAr" TO "name";

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
INSERT INTO storage.buckets (id, name, public) 
VALUES ('saloon_uploads', 'saloon_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'saloon_uploads');
-- Allow all authenticated users (or anon for this dev scope) to upload
CREATE POLICY "Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'saloon_uploads');
CREATE POLICY "Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'saloon_uploads');
CREATE POLICY "Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'saloon_uploads');
