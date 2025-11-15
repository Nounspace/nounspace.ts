import { ExplorePageConfig } from "@/config/systemConfig";
import { SpacePageData, SPACE_TYPES } from "@/common/types/spaceData";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { isNil } from "lodash";
import stringify from "fast-json-stable-stringify";

export type ExploreSpaceServerData = Omit<SpacePageData, "isEditable" | "spacePageUrl">;

type LoadExploreSpaceArgs = {
  explorePage: ExplorePageConfig;
  tabName: string;
  adminFid?: number;
  spaceDisplayName: string;
};

export async function loadExploreSpacePageData({
  explorePage,
  tabName,
  adminFid,
  spaceDisplayName,
}: LoadExploreSpaceArgs): Promise<ExploreSpaceServerData> {
  const resolvedTabName = explorePage.tabs[tabName]
    ? tabName
    : explorePage.defaultTab;

  const activeConfig = explorePage.tabs[resolvedTabName] || explorePage.tabs[explorePage.defaultTab];
  const supabase = createSupabaseServerClient();

  let spaceId: string | undefined;
  let identityPublicKey: string | undefined;

  if (!isNil(adminFid)) {
    try {
      const { data: existing } = await supabase
        .from("spaceRegistrations")
        .select("spaceId, identityPublicKey")
        .eq("fid", adminFid)
        .eq("spaceName", spaceDisplayName)
        .order("timestamp", { ascending: true })
        .limit(1);

      if (existing && existing.length > 0) {
        spaceId = existing[0]?.spaceId;
        identityPublicKey = existing[0]?.identityPublicKey;
      } else {
        const { data: identityRows, error: identityError } = await supabase
          .from("fidRegistrations")
          .select("identityPublicKey")
          .eq("fid", adminFid)
          .order("id", { ascending: true })
          .limit(1);

        if (!identityError && identityRows && identityRows.length > 0) {
          const adminIdentity = identityRows[0]?.identityPublicKey;
          if (adminIdentity) {
            const insertTimestamp = new Date().toISOString();
            const { data: inserted, error: insertError } = await supabase
              .from("spaceRegistrations")
              .insert({
                fid: adminFid,
                spaceName: spaceDisplayName,
                identityPublicKey: adminIdentity,
                signature: "explore-auto-registration",
                timestamp: insertTimestamp,
                spaceType: SPACE_TYPES.PROFILE,
              })
              .select("spaceId, identityPublicKey")
              .single();

            if (!insertError && inserted) {
              spaceId = inserted.spaceId;
              identityPublicKey = inserted.identityPublicKey;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to ensure explore space registration", error);
    }
  }

  if (spaceId) {
    const storage = supabase.storage.from("spaces");
    const publicKey = identityPublicKey ?? "nounspace";
    const timestamp = new Date().toISOString();

    // Ensure tab order file exists so that the TabBar can load a real space order
    try {
      const { data, error } = await storage.download(`${spaceId}/tabOrder`);
      if (error || !data) {
        const tabOrderPayload = {
          spaceId,
          timestamp,
          tabOrder: explorePage.tabOrder,
          publicKey,
          signature: "explore-auto",
        };
        await storage.upload(
          `${spaceId}/tabOrder`,
          new Blob([stringify(tabOrderPayload)], { type: "application/json" }),
          { upsert: true },
        );
      }
    } catch (orderError) {
      console.error("Failed to seed explore tab order", orderError);
    }

    // Ensure each configured tab has a backing file in storage
    await Promise.all(
      explorePage.tabOrder.map(async (tabKey) => {
        try {
          const { data, error } = await storage.download(`${spaceId}/tabs/${tabKey}`);
          if (!error && data) {
            return;
          }
        } catch (_err) {
          // Ignore and proceed to upload default config
        }

        const tabConfig = explorePage.tabs[tabKey] || explorePage.tabs[explorePage.defaultTab];
        const filePayload = {
          fileData: stringify(tabConfig),
          fileType: "json",
          publicKey,
          isEncrypted: false,
          timestamp,
          signature: "explore-auto",
          fileName: tabKey,
        };

        try {
          await storage.upload(
            `${spaceId}/tabs/${tabKey}`,
            new Blob([stringify(filePayload)], { type: "application/json" }),
            { upsert: true },
          );
        } catch (uploadError) {
          console.error(`Failed to seed explore tab ${tabKey}`, uploadError);
        }
      }),
    );
  }

  return {
    spaceId,
    spaceName: spaceDisplayName,
    spaceType: SPACE_TYPES.PROFILE,
    updatedAt: new Date().toISOString(),
    defaultTab: explorePage.defaultTab,
    currentTab: resolvedTabName,
    spaceOwnerFid: adminFid,
    identityPublicKey,
    tabOrder: explorePage.tabOrder,
    config: {
      ...activeConfig,
    },
  };
}
