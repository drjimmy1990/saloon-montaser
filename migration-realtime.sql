-- Migration: Enable Supabase Realtime for Message and Client tables
-- Run this in Supabase SQL Editor

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."Message";
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."Client";
