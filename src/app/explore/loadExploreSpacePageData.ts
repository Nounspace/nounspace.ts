import type { SpaceConfig } from "@/app/(spaces)/Space";
import { ExplorePageConfig } from "@/config/systemConfig";
import { SpacePageData, SPACE_TYPES } from "@/common/types/spaceData";
import { defaultUserTheme } from "@/common/lib/theme/defaultTheme";
import type { UserTheme, Color, FontFamily } from "@/common/lib/theme";
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

  const lookupExistingSpace = async () => {
    if (isNil(adminFid)) {
      return null;
    }

    const { data } = await supabase
      .from("spaceRegistrations")
      .select("spaceId, identityPublicKey, spaceName")
      .eq("fid", adminFid)
      .eq("spaceName", spaceDisplayName)
      .eq("spaceType", SPACE_TYPES.EXPLORE)
      .order("timestamp", { ascending: true })
      .limit(1);

    return data && data.length > 0 ? data[0] : null;
  };

  if (!isNil(adminFid)) {
    try {
      const existing = await lookupExistingSpace();
      if (existing) {
        spaceId = existing.spaceId;
        identityPublicKey = existing.identityPublicKey ?? undefined;
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
            const { data: upserted, error: insertError } = await supabase
              .from("spaceRegistrations")
              .upsert(
                {
                  fid: adminFid,
                  spaceName: spaceDisplayName,
                  identityPublicKey: adminIdentity,
                  signature: "explore-auto-registration",
                  timestamp: insertTimestamp,
                  spaceType: SPACE_TYPES.EXPLORE,
                },
                { onConflict: "fid,spaceName" },
              )
              .select("spaceId, identityPublicKey")
              .limit(1);

            if (insertError) {
              console.error("Failed to register explore space:", insertError);
            }

            if (upserted && upserted.length > 0) {
              spaceId = upserted[0]?.spaceId;
              identityPublicKey = upserted[0]?.identityPublicKey ?? undefined;
            } else {
              const refreshed = await lookupExistingSpace();
              if (refreshed) {
                spaceId = refreshed.spaceId;
                identityPublicKey = refreshed.identityPublicKey ?? undefined;
              }
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

  const mergeThemeProperties = (properties?: Record<string, unknown>): UserTheme["properties"] => {
    const source = properties || {};
    const defaults = defaultUserTheme.properties;
    return {
      font: (source.font ?? defaults.font) as FontFamily,
      fontColor: (source.fontColor ?? defaults.fontColor) as Color,
      headingsFont: (source.headingsFont ?? defaults.headingsFont) as FontFamily,
      headingsFontColor: (source.headingsFontColor ?? defaults.headingsFontColor) as Color,
      background: (source.background ?? defaults.background) as Color,
      backgroundHTML: typeof source.backgroundHTML === "string"
        ? source.backgroundHTML
        : defaults.backgroundHTML,
      musicURL: typeof source.musicURL === "string" ? source.musicURL : defaults.musicURL,
      fidgetBackground: (source.fidgetBackground ?? defaults.fidgetBackground) as Color,
      fidgetBorderWidth: typeof source.fidgetBorderWidth === "string"
        ? source.fidgetBorderWidth
        : defaults.fidgetBorderWidth,
      fidgetBorderColor: (source.fidgetBorderColor ?? defaults.fidgetBorderColor) as Color,
      fidgetShadow: typeof source.fidgetShadow === "string" ? source.fidgetShadow : defaults.fidgetShadow,
      fidgetBorderRadius: typeof source.fidgetBorderRadius === "string"
        ? source.fidgetBorderRadius
        : defaults.fidgetBorderRadius,
      gridSpacing: typeof source.gridSpacing === "string" ? source.gridSpacing : defaults.gridSpacing,
    };
  };

  const hydratedTheme: UserTheme = {
    ...defaultUserTheme,
    ...activeConfig.theme,
    properties: mergeThemeProperties(activeConfig.theme?.properties as Record<string, unknown> | undefined),
  };

  const configForSpace: Omit<SpaceConfig, "isEditable"> = {
    ...activeConfig,
    theme: hydratedTheme,
  };

  return {
    spaceId,
    spaceName: spaceDisplayName,
    spaceType: SPACE_TYPES.EXPLORE,
    updatedAt: new Date().toISOString(),
    defaultTab: explorePage.defaultTab,
    currentTab: resolvedTabName,
    spaceOwnerFid: adminFid,
    identityPublicKey,
    tabOrder: explorePage.tabOrder,
    config: configForSpace,
  };
}
