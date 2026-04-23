-- Add webhookUrl to Channel table
ALTER TABLE "public"."Channel" ADD COLUMN IF NOT EXISTS "webhookUrl" TEXT DEFAULT '';
