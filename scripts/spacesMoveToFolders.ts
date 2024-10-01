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

let spaceFiles: FileObject[] = [];
let { data } = await spaceBucket.list("", { limit: 100 });
let offset = 100;

while (!_.isNull(data)) {
  spaceFiles = _.concat(spaceFiles, data);
  ({ data } = await spaceBucket.list("", { limit: 100, offset }));
  if (!_.isNull(data) && data.length === 0) {
    data = null;
  }
  offset += 100;
}

console.log(spaceFiles.length);

function createTabOrderFileJson(spaceId: string) {
  return {
    publicKey: "dummy",
    signature: "n/a",
    spaceId,
    tabOrder:	["Profile"],
    timestamp:	moment().toISOString(),
  }
};

async function renameSpaceName(newName: string): Promise<void> {
  try {
    // Make the update query to change all spaceName values
    const { data, error } = await supabaseClient
      .from('spaceRegistrations')
      .update({ spaceName: newName }) // Set the new value for spaceName
      .neq('spaceName', newName); // Update only if the spaceName isn't already the newName
    
    if (error) {
      throw new Error(`Error renaming spaceName: ${error.message}`);
    }

    console.log('Field spaceName updated for all users:', data);
  } catch (error) {
    console.error('Error during rename operation:', error);
  }
}

// Function to cross-reference spaceRegistrations and remove those without a corresponding folder
async function cleanUpSpaceRegistrations() {
  try {
    // Step 1: Fetch all spaceRegistrations from the database
    const { data: spaceRegistrations, error: spaceRegError } = await supabaseClient
      .from('spaceRegistrations') // Assuming your table is named 'spaceRegistrations'
      .select('spaceId'); // Assuming each spaceRegistration has a spaceId

    if (spaceRegError) {
      throw new Error(`Error fetching space registrations: ${spaceRegError.message}`);
    }

    // Step 2: List all folders in the 'spaces' bucket
    const { data: spaceFolders, error: folderError } = await supabaseClient
      .storage
      .from('spaces') // Assuming your storage bucket is named 'spaces'
      .list('', { limit: 1000, offset: 0 }); // Adjust limit and offset for pagination if necessary

    if (folderError) {
      throw new Error(`Error fetching space folders: ${folderError.message}`);
    }

    // Extract folder names (assuming each folder has the same name as spaceId)
    const folderNames = spaceFolders?.map(folder => folder.name);

    // Step 3: Find spaceRegistrations without corresponding folders
    const registrationsToDelete = spaceRegistrations?.filter(reg => !folderNames?.includes(reg.spaceId));

    if (registrationsToDelete && registrationsToDelete.length > 0) {
      // Step 4: Remove the spaceRegistrations that don't have matching folders
      const { error: deleteError } = await supabaseClient
        .from('spaceRegistrations')
        .delete()
        .in('spaceId', registrationsToDelete.map(reg => reg.spaceId));

      if (deleteError) {
        throw new Error(`Error deleting space registrations: ${deleteError.message}`);
      }

      console.log(`Successfully deleted ${registrationsToDelete.length} orphaned space registrations.`);
    } else {
      console.log('No orphaned space registrations found.');
    }

  } catch (error) {
    console.error('Error during cleanup operation:', error);
  }
}

renameSpaceName("Profile");
cleanUpSpaceRegistrations();

if (spaceFiles) {
  _.forEach(spaceFiles, fileData => {
    if (!isFolder(fileData) && !isHidden(fileData)) {
      console.log(`Moving ${fileData.name}`);
      try {
        supabaseClient.storage.from("spaces").copy(fileData.name, `${fileData.name}/tabs/Profile`);
        supabaseClient.storage.from("spaces").upload(`${fileData.name}/tabOrder`,
          new Blob([stringify(createTabOrderFileJson(fileData.name))],
          { type: "application/json" })
        );
      } catch (e) {
        console.log("error occurred");
        console.error(e);
      }
    }
  })
}