import { createClient } from "@supabase/supabase-js";
import { Database as SupabaseDataBaseType } from "@/supabase/database";
import { FileObject } from "@supabase/storage-js";
import _ from "lodash";
import moment from "moment";
import stringify from "fast-json-stable-stringify";

function isFolder(fileData: FileObject) {
  return _.isNull(fileData.created_at) && _.isNull(fileData.updated_at) && _.isNull(fileData.id);
}

function isHidden(fileData: FileObject) {
  return _.startsWith(fileData.name, ".");
}

// This might need to be run with args taken from script call
const supabaseClient = createClient<SupabaseDataBaseType>(
  process.argv[2],
  process.argv[3],
);

const spaceBucket = supabaseClient.storage.from("spaces");

const { data: spaceFiles } = await spaceBucket.list("");

console.log(spaceFiles);

function createTabOrderFileJson(spaceId: string) {
  return {
    publicKey: "dummy",
    signature: "n/a",
    spaceId,
    tabOrder:	["Profile"],
    timestamp:	moment().toISOString(),
  }
};

if (spaceFiles) {
  _.forEach(spaceFiles, fileData => {
    if (!isFolder(fileData) && !isHidden(fileData)) {
      console.log(`Moving ${fileData.name}`);
      supabaseClient.storage.from("spaces").copy(fileData.name, `${fileData.name}/tabs/Profile`);
      supabaseClient.storage.from("spaces").upload(`${fileData.name}/tabOrder`,
        new Blob([stringify(createTabOrderFileJson(fileData.name))],
        { type: "application/json" })
      );
    }
  })
}