import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { isEqual } from "lodash";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/atoms/avatar";
import BoringAvatar from "boring-avatars";
import { toFarcasterCdnUrl } from "@/common/lib/utils/farcasterCdn";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import {
  FONT_FAMILY_OPTIONS,
  FONT_FAMILY_OPTIONS_BY_NAME,
} from "@/common/lib/theme/fonts";
import {
  type FidgetArgs,
  type FidgetData,
  type FidgetModule,
  type FidgetProperties,
  type FidgetSettings,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";

const STALE_AFTER_MS = 60 * 60 * 1000;
const PAGE_SIZE = 100;
const CHANNEL_FETCH_DEBOUNCE_MS = 800;

export type DirectoryNetwork = "base" | "polygon" | "mainnet";
export type DirectoryAssetType = "token" | "nft";
export type DirectorySortOption = "tokenHoldings" | "followers";
export type DirectoryLayoutStyle = "cards" | "list";
export type DirectoryIncludeOption =
  | "holdersWithFarcasterAccount"
  | "allHolders";

export type DirectorySource = "tokenHolders" | "farcasterChannel" | "csv";
export type DirectoryChannelFilterOption = "members" | "followers" | "all";
export type CsvTypeOption = "address" | "fid" | "username";
export type CsvSortOption = "followers" | "csvOrder";

export interface DirectoryMemberData {
  address: string;
  balanceRaw: string;
  balanceFormatted: string;
  username?: string | null;
  displayName?: string | null;
  fid?: number | null;
  pfpUrl?: string | null;
  followers?: number | null;
  lastTransferAt?: string | null;
  ensName?: string | null;
  ensAvatarUrl?: string | null;
  primaryAddress?: string | null;
  etherscanUrl?: string | null;
  xHandle?: string | null;
  xUrl?: string | null;
  githubHandle?: string | null;
  githubUrl?: string | null;
}

export interface DirectoryFidgetData extends FidgetData {
  members: DirectoryMemberData[];
  lastUpdatedTimestamp?: string | null;
  tokenSymbol?: string | null;
  tokenDecimals?: number | null;
  lastFetchSettings?: Partial<DirectoryFidgetSettings>; // Snapshot of settings used for last fetch
}

export type DirectoryFidgetSettings = FidgetSettings &
  FidgetSettingsStyle & {
    source: DirectorySource;
    network: DirectoryNetwork;
    contractAddress: string;
    assetType: DirectoryAssetType;
    sortBy: DirectorySortOption;
    layoutStyle: DirectoryLayoutStyle;
    include: DirectoryIncludeOption;
    channelName?: string;
    channelFilter?: DirectoryChannelFilterOption;
    csvType?: CsvTypeOption;
    csvSortBy?: CsvSortOption;
    csvContent?: string; // raw csv text
    csvUploadedAt?: string; // iso timestamp (legacy)
    csvUpload?: string; // iso timestamp to trigger refresh
    csvFilename?: string; // last uploaded filename
    refreshToken?: string;
    subheader?: string;
    primaryFontFamily?: string;
    primaryFontColor?: string;
    secondaryFontFamily?: string;
    secondaryFontColor?: string;
  };

const NETWORK_OPTIONS = [
  { name: "Base", value: "base" },
  { name: "Polygon", value: "polygon" },
  { name: "Ethereum Mainnet", value: "mainnet" },
] as const;

const SORT_OPTIONS = [
  { name: "Token holdings", value: "tokenHoldings" },
  { name: "Followers", value: "followers" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: DirectorySortOption;
}>;

const LAYOUT_OPTIONS = [
  { name: "Cards", value: "cards" },
  { name: "List", value: "list" },
] as const;

const ASSET_TYPE_OPTIONS = [
  { name: "Token", value: "token" },
  { name: "NFT", value: "nft" },
] as const;

const INCLUDE_OPTIONS = [
  {
    name: "Holders with Farcaster Account",
    value: "holdersWithFarcasterAccount",
  },
  { name: "All holders", value: "allHolders" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: DirectoryIncludeOption;
}>;

const SOURCE_OPTIONS = [
  { name: "Token Holders", value: "tokenHolders" },
  { name: "Farcaster Channel", value: "farcasterChannel" },
  { name: "CSV", value: "csv" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: DirectorySource;
}>;

const CHANNEL_FILTER_OPTIONS = [
  { name: "Members", value: "members" },
  { name: "Followers", value: "followers" },
  { name: "All", value: "all" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: DirectoryChannelFilterOption;
}>;

const CSV_TYPE_OPTIONS = [
  { name: "Address", value: "address" },
  { name: "FID", value: "fid" },
  { name: "Farcaster username", value: "username" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: CsvTypeOption;
}>;

const CSV_SORT_OPTIONS = [
  { name: "Followers", value: "followers" },
  { name: "CSV order", value: "csvOrder" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: CsvSortOption;
}>;

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

const parseSocialRecordValue = (
  value: unknown,
  platform: "twitter" | "github",
): { handle: string; url: string } | null => {
  if (typeof value !== "string") {
    return null;
  }
  let handle = value.trim();
  if (!handle) return null;

  const patterns =
    platform === "twitter"
      ? [
          /^https?:\/\/(www\.)?twitter\.com\//i,
          /^https?:\/\/(www\.)?x\.com\//i,
        ]
      : [/^https?:\/\/(www\.)?github\.com\//i];

  for (const pattern of patterns) {
    handle = handle.replace(pattern, "");
  }

  handle = handle.replace(/^@/, "");
  handle = handle.replace(/\/+$/, "");
  if (!handle) return null;

  const url =
    platform === "twitter"
      ? `https://twitter.com/${handle}`
      : `https://github.com/${handle}`;
  return { handle, url };
};

const extractNeynarPrimaryAddress = (user: any): string | null => {
  if (!user || typeof user !== "object") return null;
  const verified = (user as { verified_addresses?: any }).verified_addresses;
  if (verified && typeof verified === "object") {
    const primary = verified.primary;
    if (primary && typeof primary.eth_address === "string" && primary.eth_address) {
      return primary.eth_address.toLowerCase();
    }
    if (Array.isArray(verified.eth_addresses)) {
      const candidate = verified.eth_addresses.find(
        (value: unknown): value is string =>
          typeof value === "string" && value.length > 0,
      );
      if (candidate) {
        return candidate.toLowerCase();
      }
    }
  }
  const custody = (user as { custody_address?: string | null }).custody_address;
  if (typeof custody === "string" && custody) {
    return custody.toLowerCase();
  }
  const verifications = (user as { verifications?: string[] }).verifications;
  if (Array.isArray(verifications)) {
    const candidate = verifications.find(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    if (candidate) {
      return candidate.toLowerCase();
    }
  }
  const authAddresses = (user as { auth_addresses?: Array<{ address?: string }> }).auth_addresses;
  if (Array.isArray(authAddresses)) {
    const entry = authAddresses.find(
      (item) => item && typeof item.address === "string" && item.address.length > 0,
    );
    if (entry?.address) {
      return entry.address.toLowerCase();
    }
  }
  return null;
};

const extractNeynarSocialAccounts = (
  user: any,
): {
  xHandle: string | null;
  xUrl: string | null;
  githubHandle: string | null;
  githubUrl: string | null;
} => {
  if (!user || typeof user !== "object") {
    return { xHandle: null, xUrl: null, githubHandle: null, githubUrl: null };
  }
  const verifiedAccounts = (user as { verified_accounts?: Array<any> }).verified_accounts;
  let xHandle: string | null = null;
  let xUrl: string | null = null;
  let githubHandle: string | null = null;
  let githubUrl: string | null = null;
  if (Array.isArray(verifiedAccounts)) {
    for (const account of verifiedAccounts) {
      const platform =
        typeof account?.platform === "string" ? account.platform.toLowerCase() : "";
      const username =
        typeof account?.username === "string" ? account.username.replace(/^@/, "").trim() : "";
      if (!username) continue;
      if (!xHandle && (platform === "x" || platform === "twitter")) {
        xHandle = username;
        xUrl = `https://twitter.com/${username}`;
      } else if (!githubHandle && platform === "github") {
        githubHandle = username;
        githubUrl = `https://github.com/${username}`;
      }
    }
  }
  return { xHandle, xUrl, githubHandle, githubUrl };
};

const buildEtherscanUrl = (address?: string | null) =>
  address ? `https://etherscan.io/address/${address.toLowerCase()}` : null;

const normalizeAddress = (address: string) => address.trim().toLowerCase();

const blockExplorerForNetwork: Record<DirectoryNetwork, string> = {
  mainnet: "https://etherscan.io/address/",
  base: "https://basescan.org/address/",
  polygon: "https://polygonscan.com/address/",
};

const resolveFontFamily = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  const fontOption = FONT_FAMILY_OPTIONS.find(
    (option) =>
      option.name === value || option.config.style.fontFamily === value,
  );
  if (fontOption?.config?.style?.fontFamily) {
    return fontOption.config.style.fontFamily as string;
  }
  return value;
};

const formatTokenBalance = (value: string | null | undefined): string => {
  if (value == null || value === "") return "0";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return parsed.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const FARCASTER_BADGE_SRC = "/images/farcaster.jpeg"; // place provided Farcaster icon here
const ENS_BADGE_SRC = "/images/ens.svg"; // ENS badge SVG placed in public/images
const X_BADGE_SRC = "/images/twitter.avif";
const GITHUB_BADGE_SRC = "/images/github.svg";
const ETHERSCAN_BADGE_SRC = "/images/etherscan.svg";

const getFarcasterProfileUrl = (username?: string | null, fid?: number | null) => {
  const normalizedUsername = username?.replace(/^@/, "").trim();
  if (normalizedUsername) {
    return `https://warpcast.com/${normalizedUsername}`;
  }
  if (typeof fid === "number" && Number.isFinite(fid)) {
    return `https://warpcast.com/~/identity?fid=${fid}`;
  }
  return null;
};

const getEnsProfileUrl = (ensName?: string | null) =>
  ensName ? `https://app.ens.domains/${ensName}` : null;

type BadgeIconsProps = {
  username?: string | null;
  ensName?: string | null;
  ensAvatarUrl?: string | null;
  fid?: number | null;
  primaryAddress?: string | null;
  etherscanUrl?: string | null;
  xHandle?: string | null;
  xUrl?: string | null;
  githubHandle?: string | null;
  githubUrl?: string | null;
  size?: number; // px
  gapClassName?: string;
};

const BadgeIcons: React.FC<BadgeIconsProps> = ({
  username,
  ensName,
  ensAvatarUrl,
  fid,
  primaryAddress,
  etherscanUrl,
  xHandle,
  xUrl,
  githubHandle,
  githubUrl,
  size = 16,
  gapClassName,
}) => {
  const normalizedUsername = username?.replace(/^@/, "").trim();
  const hasFarcasterIdentity =
    Boolean(normalizedUsername && normalizedUsername.length > 0) ||
    typeof fid === "number";
  const farcasterUrl = hasFarcasterIdentity
    ? getFarcasterProfileUrl(normalizedUsername, fid)
    : null;

  const hasEnsIdentity =
    Boolean(ensName && ensName.trim().length > 0) ||
    Boolean(ensAvatarUrl && ensAvatarUrl.trim().length > 0);
  const ensUrl = hasEnsIdentity ? getEnsProfileUrl(ensName?.trim()) : null;

  const normalizedPrimaryAddress = primaryAddress
    ? primaryAddress.trim().toLowerCase()
    : null;
  const resolvedEtherscanUrl =
    etherscanUrl ??
    (normalizedPrimaryAddress
      ? `https://etherscan.io/address/${normalizedPrimaryAddress}`
      : null);

  const normalizedXHandle = xHandle?.replace(/^@/, "").trim() || "";
  const fallbackXHandleFromUrl =
    !normalizedXHandle && xUrl
      ? xUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "").replace(/\/+$/, "")
      : "";
  const finalXHandle = normalizedXHandle || fallbackXHandleFromUrl || null;
  const finalXUrl =
    xUrl ?? (finalXHandle ? `https://twitter.com/${finalXHandle}` : null);
  const hasXIdentity = Boolean(finalXHandle || finalXUrl);

  const normalizedGithubHandle = githubHandle?.replace(/^@/, "").trim() || "";
  const fallbackGithubHandleFromUrl =
    !normalizedGithubHandle && githubUrl
      ? githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/+$/, "")
      : "";
  const finalGithubHandle =
    normalizedGithubHandle || fallbackGithubHandleFromUrl || null;
  const finalGithubUrl =
    githubUrl ?? (finalGithubHandle ? `https://github.com/${finalGithubHandle}` : null);
  const hasGithubIdentity = Boolean(finalGithubHandle || finalGithubUrl);

  const hasEtherscan = Boolean(resolvedEtherscanUrl);

  if (
    !hasFarcasterIdentity &&
    !hasEnsIdentity &&
    !hasXIdentity &&
    !hasGithubIdentity &&
    !hasEtherscan
  ) {
    return null;
  }

  const dim = `${size}px`;
  const imgClass = "rounded-full object-cover ring-1 ring-black/10";

  type BadgeEntry = {
    key: string;
    src: string;
    alt: string;
    title: string;
    href?: string | null;
  };

  const badges: BadgeEntry[] = [];

  if (hasFarcasterIdentity) {
    badges.push({
      key: "farcaster",
      src: FARCASTER_BADGE_SRC,
      alt: "Farcaster",
      title: normalizedUsername
        ? `Farcaster (@${normalizedUsername})`
        : "Farcaster profile",
      href: farcasterUrl,
    });
  }

  if (hasEnsIdentity) {
    badges.push({
      key: "ens",
      src: ENS_BADGE_SRC,
      alt: "ENS",
      title: ensName ? `ENS (${ensName})` : "ENS profile",
      href: ensUrl,
    });
  }

  if (hasXIdentity) {
    badges.push({
      key: "x",
      src: X_BADGE_SRC,
      alt: "X",
      title: finalXHandle ? `X (@${finalXHandle})` : "X profile",
      href: finalXUrl,
    });
  }

  if (hasGithubIdentity) {
    badges.push({
      key: "github",
      src: GITHUB_BADGE_SRC,
      alt: "GitHub",
      title: finalGithubHandle ? `GitHub (${finalGithubHandle})` : "GitHub profile",
      href: finalGithubUrl,
    });
  }

  if (hasEtherscan) {
    badges.push({
      key: "etherscan",
      src: ETHERSCAN_BADGE_SRC,
      alt: "Etherscan",
      title: normalizedPrimaryAddress
        ? `View ${normalizedPrimaryAddress} on Etherscan`
        : "View on Etherscan",
      href: resolvedEtherscanUrl,
    });
  }

  return (
    <div className={mergeClasses("flex items-center gap-1", gapClassName)}>
      {badges.map((badge) =>
        badge.href ? (
          <a
            key={badge.key}
            href={badge.href}
            target="_blank"
            rel="noreferrer"
            aria-label={badge.title}
            title={badge.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badge.src}
              alt={badge.alt}
              width={size}
              height={size}
              style={{ width: dim, height: dim }}
              className={imgClass}
            />
          </a>
        ) : (
          <span key={badge.key} className="inline-flex" aria-label={badge.title} title={badge.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badge.src}
              alt={badge.alt}
              width={size}
              height={size}
              style={{ width: dim, height: dim }}
              className={imgClass}
            />
          </span>
        ),
      )}
    </div>
  );
};

const getBlockExplorerLink = (network: DirectoryNetwork, address: string) =>
  `${blockExplorerForNetwork[network]}${address}`;

const getMemberPrimaryLabel = (member: DirectoryMemberData) =>
  member.displayName || member.username || member.ensName || member.address;

const getMemberSecondaryLabel = (member: DirectoryMemberData) => {
  if (member.username) {
    return `@${member.username}`;
  }

  if (member.ensName) {
    return member.address;
  }

  return null;
};

const getMemberAvatarSrc = (member: DirectoryMemberData) => {
  const proxied = member.pfpUrl ? toFarcasterCdnUrl(member.pfpUrl) : undefined;
  return proxied ?? member.ensAvatarUrl ?? undefined;
};

const getMemberAvatarFallback = (member: DirectoryMemberData) =>
  getMemberPrimaryLabel(member)?.slice(0, 2)?.toUpperCase();

const getLastActivityLabel = (timestamp?: string | null) => {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatDistanceToNow(date, { addSuffix: true });
};

const sanitizeSortOption = (value: unknown): DirectorySortOption =>
  value === "followers" ? "followers" : "tokenHoldings";

const sortMembers = (
  members: DirectoryMemberData[],
  sortBy: DirectorySortOption,
): DirectoryMemberData[] => {
  const entries = [...members];

  if (sortBy === "followers") {
    entries.sort((a, b) => (b.followers ?? -1) - (a.followers ?? -1));
    return entries;
  }

  entries.sort((a, b) => {
    try {
      const aValue = BigInt(a.balanceRaw ?? "0");
      const bValue = BigInt(b.balanceRaw ?? "0");
      if (bValue > aValue) return 1;
      if (bValue < aValue) return -1;
      return 0;
    } catch (error) {
      return 0;
    }
  });

  return entries;
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
  const normalizedAddress = normalizeAddress(contractAddress || "");
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
    () => resolveFontFamily(settings.primaryFontFamily, "var(--user-theme-headings-font)"),
    [settings.primaryFontFamily],
  );
  const secondaryFontFamily = useMemo(
    () => resolveFontFamily(settings.secondaryFontFamily, "var(--user-theme-font)"),
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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCsvTriggerRef = useRef<string | null>(null);
  const lastManualRefreshRef = useRef<string | null>(null);

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
      return data?.tokenSymbol ? `${data.tokenSymbol} • ${network}` : null;
    }
    if (source === "farcasterChannel") {
      return channelName ? `/${channelName}` : null;
    }
    return null;
  }, [customSubheader, source, data?.tokenSymbol, network, channelName]);

  // Reset or clamp page when filter/sort/data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [includeFilter, currentSort]);

  const persistDataIfChanged = useCallback(
    async (payload: DirectoryFidgetData) => {
      const currentData = data ?? {
        members: [],
        lastUpdatedTimestamp: null,
        tokenSymbol: null,
        tokenDecimals: null,
        lastFetchSettings: undefined,
      };

      // Check if meaningful data changed (members, timestamp, token info)
      // Note: lastFetchSettings is always included in payload but comparison is still useful
      // to avoid unnecessary saves if only lastFetchSettings changed but data didn't
      const hasChanged =
        !isEqual(currentData.members, payload.members) ||
        currentData.lastUpdatedTimestamp !== payload.lastUpdatedTimestamp ||
        currentData.tokenSymbol !== payload.tokenSymbol ||
        currentData.tokenDecimals !== payload.tokenDecimals ||
        !isEqual(currentData.lastFetchSettings, payload.lastFetchSettings);

      if (hasChanged) {
        await saveData(payload);
      }
    },
    [data, saveData],
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
              const parsedTwitter = parseSocialRecordValue(
                recordsObj?.["com.twitter"] ??
                  recordsObj?.twitter ??
                  recordsObj?.["com.x"] ??
                  recordsObj?.x,
                "twitter",
              );
              const parsedGithub = parseSocialRecordValue(
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
    } finally {
      setIsRefreshing(false);
    }
  }, [isConfigured, settings.source, fetchTokenDirectory, fetchChannelDirectory, fetchCsvDirectory]);

  // Fetch when fetch-relevant settings change - React dependencies detect changes automatically
  // This effect ONLY runs when settings change, not when data updates
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (source === "csv" || !isConfigured || isRefreshing) {
      return;
    }

    // On initial mount, only fetch if we don't have data yet
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const hasData = data?.lastUpdatedTimestamp != null;
      if (!hasData) {
        void fetchDirectory();
      }
      return;
    }

    // After mount, any change to these dependencies means settings changed - fetch immediately
    void fetchDirectory();
  }, [
    source,
    network,
    normalizedAddress,
    assetType,
    debouncedChannelName,
    settings.channelFilter,
    isConfigured,
    isRefreshing,
    fetchDirectory,
    // Note: data?.lastUpdatedTimestamp NOT in deps - we don't want to fetch when data updates
  ]);

  // Separate effect for staleness check - only runs when timestamp changes
  useEffect(() => {
    if (source === "csv" || !isConfigured || isRefreshing) {
      return;
    }

    const lastUpdated = data?.lastUpdatedTimestamp
      ? Date.parse(data.lastUpdatedTimestamp)
      : 0;
    if (lastUpdated > 0) {
      const isStale = Date.now() - lastUpdated > STALE_AFTER_MS;
      if (isStale) {
        void fetchDirectory();
      }
    }
  }, [
    source,
    isConfigured,
    isRefreshing,
    data?.lastUpdatedTimestamp,
    fetchDirectory,
  ]);

  // Reset error when fetch-relevant settings change (user changed settings, clear old errors)
  useEffect(() => {
    setError(null);
  }, [
    source,
    network,
    normalizedAddress,
    assetType,
    channelName,
    settings.channelFilter,
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
    setError(null);
    void fetchDirectory();
  }, [settings.refreshToken, settings.source, fetchDirectory]);

  const filteredSortedMembers = useMemo(() => {
    if ((settings.source ?? "tokenHolders") !== "tokenHolders") {
      // Already sorted when fetched
      return data?.members ?? [];
    }
    // Optional client-side safety net: drop duplicate fids if any slip through
    const base = data?.members ?? [];
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
  }, [data?.members, includeFilter, currentSort, settings.source]);

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
    if (!data?.lastUpdatedTimestamp) {
      return null;
    }

    const date = new Date(data.lastUpdatedTimestamp);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return formatDistanceToNow(date, { addSuffix: true });
  }, [data?.lastUpdatedTimestamp]);

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
        {isRefreshing && !data?.members?.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading directory…
          </div>
        ) : displayedMembers.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyStateMessage}
          </div>
        ) : currentLayout === "list" ? (
          <ul className="divide-y divide-black/5">
            {displayedMembers.map((member) => {
              const lastActivity = getLastActivityLabel(member.lastTransferAt);
              const fallbackAddress =
                member.primaryAddress ??
                (member.address?.startsWith("0x") ? member.address : null);
              const fallbackHref =
                (settings.source ?? "tokenHolders") === "tokenHolders" &&
                includeFilter === "allHolders" &&
                !member.username &&
                fallbackAddress
                  ? getBlockExplorerLink(network, fallbackAddress)
                  : undefined;
              const primaryLabel = getMemberPrimaryLabel(member);
              const secondaryLabel = getMemberSecondaryLabel(member);
              return (
                <li key={`${member.fid ?? member.address}`} className="flex items-center gap-3 py-3">
                  <ProfileLink username={member.username} fallbackHref={fallbackHref}>
                    <Avatar className="size-11 shrink-0">
                      <AvatarImage
                        src={getMemberAvatarSrc(member)}
                        alt={primaryLabel}
                      />
                      <AvatarFallback className="bg-black/5 text-xs">
                        {!member.username && !member.ensName ? (
                          <BoringAvatar
                            size={44}
                            name={member.address}
                            variant="beam"
                          />
                        ) : (
                          getMemberAvatarFallback(member)
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </ProfileLink>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <ProfileLink
                        username={member.username}
                        fallbackHref={fallbackHref}
                        className="block truncate font-semibold hover:underline"
                      >
                        <span style={headingTextStyle}>{primaryLabel}</span>
                      </ProfileLink>
                      <BadgeIcons
                        username={member.username}
                        ensName={member.ensName}
                        ensAvatarUrl={member.ensAvatarUrl}
                        fid={member.fid}
                        primaryAddress={
                          member.primaryAddress ??
                          (member.address?.startsWith("0x") ? member.address : null)
                        }
                        etherscanUrl={
                          member.etherscanUrl ??
                          (member.address?.startsWith("0x")
                            ? buildEtherscanUrl(member.address)
                            : null)
                        }
                        xHandle={member.xHandle}
                        xUrl={member.xUrl}
                        githubHandle={member.githubHandle}
                        githubUrl={member.githubUrl}
                        size={16}
                      />
                    </div>
                    {secondaryLabel && (
                      <span className="block truncate text-xs text-muted-foreground">{secondaryLabel}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right text-xs text-muted-foreground">
                    {(settings.source ?? "tokenHolders") === "tokenHolders" && (
                      <span className="font-semibold" style={headingTextStyle}>
                        {formatTokenBalance(member.balanceFormatted)}
                        {data?.tokenSymbol ? ` ${data.tokenSymbol}` : ""}
                      </span>
                    )}
                    {typeof member.followers === "number" && (
                      <span>{`${member.followers.toLocaleString()} followers`}</span>
                    )}
                    {(settings.source ?? "tokenHolders") === "tokenHolders" && lastActivity && (
                      <span>{lastActivity}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedMembers.map((member) => {
              const lastActivity = getLastActivityLabel(member.lastTransferAt);
              const fallbackAddress =
                member.primaryAddress ??
                (member.address?.startsWith("0x") ? member.address : null);
              const fallbackHref =
                (settings.source ?? "tokenHolders") === "tokenHolders" &&
                includeFilter === "allHolders" &&
                !member.username &&
                fallbackAddress
                  ? getBlockExplorerLink(network, fallbackAddress)
                  : undefined;
              const primaryLabel = getMemberPrimaryLabel(member);
              const secondaryLabel = getMemberSecondaryLabel(member);
              return (
                <div key={`${member.fid ?? member.address}`} className="relative h-full">
                  {/* Card content as link */}
                  <ProfileLink
                    username={member.username}
                    fallbackHref={fallbackHref}
                    className="flex h-full flex-col gap-3 rounded-xl border border-black/5 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={getMemberAvatarSrc(member)}
                          alt={primaryLabel}
                        />
                        <AvatarFallback className="bg-black/5 text-sm font-semibold">
                          {!member.username && !member.ensName ? (
                            <BoringAvatar
                              size={48}
                              name={member.address}
                              variant="beam"
                            />
                          ) : (
                            getMemberAvatarFallback(member)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex flex-col text-sm">
                        <span className="block truncate font-semibold" style={headingTextStyle}>
                          {primaryLabel}
                        </span>
                        {secondaryLabel && (
                          <span className="block truncate text-xs text-muted-foreground">{secondaryLabel}</span>
                        )}
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {(settings.source ?? "tokenHolders") === "tokenHolders" && (
                        <div>
                          <dt className="uppercase tracking-wide" style={headingFontFamilyStyle}>Holdings</dt>
                          <dd className="font-semibold" style={headingTextStyle}>
                            {formatTokenBalance(member.balanceFormatted)}
                            {data?.tokenSymbol ? ` ${data.tokenSymbol}` : ""}
                          </dd>
                        </div>
                      )}
                      {typeof member.followers === "number" && (
                        <div>
                          <dt className="uppercase tracking-wide" style={headingFontFamilyStyle}>Followers</dt>
                          <dd className="font-semibold" style={headingTextStyle}>
                            {member.followers.toLocaleString()}
                          </dd>
                        </div>
                      )}
                      {(settings.source ?? "tokenHolders") === "tokenHolders" && lastActivity && (
                        <div className="col-span-2 text-xs">
                          <dt className="uppercase tracking-wide">Last activity</dt>
                          <dd>{lastActivity}</dd>
                        </div>
                      )}
                    </dl>
                  </ProfileLink>
                  {/* Badges overlay top-right */}
                  <div className="pointer-events-auto absolute right-2 top-2 z-10 flex items-center gap-1">
                    <BadgeIcons
                      username={member.username}
                      ensName={member.ensName}
                      ensAvatarUrl={member.ensAvatarUrl}
                      fid={member.fid}
                      primaryAddress={
                        member.primaryAddress ??
                        (member.address?.startsWith("0x") ? member.address : null)
                      }
                      etherscanUrl={
                        member.etherscanUrl ??
                        (member.address?.startsWith("0x")
                          ? buildEtherscanUrl(member.address)
                          : null)
                      }
                      xHandle={member.xHandle}
                      xUrl={member.xUrl}
                      githubHandle={member.githubHandle}
                      githubUrl={member.githubUrl}
                      size={18}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

type ProfileLinkProps = {
  username?: string | null;
  fallbackHref?: string;
  className?: string;
  children: React.ReactNode;
};

const ProfileLink = ({ username, fallbackHref, className, children }: ProfileLinkProps) => {
  const href = username ? `/s/${username}` : fallbackHref;

  if (!href) {
    return <div className={mergeClasses("cursor-default", className)}>{children}</div>;
  }

  const baseClassName = mergeClasses(
    "transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    className,
  );

  if (username) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={baseClassName} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

type PaginationControlsProps = {
  currentPage: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  totalCount: number;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageCount,
  onPrev,
  onNext,
  totalCount,
}) => {
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(totalCount, currentPage * PAGE_SIZE);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">
        Showing {totalCount === 0 ? 0 : start}-{end} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="rounded-full border border-black/10 px-2 py-1 text-xs font-semibold text-foreground disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-[11px] text-muted-foreground">
          Page {currentPage} / {pageCount}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={onNext}
          disabled={currentPage >= pageCount}
          className="rounded-full border border-black/10 px-2 py-1 text-xs font-semibold text-foreground disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const DirectoryModule: FidgetModule<FidgetArgs> = {
  fidget: Directory as unknown as React.FC<FidgetArgs>,
  properties: directoryProperties as unknown as FidgetProperties,
};

export default DirectoryModule;
