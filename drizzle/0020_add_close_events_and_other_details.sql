-- Add close_events and custom fields JSONB columns for partial closes and custom fields
ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "close_events" jsonb;
ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "open_other_details" jsonb;
ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "close_other_details" jsonb;

-- Make deposit and instrumentName optional (drop NOT NULL constraint)
ALTER TABLE "trades" ALTER COLUMN "deposit" DROP NOT NULL;
ALTER TABLE "trades" ALTER COLUMN "instrumentName" DROP NOT NULL;
