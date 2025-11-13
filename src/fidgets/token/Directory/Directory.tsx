import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isEqual } from "lodash";

import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import {
  FONT_FAMILY_OPTIONS,
} from "@/common/lib/theme/fonts";
import {
  type FidgetArgs,
  type FidgetModule,
  type FidgetProperties,
} from "@/common/fidgets";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import {
  extractNeynarPrimaryAddress,
  extractNeynarSocialAccounts,
  buildEtherscanUrl,
  getBlockExplorerLink,
  normalizeAddress as normalizeAddressUtil,
  parseSocialRecord,
} from "@/common/data/api/token/utils";
import {
  BadgeIcons,
  ProfileLink,
  PaginationControls,
  DirectoryCardView,
  DirectoryListView,
} from "./components";
import {
  resolveFontFamily,
  getLastActivityLabel,
  sortMembers,
  sanitizeSortOption,
} from "./utils";
import {
  STALE_AFTER_MS,
  PAGE_SIZE,
  CHANNEL_FETCH_DEBOUNCE_MS,
  NETWORK_OPTIONS,
  SORT_OPTIONS,
  LAYOUT_OPTIONS,
  ASSET_TYPE_OPTIONS,
  INCLUDE_OPTIONS,
  SOURCE_OPTIONS,
  CHANNEL_FILTER_OPTIONS,
  CSV_TYPE_OPTIONS,
  CSV_SORT_OPTIONS,
} from "./constants";
import type {
  DirectoryNetwork,
  DirectoryAssetType,
  DirectorySortOption,
  DirectoryLayoutStyle,
  DirectoryIncludeOption,
  DirectorySource,
  DirectoryChannelFilterOption,
  CsvTypeOption,
  CsvSortOption,
  DirectoryMemberData,
  DirectoryFidgetData,
  DirectoryFidgetSettings,
} from "./types";

// Re-export types for backward compatibility
export type {
  DirectoryNetwork,
  DirectoryAssetType,
  DirectorySortOption,
  DirectoryLayoutStyle,
  DirectoryIncludeOption,
  DirectorySource,
  DirectoryChannelFilterOption,
  CsvTypeOption,
  CsvSortOption,
  DirectoryMemberData,
  DirectoryFidgetData,
  DirectoryFidgetSettings,
};

const HiddenField: React.FC<any> = () => null;

const styleFields = defaultStyleFields.filter((field) =>
  [
    "background",
    "fidgetBorderColor",
    "fidgetBorderWidth",
    "fidgetShadow",
    "showOnMobile",
    "customMobileDisplayName",
    "mobileIconName",
  ].includes(field.fieldName),
);

