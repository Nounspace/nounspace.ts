import { createSupabaseServerClient } from "@/common/data/database/supabase/clients/server";
import { SignedFile, isSignedFile } from "@/common/lib/signedFiles";
import { SpaceConfig } from "@/app/(spaces)/Space";
import { unstable_noStore as noStore } from "next/cache";

export async function getSpaceTabConfig(
  spaceId: string,
  tabName: string,
): Promise<Omit<SpaceConfig, "isEditable"> | null> {
  noStore();
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.storage
      .from("spaces")
      .download(`${spaceId}/tabs/${tabName}`);

    if (error || !data) {
      console.warn(
        `Failed to download config for ${spaceId}/${tabName}: ${error?.message}`,
      );
      return null;
    }

    const fileText = await data.text();
    const parsed = JSON.parse(fileText);

    if (!isSignedFile(parsed)) {
      console.warn(`Invalid signed file format for ${spaceId}/${tabName}`);
      return null;
    }

    try {
      return JSON.parse((parsed as SignedFile).fileData) as Omit<
        SpaceConfig,
        "isEditable"
      >;
    } catch (e) {
      console.error("Error parsing space config", e);
      return null;
    }
  } catch (e) {
    console.error("Error loading space tab config", e);
    return null;
  }
}
