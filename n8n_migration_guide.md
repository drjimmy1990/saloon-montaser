# n8n to Supabase Migration Guide

This guide explains how to adapt your existing Facebook/Instagram n8n workflow to the new **Dashboard Saloon** Supabase architecture.

## 1. Apply the SQL Migration
Before updating n8n, run the `supabase-migration-01.sql` script in your Supabase SQL Editor. This script:
- Adds `platformUserId` and `platform` to the `Client` table so you can identify Instagram users.
- Makes the `phone` column optional, since social media users don't provide phone numbers initially.
- Creates a `Queue` table to replace your old queue system.

## 2. Update Supabase Credentials
Every `Supabase` node in your workflow currently points to the old `selfhosted` or `dashboard` credentials.
**Action:** Go to your n8n Credentials section, create a new **Supabase API** credential using your *new* Supabase URL and Service Role Key, and select this new credential in all your Supabase nodes.

## 3. Node-by-Node Fixes

### A. Channel Verification (`HTTP Request6` & `Get many rows5`)
You previously queried the database using HTTP requests to fetch nested relational tables.
**Action:** Replace these nodes with a single **Supabase Get Many** node:
1. **Node Type:** Supabase
2. **Operation:** Get Many
3. **Table:** `Channel`
4. **Filter:** Since the Page ID is stored inside the `credentials` JSONB column, use a filter to check if `credentials` contains the Page ID from the webhook (`{{ $json.body.entry[0].id }}`).

### B. Contact Management (`Supabase7`, `Supabase8`, `Update a row`)
You previously inserted into a `contacts` table using `platform_user_id`.
**Action:** Update these nodes to target the `Client` table:
1. Change the table from `contacts` to `Client`.
2. Change the field `platform_user_id` to `platformUserId`.
3. Make sure to map the user's name to the `name` field. Leave `phone` empty until they provide one.

### C. Processing the Queue (`Supabase`, `Supabase3`, `Supabase4`)
You previously inserted messages into a `queue` table.
**Action:** Since we just recreated the `Queue` table in the migration script, you only need to:
1. Change the table target from `queue` to `Queue`.
2. Map `sender_id` to `senderId`.
3. Map `message` to `message`.

### D. Message Storage (`Supabase10`, `Supabase12`, `Supabase13`, `Supabase14`)
> [!WARNING]  
> This is the biggest architectural change! There is no `messages` table.

You previously inserted single rows into a `messages` table. Now, the `Conversation` table stores the entire chat in a single `messages` JSONB array. 

**Action:** You can't just "insert" a message. You must **Update** the Conversation array.

**Step 1: Create a Code Node (Prepare new message JSON)**
Before updating Supabase, add a Code Node in n8n to prepare the JSON payload:
```javascript
const newMessage = {
  "sender": "user",
  "text": $input.item.json.text_content || "",
  "contentType": $input.item.json.content_type || "text",
  "attachmentUrl": $input.item.json.attachment_url || null,
  "timestamp": new Date().toISOString()
};

return { json: { newMessage } };
```

**Step 2: Append the Message**
Because standard n8n Supabase nodes overwrite JSON instead of appending, you must first GET the conversation, push the new message to the array in a Code node, and then UPDATE the conversation.
1. **Supabase Get:** Table `Conversation`, filter by `clientPhone` or find via `Client` relationship.
2. **Code Node:** `oldMessages.push(newMessage)`
3. **Supabase Update:** Update `Conversation` table with the new combined JSON array.