const directoryProperties: FidgetProperties<DirectoryFidgetSettings> = {
  fidgetName: "Directory",
  icon: 0x1f465,
  fields: [
    {
      fieldName: "source",
      displayName: "Source",
      default: "tokenHolders",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={SOURCE_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "subheader",
      displayName: "Subheader",
      default: "",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput
            {...props}
            className="[&_label]:!normal-case"
            placeholder="Optional subheader"
          />
        </WithMargin>
      ),
      group: "settings",
    },
    // CSV-specific settings
    {
      fieldName: "csvType",
      displayName: "Type",
      default: "username",
      required: true,
      disabledIf: (settings) => settings?.source !== "csv",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={CSV_TYPE_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "csvUpload",
      displayName: "Upload CSV",
      required: false,
      disabledIf: (settings) => settings?.source !== "csv",
      inputSelector: ({ updateSettings }) => {
        const fileInputRef = React.useRef<HTMLInputElement | null>(null);
        const handleSelectClick = () => fileInputRef.current?.click();
        const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const text = await file.text();
            updateSettings?.({
              csvContent: text,
              csvUpload: new Date().toISOString(),
              csvFilename: file.name,
            });
            console.log("[Directory] CSV selected:", file.name, "size:", file.size);
          } catch (err) {
            console.error("Failed to read CSV", err);
          } finally {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        };

        return (
          <WithMargin>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-black/5"
                onClick={handleSelectClick}
              >
                Select CSV…
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </WithMargin>
        );
      },
      group: "settings",
    },
    {
      fieldName: "csvContent",
      displayName: "CSV Content",
      required: false,
      disabledIf: () => true,
      inputSelector: HiddenField,
      group: "settings",
    },
    {
      fieldName: "csvFilename",
      displayName: "CSV File",
      default: "",
      required: false,
      disabledIf: (settings) => settings?.source !== "csv",
      inputSelector: (props) => (
        <WithMargin>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">{String(props.value || "—")}</span>
          </div>
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "csvSortBy",
      displayName: "Sort by",
      default: "followers",
      required: true,
      disabledIf: (settings) => settings?.source !== "csv",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={CSV_SORT_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "network",
      displayName: "Network",
      default: "base",
      required: true,
      disabledIf: (settings) => settings?.source !== "tokenHolders",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={NETWORK_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "assetType",
      displayName: "Type",
      default: "token",
      required: true,
      disabledIf: (settings) => settings?.source !== "tokenHolders",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={ASSET_TYPE_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "contractAddress",
      displayName: "Contract Address",
      default: "",
      required: true,
      disabledIf: (settings) => settings?.source !== "tokenHolders",
      validator: (value: string) =>
        !value || /^0x[a-fA-F0-9]{40}$/.test(value.trim()),
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} className="[&_label]:!normal-case" />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "sortBy",
      displayName: "Sort by",
      default: "tokenHoldings",
      required: true,
      disabledIf: (settings) => settings?.source !== "tokenHolders",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={SORT_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "layoutStyle",
      displayName: "Style",
      default: "cards",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={LAYOUT_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "include",
      displayName: "Filter",
      default: "holdersWithFarcasterAccount",
      required: true,
      disabledIf: (settings) => settings?.source !== "tokenHolders",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={INCLUDE_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    // Farcaster Channel specific settings
    {
      fieldName: "channelName",
      displayName: "Channel Name",
      default: "",
      required: true,
      disabledIf: (settings) => settings?.source !== "farcasterChannel",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} className="[&_label]:!normal-case" />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "channelFilter",
      displayName: "Filter",
      default: "members",
      required: true,
      disabledIf: (settings) => settings?.source !== "farcasterChannel",
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={CHANNEL_FILTER_OPTIONS}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "refreshToken",
      displayName: "Refresh Data",
      default: "",
      required: false,
      disabledIf: (settings) => {
        const source = settings?.source ?? "tokenHolders";
        if (source === "tokenHolders") {
          return !settings?.contractAddress;
        }
        if (source === "farcasterChannel") {
          return !(settings?.channelName && settings.channelName.trim().length > 0);
        }
        if (source === "csv") {
          return !(settings?.csvUpload ?? settings?.csvUploadedAt);
        }
        return true;
      },
      inputSelector: ({ updateSettings }) => {
        return (
          <WithMargin>
            <button
              type="button"
              onClick={() => updateSettings?.({ refreshToken: new Date().toISOString() })}
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-black/5"
            >
              Refresh Members
            </button>
          </WithMargin>
        );
      },
      group: "settings",
    },
    {
      fieldName: "primaryFontFamily",
      displayName: "Primary Font",
      displayNameHint: "Applied to titles, member names, and other prominent text.",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "primaryFontColor",
      displayName: "Primary Font Color",
      displayNameHint: "Color used for headings and primary text accents.",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-headings-font-color)"
            defaultColor="#000000"
            colorType="font color"
          />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "secondaryFontFamily",
      displayName: "Secondary Font",
      displayNameHint: "Used for body copy and supporting text.",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "secondaryFontColor",
      displayName: "Secondary Font Color",
      displayNameHint: "Color applied to body text within the directory.",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-font-color)"
            defaultColor="#1f2933"
            colorType="font color"
          />
        </WithMargin>
      ),
      group: "style",
    },
    ...styleFields,
  ],
  size: {
    minHeight: 4,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const Directory: React.FC<
  FidgetArgs<DirectoryFidgetSettings, DirectoryFidgetData>
> = ({ settings, data, saveData }) => {
  const source: DirectorySource = settings.source ?? "tokenHolders";
  const { network, contractAddress } = settings;
  const assetType: DirectoryAssetType = (settings.assetType ?? "token") as DirectoryAssetType;
  // Local view state (defaults from settings)
  const [currentSort, setCurrentSort] = useState<DirectorySortOption>(
    sanitizeSortOption(settings.sortBy),
  );
  const [currentLayout, setCurrentLayout] = useState<DirectoryLayoutStyle>(
    settings.layoutStyle,
  );
  const [currentChannelFilter, setCurrentChannelFilter] = useState<DirectoryChannelFilterOption>(
    (settings.channelFilter ?? "members") as DirectoryChannelFilterOption,
  );
  const includeFilter = (settings.include ?? "holdersWithFarcasterAccount") as DirectoryIncludeOption;
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Keep defaults in sync if the fidget settings change
  useEffect(() => {
    setCurrentSort(sanitizeSortOption(settings.sortBy));
    setCurrentLayout(settings.layoutStyle);
    setCurrentChannelFilter((settings.channelFilter ?? "members") as DirectoryChannelFilterOption);
    setCurrentPage(1);
  }, [settings.layoutStyle, settings.sortBy, settings.channelFilter]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
  const normalizedAddress = normalizeAddressUtil(contractAddress || "");
  const channelName = (settings.channelName ?? "").trim();
  const [debouncedChannelName, setDebouncedChannelName] = useState(channelName);
  const csvUploadedAt = settings.csvUpload ?? settings.csvUploadedAt ?? "";
  const isConfigured =
    source === "tokenHolders"
      ? normalizedAddress.length === 42
      : source === "farcasterChannel"
        ? channelName.length > 0
        : (csvUploadedAt as string).length > 0;
  const primaryFontFamily = useMemo(
    () => resolveFontFamily(
      settings.primaryFontFamily,
      "var(--user-theme-headings-font)",
    ),
    [settings.primaryFontFamily],
  );
  const secondaryFontFamily = useMemo(
    () => resolveFontFamily(
      settings.secondaryFontFamily,
      "var(--user-theme-font)",
    ),
    [settings.secondaryFontFamily],
  );
  const primaryFontColor =
    settings.primaryFontColor || "var(--user-theme-headings-font-color)";
  const secondaryFontColor = settings.secondaryFontColor || "var(--user-theme-font-color)";
  const headingTextStyle = useMemo(
    () =>
      ({
        fontFamily: primaryFontFamily,
        color: primaryFontColor,
      }) as React.CSSProperties,
    [primaryFontFamily, primaryFontColor],
  );
  const secondaryTextStyle = useMemo(
    () =>
      ({
        fontFamily: secondaryFontFamily,
        color: secondaryFontColor,
      }) as React.CSSProperties,
    [secondaryFontFamily, secondaryFontColor],
  );
  const headingFontFamilyStyle = useMemo(
    () =>
      ({
        fontFamily: primaryFontFamily,
      }) as React.CSSProperties,
    [primaryFontFamily],
  );

  const [directoryData, setDirectoryData] = useState<DirectoryFidgetData>(() => ({
    members: data?.members ?? [],
    lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? null,
    tokenSymbol: data?.tokenSymbol ?? null,
    tokenDecimals: data?.tokenDecimals ?? null,
    lastFetchSettings: data?.lastFetchSettings,
  }));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [suppressAutoRefresh, setSuppressAutoRefresh] = useState(false);
  const lastCsvTriggerRef = useRef<string | null>(null);
  const lastManualRefreshRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setDirectoryData((prev) => {
      const next: DirectoryFidgetData = {
        members: data.members ?? prev.members,
        lastUpdatedTimestamp: data.lastUpdatedTimestamp ?? prev.lastUpdatedTimestamp ?? null,
        tokenSymbol: data.tokenSymbol ?? prev.tokenSymbol ?? null,
        tokenDecimals: data.tokenDecimals ?? prev.tokenDecimals ?? null,
        lastFetchSettings: data.lastFetchSettings ?? prev.lastFetchSettings,
      };

      if (
        isEqual(prev.members, next.members) &&
        prev.lastUpdatedTimestamp === next.lastUpdatedTimestamp &&
        prev.tokenSymbol === next.tokenSymbol &&
        prev.tokenDecimals === next.tokenDecimals &&
        isEqual(prev.lastFetchSettings, next.lastFetchSettings)
      ) {
        return prev;
      }

      return next;
    });
  }, [data]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (source !== "farcasterChannel") {
      setDebouncedChannelName(channelName);
      return;
    }
    const timer = setTimeout(() => setDebouncedChannelName(channelName), CHANNEL_FETCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [channelName, source]);

  const customSubheader = (settings.subheader ?? "").trim();
  const computedSubheader = useMemo(() => {
    if (customSubheader.length > 0) {
      return customSubheader;
    }
    if (source === "tokenHolders") {
      return directoryData.tokenSymbol ? `${directoryData.tokenSymbol} • ${network}` : null;
    }
    if (source === "farcasterChannel") {
      return channelName ? `/${channelName}` : null;
    }
    return null;
  }, [customSubheader, source, directoryData.tokenSymbol, network, channelName]);

  // Reset or clamp page when filter/sort/data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [includeFilter, currentSort]);

  const shouldRefresh = useMemo(() => {
    if (!isConfigured) {
      return false;
    }

    if (source === "csv") {
      return false;
    }

    const lastFetch = directoryData.lastFetchSettings;
    const lastUpdated = directoryData.lastUpdatedTimestamp
      ? Date.parse(directoryData.lastUpdatedTimestamp)
      : 0;

    // If no previous fetch, need to fetch
    if (!lastFetch || !lastUpdated) {
      return true;
    }

    // Extract relevant settings for comparison (only the ones that affect data fetching)
    const currentFetchSettings: Partial<DirectoryFidgetSettings> = {
      source,
      ...(source === "tokenHolders" && {
        network,
        contractAddress: normalizedAddress,
        assetType,
      }),
      ...(source === "farcasterChannel" && {
        channelName: debouncedChannelName,
        channelFilter: settings.channelFilter ?? "members",
      }),
    };

    // If settings changed, need refresh
    if (!isEqual(currentFetchSettings, lastFetch)) {
      return true;
    }

    // Otherwise check if data is stale
    return Date.now() - lastUpdated > STALE_AFTER_MS;
  }, [
    directoryData.lastFetchSettings,
    directoryData.lastUpdatedTimestamp,
    isConfigured,
    source,
    network,
    normalizedAddress,
    assetType,
    debouncedChannelName,
    settings.channelFilter,
  ]);

  const persistDataIfChanged = useCallback(
    async (payload: DirectoryFidgetData) => {
      const hasChanged =
        !isEqual(directoryData.members, payload.members) ||
        directoryData.lastUpdatedTimestamp !== payload.lastUpdatedTimestamp ||
        directoryData.tokenSymbol !== payload.tokenSymbol ||
        directoryData.tokenDecimals !== payload.tokenDecimals ||
        !isEqual(directoryData.lastFetchSettings, payload.lastFetchSettings);

      setDirectoryData(payload);

      if (hasChanged) {
        await saveData(payload);
      }
    },
    [directoryData, saveData],
  );

  const fetchTokenDirectory = useCallback(
    async (controller: AbortController) => {
      const response = await fetch(
        `/api/token/directory?network=${network}&contractAddress=${normalizedAddress}&assetType=${assetType}&pageSize=1000`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to load token directory");
      }

      const json = (await response.json()) as {
        result: "success" | "error";
        value?: DirectoryFidgetData;
        error?: { message?: string };
      };

      if (json.result === "error" || !json.value) {
        throw new Error(json.error?.message || "Failed to load token directory");
      }

      const sortedMembers = sortMembers(
        json.value.members ?? [],
        sanitizeSortOption(settings.sortBy),
      );
      const timestamp = new Date().toISOString();

      await persistDataIfChanged({
        members: sortedMembers,
        tokenSymbol: json.value.tokenSymbol,
        tokenDecimals: json.value.tokenDecimals,
        lastUpdatedTimestamp: timestamp,
        lastFetchSettings: {
          source: "tokenHolders",
          network,
          contractAddress: normalizedAddress,
          assetType,
        },
      });
    },
    [assetType, network, normalizedAddress, persistDataIfChanged, settings.sortBy],
  );

  const fetchChannelDirectory = useCallback(
    async (controller: AbortController) => {
      // Helper to normalize various user shapes coming from Neynar
      type NeynarUser = {
        fid?: number | null;
        username?: string | null;
        display_name?: string | null;
        pfp_url?: string | null;
        follower_count?: number | null;
      };
      const getNestedUser = (u: any): NeynarUser | undefined => {
        if (!u) return undefined;
        if (typeof u === "object" && u !== null) {
          if ("user" in u && u.user) return getNestedUser(u.user);
          return u as NeynarUser;
        }
        return undefined;
      };

      const fetchMembers = async () => {
        const res = await fetch(
          `/api/farcaster/neynar/channel/members?id=${encodeURIComponent(
            (settings.channelName ?? "").trim(),
          )}&limit=100`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const membersArray: any[] = Array.isArray(data?.members) ? data.members : [];
        return membersArray
          .map((m) => getNestedUser(m))
          .filter(Boolean) as NeynarUser[];
      };

      const fetchFollowers = async () => {
        const res = await fetch(
          `/api/farcaster/neynar/channel/followers?id=${encodeURIComponent(
            (settings.channelName ?? "").trim(),
          )}&limit=1000`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const usersArray: any[] = Array.isArray(data?.users) ? data.users : [];
        return usersArray
          .map((u) => getNestedUser(u))
          .filter(Boolean) as NeynarUser[];
      };

      let users: NeynarUser[] = [];
      const filter = (settings.channelFilter ?? "members") as DirectoryChannelFilterOption;
      if (filter === "members") {
        users = await fetchMembers();
      } else if (filter === "followers") {
        users = await fetchFollowers();
      } else {
        const [m, f] = await Promise.all([fetchMembers(), fetchFollowers()]);
        const byFid = new Map<number, NeynarUser>();
        for (const u of [...m, ...f]) {
          if (typeof u.fid === "number") byFid.set(u.fid, u);
        }
        users = Array.from(byFid.values());
      }

      const members: DirectoryMemberData[] = users.map((u) => {
        const primaryAddress = extractNeynarPrimaryAddress(u);
        const { xHandle: userXHandle, xUrl: userXUrl, githubHandle: userGithubHandle, githubUrl: userGithubUrl } =
          extractNeynarSocialAccounts(u);
        return {
          address: `fc_fid_${u.fid ?? Math.random().toString(36).slice(2)}`,
          balanceRaw: "0",
          balanceFormatted: "",
          username: u.username ?? undefined,
          displayName: u.display_name ?? undefined,
          fid: typeof u.fid === "number" ? u.fid : undefined,
          pfpUrl: u.pfp_url ?? undefined,
          followers: typeof u.follower_count === "number" ? u.follower_count : undefined,
          lastTransferAt: null,
          ensName: null,
          ensAvatarUrl: null,
          primaryAddress,
          etherscanUrl: buildEtherscanUrl(primaryAddress),
          xHandle: userXHandle,
          xUrl: userXUrl,
          githubHandle: userGithubHandle,
          githubUrl: userGithubUrl,
        };
      });

      // For channel lists, default to sorting by followers
      const sortedMembers = sortMembers(members, "followers");
      const timestamp = new Date().toISOString();

      await persistDataIfChanged({
        members: sortedMembers,
        tokenSymbol: null,
        tokenDecimals: null,
        lastUpdatedTimestamp: timestamp,
        lastFetchSettings: {
          source: "farcasterChannel",
          channelName: (settings.channelName ?? "").trim(),
          channelFilter: (settings.channelFilter ?? "members") as DirectoryChannelFilterOption,
        },
      });
    },
    [persistDataIfChanged, settings.channelName, settings.channelFilter],
  );

  const parseCsv = (raw: string, type: CsvTypeOption) => {
    const text = raw.replace(/^\uFEFF/, "").trim();
    if (!text) return [] as string[];
    const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (rows.length === 0) return [] as string[];

    const split = (line: string) => {
      // naive CSV split with basic quote handling
      const result: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
          continue;
        }
        if (ch === "," && !inQuotes) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += ch;
        }
      }
      result.push(cur.trim());
      return result.map((v) => v.replace(/^"|"$/g, ""));
    };

    const headerColsRaw = split(rows[0]);
    const headerCols = headerColsRaw.map((c) => c.toLowerCase());
    let colIndex = 0;
    let hasHeader = false;
    const candidates: Record<CsvTypeOption, string[]> = {
      address: ["address", "eth", "wallet"],
      fid: ["fid", "id"],
      username: ["username", "handle", "fc"],
    };
    const headerMatch = (value: string) =>
      candidates[type].includes(value.trim().toLowerCase());

    if (headerCols.length > 1) {
      const idx = headerCols.findIndex((c) => headerMatch(c));
      if (idx >= 0) {
        colIndex = idx;
        hasHeader = true;
      }
    } else if (headerCols.length === 1 && headerMatch(headerCols[0])) {
      hasHeader = true;
    }

    const items: string[] = [];
    for (let i = hasHeader ? 1 : 0; i < rows.length; i++) {
      const cols = split(rows[i]);
      const rawVal = (cols[colIndex] || "").trim();
      if (!rawVal) continue;
      if (type === "username") {
        items.push(rawVal.replace(/^@/, ""));
      } else {
        items.push(rawVal);
      }
    }
    if (items.length === 0) {
      const fallbackRows = rows.slice(hasHeader ? 1 : 0);
      fallbackRows.forEach((row) => {
        const value = row.trim();
        if (!value) return;
        if (type === "username") {
          items.push(value.replace(/^@/, ""));
        } else {
          items.push(value);
        }
      });
    }
    return items;
  };

  const fetchCsvDirectory = useCallback(
    async (controller: AbortController) => {
      console.log("[Directory] CSV fetch starting", {
        source: settings.source,
        csvType: settings.csvType,
        csvSortBy: settings.csvSortBy,
        csvUpload: settings.csvUpload ?? settings.csvUploadedAt,
        contentLength: (settings.csvContent ?? "").length,
      });
      const type = (settings.csvType ?? "username") as CsvTypeOption;
      const csvSortBy = (settings.csvSortBy ?? "followers") as CsvSortOption;
      const raw = settings.csvContent ?? "";
      const entries = parseCsv(raw, type);
      if (entries.length === 0) {
        throw new Error(
          "CSV appears empty or unrecognized. Expected a first column or headers named username/handle/fc, address/eth/wallet, or fid/id.",
        );
      }

      console.log("[Directory] CSV parsed entries", entries.length);

      const unique = Array.from(new Set(entries));

      const byKey = new Map<string, DirectoryMemberData>();

      const chunkArray = <T,>(array: T[], size: number) =>
        Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
          array.slice(i * size, i * size + size),
        );

      const mapUserToMember = (u: any): DirectoryMemberData => {
        const primaryAddress = extractNeynarPrimaryAddress(u);
        const { xHandle: userXHandle, xUrl: userXUrl, githubHandle: userGithubHandle, githubUrl: userGithubUrl } =
          extractNeynarSocialAccounts(u);
        return {
          address: `fc_fid_${u?.fid ?? Math.random().toString(36).slice(2)}`,
          balanceRaw: "0",
          balanceFormatted: "",
          username: u?.username ?? null,
          displayName: u?.display_name ?? null,
          fid: typeof u?.fid === "number" ? u.fid : null,
          pfpUrl: u?.pfp_url ?? null,
          followers: typeof u?.follower_count === "number" ? u.follower_count : null,
          lastTransferAt: null,
          ensName: null,
          ensAvatarUrl: null,
          primaryAddress: primaryAddress,
          etherscanUrl: buildEtherscanUrl(primaryAddress),
          xHandle: userXHandle,
          xUrl: userXUrl,
          githubHandle: userGithubHandle,
          githubUrl: userGithubUrl,
        };
      };

      if (type === "username") {
        const usernameChunks = chunkArray(unique, 50);
        for (const usernames of usernameChunks) {
          console.log("[Directory] CSV usernames batch", usernames.length);
          const lookupParams = new URLSearchParams();
          lookupParams.set("usernames", usernames.join(","));
          const lookupRes = await fetch(
            `/api/farcaster/neynar/getFids?${lookupParams.toString()}`,
            { signal: controller.signal },
          );
          if (!lookupRes.ok) throw new Error(await lookupRes.text());
          const lookupData = (await lookupRes.json()) as { username: string; fid: string }[];
          const usernameOfFid = new Map<number, string>();
          const fids = lookupData
            .map((entry) => {
              const fidNumber = Number(entry.fid);
              if (Number.isFinite(fidNumber)) {
                const uname = entry.username.toLowerCase();
                usernameOfFid.set(fidNumber, uname);
                return fidNumber;
              }
              return null;
            })
            .filter((fid): fid is number => fid !== null);

          if (fids.length === 0) {
            continue;
          }

          const query = new URLSearchParams();
          query.set("fids", fids.join(","));
          const res = await fetch(`/api/farcaster/neynar/users?${query.toString()}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          const users: any[] = Array.isArray(data?.users) ? data.users : [];
          users.forEach((u) => {
            const member = mapUserToMember(u);
            if (member.fid != null) {
              byKey.set(String(member.fid), member);
              const lookedUpUsername = usernameOfFid.get(member.fid);
              const keyUsername = (member.username ?? lookedUpUsername)?.toLowerCase();
              if (keyUsername) {
                byKey.set(keyUsername, member);
              }
            } else if (member.username) {
              byKey.set(member.username.toLowerCase(), member);
            }
          });
        }
      } else if (type === "fid") {
        const fidChunks = chunkArray(unique, 100);
        for (const chunk of fidChunks) {
          console.log("[Directory] CSV fids batch", chunk.length);
          const query = new URLSearchParams();
          query.set("fids", chunk.join(","));
          const res = await fetch(`/api/farcaster/neynar/users?${query.toString()}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          const users: any[] = Array.isArray(data?.users) ? data.users : [];
          users.forEach((u) => {
            const member = mapUserToMember(u);
            if (member.fid != null) byKey.set(String(member.fid), member);
            if (member.username) byKey.set(member.username.toLowerCase(), member);
          });
        }
      } else if (type === "address") {
        // Batched Farcaster user resolution by address
        const addressChunks = chunkArray(unique, 100);
        for (const ch of addressChunks) {
          if (ch.length === 0) continue;
          try {
            const params = new URLSearchParams();
            ch.forEach((a) => params.append("addresses[]", a));
            console.log("[Directory] CSV address batch (Farcaster)", ch.length);
            const resp = await fetch(`/api/farcaster/neynar/bulk-address?${params.toString()}`,
              { signal: controller.signal });
            if (resp.ok) {
              const data = await resp.json();
              // data is an object: { [address]: User[] }
              Object.entries<any>(data || {}).forEach(([addr, users]) => {
                const first = Array.isArray(users) && users.length > 0 ? users[0] : undefined;
                if (first) {
                  const member = mapUserToMember(first);
                  byKey.set(addr.toLowerCase(), member);
                }
              });
            }
          } catch (e) {
            // ignore batch failure; continue
          }
        }

        // Batched ENS resolution via enstate.rs
        try {
          const ensChunks = chunkArray(unique, 100);
          for (const ch of ensChunks) {
            if (ch.length === 0) continue;
            const url = new URL("https://enstate.rs/bulk/a");
            ch.forEach((a) => url.searchParams.append("addresses[]", a));
      console.log("[Directory] CSV address batch (ENS)", ch.length);
            const res = await fetch(url.toString(), { signal: controller.signal });
            if (!res.ok) continue;
            const json = await res.json();
            const records: any[] = Array.isArray(json?.response) ? json.response : [];
            for (const rec of records) {
              const addr = (rec?.address || "").toLowerCase();
              if (!addr) continue;
              const current = byKey.get(addr);
              const ensName = rec?.name || null;
              const ensAvatarUrl = rec?.avatar || null;
              const recordsObj = rec?.records;
              const parsedTwitter = parseSocialRecord(
                recordsObj?.["com.twitter"] ??
                  recordsObj?.twitter ??
                  recordsObj?.["com.x"] ??
                  recordsObj?.x,
                "twitter",
              );
              const parsedGithub = parseSocialRecord(
                recordsObj?.["com.github"] ?? recordsObj?.github,
                "github",
              );
              const ensPrimaryAddress =
                typeof rec?.chains?.eth === "string"
                  ? rec.chains.eth.toLowerCase()
                  : null;
              const fallbackPrimaryAddress = ensPrimaryAddress ?? addr;
              const merged =
                current ??
                ({
                  address: addr,
                  balanceRaw: "0",
                  balanceFormatted: "",
                  username: null,
                  displayName: null,
                  fid: null,
                  pfpUrl: null,
                  followers: null,
                  lastTransferAt: null,
                  ensName: null,
                  ensAvatarUrl: null,
                  primaryAddress: fallbackPrimaryAddress,
                  etherscanUrl: buildEtherscanUrl(fallbackPrimaryAddress),
                  xHandle: null,
                  xUrl: null,
                  githubHandle: null,
                  githubUrl: null,
                } as DirectoryMemberData);

              const resolvedPrimaryAddress =
                merged.primaryAddress ?? fallbackPrimaryAddress ?? null;

              const next: DirectoryMemberData = {
                ...merged,
                ensName: merged.ensName ?? ensName ?? null,
                ensAvatarUrl: merged.ensAvatarUrl ?? ensAvatarUrl ?? null,
                primaryAddress: resolvedPrimaryAddress,
                etherscanUrl:
                  merged.etherscanUrl ??
                  buildEtherscanUrl(resolvedPrimaryAddress ?? addr),
                xHandle: merged.xHandle ?? parsedTwitter?.handle ?? null,
                xUrl: merged.xUrl ?? parsedTwitter?.url ?? null,
                githubHandle: merged.githubHandle ?? parsedGithub?.handle ?? null,
                githubUrl: merged.githubUrl ?? parsedGithub?.url ?? null,
              };

              byKey.set(addr, next);
            }
          }
        } catch (e) {
          // ignore ENS batch errors
        }
      }

      // Build members preserving CSV order
      const members: DirectoryMemberData[] = entries.map((val) => {
        if (type === "username") {
          const key = val.toLowerCase();
          return (
            byKey.get(key) || {
              address: `fc_username_${key}`,
              balanceRaw: "0",
              balanceFormatted: "",
              username: key,
              displayName: null,
              fid: null,
              pfpUrl: null,
              followers: null,
              lastTransferAt: null,
              ensName: null,
              ensAvatarUrl: null,
              primaryAddress: null,
              etherscanUrl: null,
              xHandle: null,
              xUrl: null,
              githubHandle: null,
              githubUrl: null,
            }
          );
        }
        if (type === "fid") {
          const key = String(Number(val));
          return (
            byKey.get(key) || {
              address: `fc_fid_${key}`,
              balanceRaw: "0",
              balanceFormatted: "",
              username: null,
              displayName: null,
              fid: Number.isNaN(Number(key)) ? null : Number(key),
              pfpUrl: null,
              followers: null,
              lastTransferAt: null,
              ensName: null,
              ensAvatarUrl: null,
              primaryAddress: null,
              etherscanUrl: null,
              xHandle: null,
              xUrl: null,
              githubHandle: null,
              githubUrl: null,
            }
          );
        }
        // address
        const key = val.toLowerCase();
        return (
          byKey.get(key) || {
            address: key,
            balanceRaw: "0",
            balanceFormatted: "",
            username: null,
            displayName: null,
            fid: null,
            pfpUrl: null,
            followers: null,
            lastTransferAt: null,
            ensName: null,
            ensAvatarUrl: null,
            primaryAddress: key,
            etherscanUrl: buildEtherscanUrl(key),
            xHandle: null,
            xUrl: null,
            githubHandle: null,
            githubUrl: null,
          }
        );
      });

      const finalMembers = csvSortBy === "followers"
        ? sortMembers(members, "followers")
        : members;

      const timestamp = new Date().toISOString();
      console.log("[Directory] CSV fetch complete", {
        members: finalMembers.length,
        sort: csvSortBy,
      });
      await persistDataIfChanged({
        members: finalMembers,
        tokenSymbol: null,
        tokenDecimals: null,
        lastUpdatedTimestamp: timestamp,
        lastFetchSettings: {
          source: "csv",
          csvUpload: settings.csvUpload ?? settings.csvUploadedAt ?? "",
          csvUploadedAt: settings.csvUpload ?? settings.csvUploadedAt ?? "",
          csvType: type,
          csvSortBy,
        },
      });
    },
    [
      persistDataIfChanged,
      settings.csvContent,
      settings.csvUpload,
      settings.csvUploadedAt,
      settings.csvType,
      settings.csvSortBy,
    ],
  );

  const fetchDirectory = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsRefreshing(true);
    setError(null);

    try {
      if ((settings.source ?? "tokenHolders") === "tokenHolders") {
        await fetchTokenDirectory(controller);
      } else if ((settings.source ?? "tokenHolders") === "farcasterChannel") {
        await fetchChannelDirectory(controller);
      } else {
        await fetchCsvDirectory(controller);
      }
      setCurrentPage(1);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }
      console.error(err);
      const src = settings.source ?? "tokenHolders";
      const prefix = src === "tokenHolders"
        ? "Failed to load token directory"
        : src === "farcasterChannel"
          ? "Failed to load Farcaster channel users"
          : "Failed to import CSV";
      setError(`${prefix}: ${(err as Error).message || "Unknown error"}`);
      setSuppressAutoRefresh(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [isConfigured, settings.source, fetchTokenDirectory, fetchChannelDirectory, fetchCsvDirectory]);

  useEffect(() => {
    if (source === "csv") {
      return;
    }
    if (shouldRefresh && !isRefreshing && !suppressAutoRefresh) {
      void fetchDirectory();
    }
  }, [source, fetchDirectory, isRefreshing, shouldRefresh, suppressAutoRefresh]);

  // If fetch context changes, reset error and allow auto refresh
  useEffect(() => {
    setSuppressAutoRefresh(false);
    setError(null);
  }, [
    source,
    network,
    normalizedAddress,
    assetType,
    channelName,
    currentChannelFilter,
    settings.csvUploadedAt,
    settings.csvUpload,
    settings.csvType,
    settings.csvSortBy,
    settings.refreshToken,
  ]);

  // Trigger fetch when CSV upload or manual refresh changes
  useEffect(() => {
    if ((settings.source ?? "tokenHolders") !== "csv") {
      lastCsvTriggerRef.current = null;
      return;
    }
    const uploadToken = settings.csvUpload ?? settings.csvUploadedAt ?? "";
    const refreshToken = settings.refreshToken ?? "";
    if (!uploadToken && !refreshToken) {
      return;
    }
    const combined = `${uploadToken}__${refreshToken}`;
    if (lastCsvTriggerRef.current === combined) {
      return;
    }
    lastCsvTriggerRef.current = combined;
    setSuppressAutoRefresh(false);
    setError(null);
    void fetchDirectory();
  }, [settings.source, settings.csvUpload, settings.csvUploadedAt, settings.refreshToken, fetchDirectory]);

  useEffect(() => {
    if ((settings.source ?? "tokenHolders") === "csv") {
      return;
    }
    const token = settings.refreshToken ?? "";
    if (!token) {
      return;
    }
    const key = `${settings.source ?? "tokenHolders"}__${token}`;
    if (lastManualRefreshRef.current === key) {
      return;
    }
    lastManualRefreshRef.current = key;
    setSuppressAutoRefresh(false);
    setError(null);
    void fetchDirectory();
  }, [settings.refreshToken, settings.source, fetchDirectory]);

  const filteredSortedMembers = useMemo(() => {
    if ((settings.source ?? "tokenHolders") !== "tokenHolders") {
      // Already sorted when fetched
      return directoryData.members ?? [];
    }
    // Optional client-side safety net: drop duplicate fids if any slip through
    const base = directoryData.members ?? [];
    const seenFids = new Set<number>();
    const deduped = base.filter((m) => {
      if (typeof m.fid === "number" && m.fid > 0) {
        if (seenFids.has(m.fid)) return false;
        seenFids.add(m.fid);
        return true;
      }
      return true;
    });
    const members = sortMembers(deduped, currentSort);
    if (includeFilter === "holdersWithFarcasterAccount") {
      return members.filter((member) => Boolean(member.username));
    }
    return members;
  }, [directoryData.members, includeFilter, currentSort, settings.source]);

  const pageCount = useMemo(() => {
    const total = filteredSortedMembers.length;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [filteredSortedMembers.length]);

  // Clamp current page if total changes
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const displayedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredSortedMembers.slice(start, end);
  }, [filteredSortedMembers, currentPage]);

  const emptyStateMessage =
    (settings.source ?? "tokenHolders") === "farcasterChannel"
      ? (currentChannelFilter === "members"
          ? "No channel members found."
          : currentChannelFilter === "followers"
            ? "No channel followers found."
            : "No users found for this channel.")
      : includeFilter === "allHolders"
        ? "No holders found for this asset yet."
        : "No Farcaster profiles found for this asset yet.";

  const lastUpdatedLabel = useMemo(() => {
    return getLastActivityLabel(directoryData.lastUpdatedTimestamp);
  }, [directoryData.lastUpdatedTimestamp]);

  if (!isConfigured) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground"
        style={secondaryTextStyle}
      >
        {(settings.source ?? "tokenHolders") === "tokenHolders" ? (
          <>
            <p className="font-medium" style={headingTextStyle}>
              Connect a contract address to build the directory.
            </p>
            <p className="max-w-[40ch] text-xs text-muted-foreground/80">
              Provide an ERC-20 token or NFT contract address and network to surface the
              holders with Farcaster profiles.
            </p>
          </>
        ) : (settings.source ?? "tokenHolders") === "farcasterChannel" ? (
          <>
            <p className="font-medium" style={headingTextStyle}>
              Enter a Farcaster channel name to build the directory.
            </p>
            <p className="max-w-[40ch] text-xs text-muted-foreground/80">
              Example: nouns, purple. The filter selects Members, Followers, or both.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium" style={headingTextStyle}>
              Upload a CSV to build the directory.
            </p>
            <p className="max-w-[40ch] text-xs text-muted-foreground/80">
              Choose Type (Address, FID, or Farcaster username), then use Upload CSV in settings.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={secondaryTextStyle}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
        <div className="flex flex-col gap-1">
          <span className="font-semibold" style={headingTextStyle}>
            Community Directory
          </span>
          {computedSubheader && (
            <span
              className="text-xs font-medium"
              style={{
                ...headingFontFamilyStyle,
                color: primaryFontColor,
                opacity: 0.75,
              }}
            >
              {computedSubheader}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {lastUpdatedLabel && (
            <span className="rounded-full bg-black/5 px-2 py-1 font-medium text-muted-foreground">
              Updated {lastUpdatedLabel}
            </span>
          )}
        </div>
      </div>

      {/* View controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wide text-muted-foreground">Style</span>
          <SettingsSelector
            onChange={(value) => setCurrentLayout(value as DirectoryLayoutStyle)}
            value={currentLayout}
            settings={LAYOUT_OPTIONS as unknown as { name: string; value: string }[]}
          />
        </div>
        {(settings.source ?? "tokenHolders") === "tokenHolders" && (
          <>
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wide text-muted-foreground">Sort by</span>
              <SettingsSelector
                onChange={(value) => setCurrentSort(value as DirectorySortOption)}
                value={currentSort}
                settings={SORT_OPTIONS as unknown as { name: string; value: string }[]}
              />
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <PaginationControls
            currentPage={currentPage}
            pageCount={pageCount}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            totalCount={filteredSortedMembers.length}
          />
        </div>
      </div>

      {error && (
        <div className="m-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isRefreshing && !directoryData.members?.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading directory…
          </div>
        ) : displayedMembers.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyStateMessage}
          </div>
        ) : currentLayout === "list" ? (
          <DirectoryListView
            members={displayedMembers}
            settings={settings}
            tokenSymbol={directoryData.tokenSymbol}
            headingTextStyle={headingTextStyle}
            network={network}
            includeFilter={includeFilter}
          />
        ) : (
          <DirectoryCardView
            members={displayedMembers}
            settings={settings}
            tokenSymbol={directoryData.tokenSymbol}
            headingTextStyle={headingTextStyle}
            headingFontFamilyStyle={headingFontFamilyStyle}
            network={network}
            includeFilter={includeFilter}
          />
        )}
        {/* Bottom pagination */}
        {filteredSortedMembers.length > 0 && (
          <div className="mt-4 flex items-center justify-end">
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              totalCount={filteredSortedMembers.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ProfileLink and PaginationControls moved to ./components

const DirectoryModule: FidgetModule<FidgetArgs> = {
  fidget: Directory as unknown as React.FC<FidgetArgs>,
  properties: directoryProperties as unknown as FidgetProperties,
};

export default DirectoryModule;
