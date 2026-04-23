# n8n Integration Guide for Saloon Dashboard

This document provides the necessary mappings and the exact SQL required to connect your n8n workflow to the new `Message` table architecture.

---

## 1. Database Migration Fix
The error `relation "Channel" already exists` happened because the original schema script tries to create all tables from scratch. 

Since your database is already populated, **run ONLY this specific SQL query** in your Supabase SQL Editor to drop the old JSONB array and create the new `Message` table:

```sql
-- 1. Remove the old JSONB array from the Conversation table
ALTER TABLE "public"."Conversation" DROP COLUMN IF EXISTS "messages";

-- 2. Create the new Message table for n8n to insert into
CREATE TABLE IF NOT EXISTS "public"."Message" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contact_id" UUID REFERENCES "public"."Conversation"("id") ON DELETE CASCADE,
    "sender_type" TEXT DEFAULT 'user',
    "content_type" TEXT DEFAULT 'text',
    "text_content" TEXT DEFAULT '',
    "attachment_url" TEXT DEFAULT '',
    "platform_timestamp" TEXT DEFAULT '',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. n8n Node Configuration Types

When using the Supabase "Insert Row" node in n8n, target the **`Message`** table. Use the exact string values below to ensure the frontend dashboard renders the chat interface correctly.

### `sender_type` (Who sent the message)
*   **`"user"`**: The client. Renders a green/sage bubble aligned to the client side.
*   **`"bot"`**: Automated AI response. Renders a primary-colored bubble aligned to the system side with a Bot icon.
*   **`"agent"`**: Human support agent. Renders a terracotta-colored bubble centered in the chat.

### `content_type` (Format of the message)
The dashboard currently defaults to parsing this as text, but for future-proofing your n8n workflows, use standard MIME prefixes:
*   `"text"`
*   `"audio"`
*   `"image"`
*   `"video"`
*   `"document"`

### `channelType` (For new Conversations ONLY)
If your n8n workflow creates an entirely *new* row in the `Conversation` table, use these exact strings so the UI renders the correct logos:
*   `"whatsapp"`
*   `"facebook"`
*   `"instagram"`

---

## 3. Example n8n Mapping (Based on your snippet)

*   **tableId**: `Message`
*   **`contact_id`**: `={{ $json.conversation_uuid }}` *(Must be the ID of the parent Conversation)*
*   **`sender_type`**: `"user"`
*   **`content_type`**: `"audio"`
*   **`text_content`**: `={{ $json.content.parts[0].text }}`
*   **`attachment_url`**: `={{ $json.publicurl }}`
*   **`platform_timestamp`**: `={{ $json.Timestamp }}`
