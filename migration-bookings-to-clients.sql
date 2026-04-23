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
