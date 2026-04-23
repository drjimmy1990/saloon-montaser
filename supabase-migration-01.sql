-- Add platform-specific fields to Client table for n8n/webhook identification
ALTER TABLE "public"."Client" 
ADD COLUMN IF NOT EXISTS "platformUserId" TEXT,
ADD COLUMN IF NOT EXISTS "platform" TEXT;

-- Make phone optional since social media users don't provide a phone number initially
ALTER TABLE "public"."Client" ALTER COLUMN "phone" DROP NOT NULL;

-- Create Queue table for asynchronous n8n processing
CREATE TABLE IF NOT EXISTS "public"."Queue" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for Queue updatedAt
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_queue') THEN
        CREATE TRIGGER handle_updated_at_queue 
        BEFORE UPDATE ON "public"."Queue" 
        FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");
    END IF;
END $$;
