CREATE UNIQUE INDEX "spaceOrderings_fid_key" ON public."spaceOrderings" USING btree (fid);

alter table "public"."spaceOrderings" add constraint "spaceOrderings_fid_key" UNIQUE using index "spaceOrderings_fid_key";


