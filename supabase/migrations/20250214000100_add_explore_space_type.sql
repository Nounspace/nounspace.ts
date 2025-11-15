-- Allow explore spaces in spaceRegistrations
ALTER TABLE "public"."spaceRegistrations"
    DROP CONSTRAINT IF EXISTS valid_space_type;

ALTER TABLE "public"."spaceRegistrations"
    ADD CONSTRAINT valid_space_type CHECK (
        "spaceType" IN ('profile', 'token', 'proposal', 'channel', 'explore')
    );
