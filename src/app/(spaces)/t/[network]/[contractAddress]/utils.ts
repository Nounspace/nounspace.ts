import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { SignedFile, isSignedFile } from "@/common/lib/signedFiles";
import { SpaceConfig } from "@/app/(spaces)/Space";
import { unstable_noStore as noStore } from "next/cache";
import axios from "axios";

export async function getSpaceTabConfig(
  spaceId: string,
  tabName: string,
): Promise<Omit<SpaceConfig, "isEditable"> | null> {
  noStore();
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { publicUrl },
    } = await supabase.storage
      .from("spaces")
      .getPublicUrl(`${spaceId}/tabs/${tabName}`);

    if (!publicUrl) {
      console.warn(`No space config found for ${spaceId}/${tabName}`);
      return null;
    }

    const t = Math.random().toString(36).substring(2);
    const urlWithParam = `${publicUrl}?t=${t}`;

    const { data } = await axios.get<Blob>(urlWithParam, { responseType: "blob" });

    const fileText = await data.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(fileText);
    } catch (e) {
      console.error("Error parsing signed file text", e);
      return null;
    }

    if (!isSignedFile(parsed)) {
      console.warn(`Invalid signed file format for ${spaceId}/${tabName}`);
      return null;
    }

    let config: unknown;
    try {
      config = JSON.parse((parsed as SignedFile).fileData);
    } catch (e) {
      console.error("Error parsing space config", e);
      return null;
    }

    return config as Omit<SpaceConfig, "isEditable">;
  } catch (e) {
    console.error("Error loading space tab config", e);
    return null;
  }
}
