-- Add support for channel spaces
ALTER TABLE "public"."spaceRegistrations"
    ADD COLUMN IF NOT EXISTS "channelId" text;

-- Ensure we only store valid space types, including channels
ALTER TABLE "public"."spaceRegistrations"
    DROP CONSTRAINT IF EXISTS valid_space_type;

ALTER TABLE "public"."spaceRegistrations"
    ADD CONSTRAINT valid_space_type CHECK (
        "spaceType" IN ('profile', 'token', 'proposal', 'channel')
    );

-- Prevent duplicate registrations for the same channel
-- Using a partial unique index allows NULLs while ensuring uniqueness for non-NULL values
CREATE UNIQUE INDEX IF NOT EXISTS "spaceRegistrations_channelId_key"
    ON public."spaceRegistrations" ("channelId")
    WHERE "channelId" IS NOT NULL;
