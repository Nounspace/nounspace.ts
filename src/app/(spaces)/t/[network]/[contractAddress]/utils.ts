import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { SignedFile } from "@/common/lib/signedFiles";
import { SpaceConfig } from "@/app/(spaces)/Space";
import { unstable_noStore as noStore } from 'next/cache';

export async function getSpaceTabConfig(
  spaceId: string,
  tabName: string,
): Promise<Omit<SpaceConfig, "isEditable"> | null> {
  noStore();
  try {
    const { data, error } = await createSupabaseServerClient()
      .storage
      .from("spaces")
      .download(`${spaceId}/tabs/${tabName}`);
    if (error || !data) {
      console.warn(`No space config found for ${spaceId}/${tabName}:`, error);
      return null;
    }
    const fileText = await data.text();
    const fileData = JSON.parse(fileText) as SignedFile;
    const config = JSON.parse(
      fileData.fileData,
    ) as Omit<SpaceConfig, "isEditable">;
    return config;
  } catch (e) {
    console.error("Error loading space tab config", e);
    return null;
  }
}
