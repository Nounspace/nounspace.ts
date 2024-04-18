import { createClient } from "@/space/common/helpers/supabase/component";

export async function readPublicFidgetData(fidgetName, key) {
  return readFidgetData(fidgetName, key);
}

export async function writePublicFidgetData(fidgetName, key, value) {
  return writeFidgetData(fidgetName, key, value);
}

export async function readPrivateFidgetData(fidgetName, key) {
  return readFidgetData(fidgetName, key, true);
}

export async function writePivateFidgetData(fidgetName, key, value) {
  return writeFidgetData(fidgetName, key, value, true);
}

async function writeFidgetData(fidgetName, key, value, isPrivate = false) {
  const supabase = createClient();
  const { data } = await supabase.storage.from(isPrivate ? "fidgets" : "fidgetsPublic").update(await createFileLoc(fidgetName, key, isPrivate), value, {
    cacheControl: '3600',
    upsert: false
  });
  return data;
}

async function readFidgetData(fidgetName, key, isPrivate = false) {
  const supabase = createClient();
  const { data } = await supabase.storage.from(isPrivate ? "fidgets" : "fidgetsPublic").download(await createFileLoc(fidgetName, key, isPrivate));
  return data;
}

async function createFileLoc(fidgetName, key, isPrivate = false) {
  let fileLoc = `${fidgetName}/${key}`;
  if (isPrivate) {
    const supabase = createClient();
    const { data: { session }} = await supabase.auth.getSession();
    if (session) {  
      fileLoc = `${session!.user.id}${fileLoc}`
    } else {
      throw new Error("User is not logged in and cannot access private data")
    }
  }
  return fileLoc;
}
