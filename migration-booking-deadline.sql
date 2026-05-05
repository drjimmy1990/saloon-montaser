-- Migration: Add bookingDeadline column to Product table
-- آخر موعد للحجز — free-text field shown in the admin panel
-- Run this in Supabase SQL Editor

ALTER TABLE "public"."Product"
ADD COLUMN IF NOT EXISTS "bookingDeadline" TEXT DEFAULT '';
