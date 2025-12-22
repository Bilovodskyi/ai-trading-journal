-- Add custom_field_names columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "open_custom_field_names" jsonb DEFAULT '[]';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "close_custom_field_names" jsonb DEFAULT '[]';
