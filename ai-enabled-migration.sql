-- ====================================================================
-- SALOON DASHBOARD MIGRATION SCRIPT
-- Transitions from Blacklist table to ai_enabled Client column
-- ====================================================================

-- 1. Add ai_enabled to Client
ALTER TABLE "public"."Client"
    ADD COLUMN IF NOT EXISTS "ai_enabled" BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Drop the old BlacklistEntry table
DROP TABLE IF EXISTS "public"."BlacklistEntry" CASCADE;
