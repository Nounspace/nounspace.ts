alter table "public"."spaceRegistrations" add column "network" text;

alter table "public"."spaceRegistrations" add column "proposalId" text;

CREATE UNIQUE INDEX "spaceRegistrations_proposalId_key" ON public."spaceRegistrations" USING btree ("proposalId");

alter table "public"."spaceRegistrations" add constraint "spaceRegistrations_proposalId_key" UNIQUE using index "spaceRegistrations_proposalId_key";


