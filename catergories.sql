-- Category table for product/service classification
CREATE TABLE IF NOT EXISTS "public"."Category" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "label" TEXT NOT NULL,
    "color" TEXT DEFAULT 'sage',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS handle_updated_at ON "public"."Category";

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "public"."Category"
FOR EACH ROW EXECUTE FUNCTION moddatetime("updatedAt");

-- RLS policies
ALTER TABLE "public"."Category" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access" ON "public"."Category" FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read" ON "public"."Category" FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon write" ON "public"."Category" FOR ALL TO anon USING (true) WITH CHECK (true);