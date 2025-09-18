-- Add the proposalId column first
ALTER TABLE "spaceRegistrations" 
    ADD COLUMN "proposalId" TEXT;

-- Add the spaceType column with a default value
ALTER TABLE "spaceRegistrations" 
    ADD COLUMN "spaceType" VARCHAR NOT NULL DEFAULT 'profile';

-- Update existing records based on field presence (no need to check proposalId since none exist)
UPDATE "spaceRegistrations"
    SET "spaceType" = 
        CASE
            WHEN "contractAddress" IS NOT NULL THEN 'token'
            ELSE 'profile'
        END;

-- Add a check constraint to ensure valid space types
ALTER TABLE "spaceRegistrations"
    ADD CONSTRAINT valid_space_type CHECK (
        "spaceType" IN ('profile', 'token', 'proposal')
    );

-- Create an index for faster lookups by space type
CREATE INDEX idx_space_registrations_space_type ON "spaceRegistrations"("spaceType");