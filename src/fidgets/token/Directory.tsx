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
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import TextInput from "@/common/components/molecules/TextInput";
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

export type DirectoryNetwork = "base" | "polygon" | "mainnet";
export type DirectorySortOption =
  | "tokenHoldings"
  | "followers"
  | "recentlyUpdated";
export type DirectoryLayoutStyle = "cards" | "list";
export type DirectoryIncludeOption =
  | "holdersWithFarcasterAccount"
  | "allHolders";

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
}

export interface DirectoryFetchContext {
  network: DirectoryNetwork;
  contractAddress: string;
}

export interface DirectoryFidgetData extends FidgetData {
  members: DirectoryMemberData[];
  lastUpdatedTimestamp?: string | null;
  tokenSymbol?: string | null;
  tokenDecimals?: number | null;
  fetchContext?: DirectoryFetchContext;
}

export type DirectoryFidgetSettings = FidgetSettings &
  FidgetSettingsStyle & {
    network: DirectoryNetwork;
    contractAddress: string;
    sortBy: DirectorySortOption;
    layoutStyle: DirectoryLayoutStyle;
    include: DirectoryIncludeOption;
  };

const NETWORK_OPTIONS = [
  { name: "Base", value: "base" },
  { name: "Polygon", value: "polygon" },
  { name: "Ethereum Mainnet", value: "mainnet" },
] as const;

const SORT_OPTIONS = [
  { name: "Token holdings", value: "tokenHoldings" },
  { name: "Followers", value: "followers" },
  { name: "Recently Updated", value: "recentlyUpdated" },
] as const satisfies ReadonlyArray<{
  name: string;
  value: DirectorySortOption;
}>;

const LAYOUT_OPTIONS = [
  { name: "Cards", value: "cards" },
  { name: "List", value: "list" },
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
      fieldName: "network",
      displayName: "Network",
      default: "base",
      required: true,
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
      fieldName: "contractAddress",
      displayName: "Contract Address",
      default: "",
      required: true,
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
      displayName: "Include",
      default: "holdersWithFarcasterAccount",
      required: true,
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
    ...styleFields,
  ],
  size: {
    minHeight: 4,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const normalizeAddress = (address: string) => address.trim().toLowerCase();

const blockExplorerForNetwork: Record<DirectoryNetwork, string> = {
  mainnet: "https://etherscan.io/address/",
  base: "https://basescan.org/address/",
  polygon: "https://polygonscan.com/address/",
};

const getBlockExplorerLink = (network: DirectoryNetwork, address: string) =>
  `${blockExplorerForNetwork[network]}${address}`;

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

const sortMembers = (
  members: DirectoryMemberData[],
  sortBy: DirectorySortOption,
): DirectoryMemberData[] => {
  const entries = [...members];

  if (sortBy === "followers") {
    entries.sort((a, b) => (b.followers ?? -1) - (a.followers ?? -1));
    return entries;
  }

  if (sortBy === "recentlyUpdated") {
    entries.sort((a, b) => {
      const aTime = a.lastTransferAt ? Date.parse(a.lastTransferAt) : 0;
      const bTime = b.lastTransferAt ? Date.parse(b.lastTransferAt) : 0;
      return bTime - aTime;
    });
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
  const { network, contractAddress, sortBy, layoutStyle, include } = settings;
  const normalizedAddress = normalizeAddress(contractAddress || "");
  const isConfigured = normalizedAddress.length === 42;

  const [directoryData, setDirectoryData] = useState<DirectoryFidgetData>({
    members: data?.members ?? [],
    lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? null,
    tokenSymbol: data?.tokenSymbol ?? null,
    tokenDecimals: data?.tokenDecimals ?? null,
    fetchContext: data?.fetchContext,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setDirectoryData({
      members: data?.members ?? [],
      lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? null,
      tokenSymbol: data?.tokenSymbol ?? null,
      tokenDecimals: data?.tokenDecimals ?? null,
      fetchContext: data?.fetchContext,
    });
  }, [
    data?.members,
    data?.lastUpdatedTimestamp,
    data?.tokenSymbol,
    data?.tokenDecimals,
    data?.fetchContext,
  ]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const shouldRefresh = useMemo(() => {
    if (!isConfigured) {
      return false;
    }

    const lastUpdated = directoryData.lastUpdatedTimestamp
      ? Date.parse(directoryData.lastUpdatedTimestamp)
      : 0;

    if (!directoryData.fetchContext) {
      return true;
    }

    if (
      directoryData.fetchContext.network !== network ||
      normalizeAddress(directoryData.fetchContext.contractAddress) !==
        normalizedAddress
    ) {
      return true;
    }

    if (!lastUpdated) {
      return true;
    }

    return Date.now() - lastUpdated > STALE_AFTER_MS;
  }, [
    directoryData.fetchContext,
    directoryData.lastUpdatedTimestamp,
    isConfigured,
    network,
    normalizedAddress,
  ]);

  const persistDataIfChanged = useCallback(
    async (payload: DirectoryFidgetData) => {
      const hasChanged =
        !isEqual(directoryData.members, payload.members) ||
        directoryData.lastUpdatedTimestamp !== payload.lastUpdatedTimestamp ||
        directoryData.tokenSymbol !== payload.tokenSymbol ||
        directoryData.tokenDecimals !== payload.tokenDecimals ||
        !isEqual(directoryData.fetchContext, payload.fetchContext);

      setDirectoryData(payload);

      if (hasChanged) {
        await saveData(payload);
      }
    },
    [directoryData, saveData],
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
      const response = await fetch(
        `/api/token/directory?network=${network}&contractAddress=${normalizedAddress}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to load directory");
      }

      const json = (await response.json()) as {
        result: "success" | "error";
        value?: DirectoryFidgetData & { fetchContext: DirectoryFetchContext };
        error?: { message?: string };
      };

      if (json.result === "error" || !json.value) {
        throw new Error(json.error?.message || "Failed to load directory");
      }

      const sortedMembers = sortMembers(json.value.members ?? [], sortBy);
      const timestamp = new Date().toISOString();

      await persistDataIfChanged({
        members: sortedMembers,
        tokenSymbol: json.value.tokenSymbol,
        tokenDecimals: json.value.tokenDecimals,
        lastUpdatedTimestamp: timestamp,
        fetchContext: json.value.fetchContext,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isConfigured,
    network,
    normalizedAddress,
    persistDataIfChanged,
    sortBy,
  ]);

  useEffect(() => {
    if (shouldRefresh && !isRefreshing) {
      void fetchDirectory();
    }
  }, [fetchDirectory, isRefreshing, shouldRefresh]);

  const displayedMembers = useMemo(() => {
    const members = sortMembers(directoryData.members ?? [], sortBy);

    if (include === "holdersWithFarcasterAccount") {
      return members.filter((member) => Boolean(member.username));
    }

    return members;
  }, [directoryData.members, include, sortBy]);

  const emptyStateMessage =
    include === "allHolders"
      ? "No holders found for this token yet."
      : "No Farcaster profiles found for this token yet.";

  const lastUpdatedLabel = useMemo(() => {
    if (!directoryData.lastUpdatedTimestamp) {
      return null;
    }

    const date = new Date(directoryData.lastUpdatedTimestamp);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return formatDistanceToNow(date, { addSuffix: true });
  }, [directoryData.lastUpdatedTimestamp]);

  if (!isConfigured) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        <p className="font-medium">
          Connect a contract address to build the directory.
        </p>
        <p className="max-w-[40ch] text-xs text-muted-foreground/80">
          Provide an ERC-20 contract address and network to surface the Farcaster profiles holding that token.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">Community Directory</span>
          {directoryData.tokenSymbol && (
            <span className="text-muted-foreground/80">
              {directoryData.tokenSymbol} • {network}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {lastUpdatedLabel && (
            <span className="rounded-full bg-black/5 px-2 py-1 font-medium text-muted-foreground">
              Updated {lastUpdatedLabel}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchDirectory()}
            className="rounded-full border border-black/10 px-3 py-1 font-semibold text-foreground transition hover:bg-black/5"
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
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
        ) : layoutStyle === "list" ? (
          <ul className="divide-y divide-black/5">
            {displayedMembers.map((member) => {
              const lastActivity = getLastActivityLabel(member.lastTransferAt);
              const fallbackHref =
                include === "allHolders" && !member.username
                  ? getBlockExplorerLink(network, member.address)
                  : undefined;
              return (
                <li key={member.address} className="flex items-center gap-3 py-3">
                  <ProfileLink username={member.username} fallbackHref={fallbackHref}>
                    <Avatar className="size-11 shrink-0">
                      <AvatarImage
                        src={member.pfpUrl ?? undefined}
                        alt={member.displayName ?? member.username ?? member.address}
                      />
                      <AvatarFallback className="bg-black/5 text-xs">
                        {(member.displayName || member.username || member.address)
                          ?.slice(0, 2)
                          ?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </ProfileLink>
                  <div className="flex flex-1 flex-col gap-1 text-sm">
                    <ProfileLink
                      username={member.username}
                      fallbackHref={fallbackHref}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {member.displayName || member.username || member.address}
                    </ProfileLink>
                    {member.username && (
                      <span className="text-xs text-muted-foreground">@{member.username}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {member.balanceFormatted}
                      {directoryData.tokenSymbol ? ` ${directoryData.tokenSymbol}` : ""}
                    </span>
                    <span>
                      {typeof member.followers === "number"
                        ? `${member.followers.toLocaleString()} followers`
                        : "Followers n/a"}
                    </span>
                    {lastActivity && <span>{lastActivity}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedMembers.map((member) => {
              const lastActivity = getLastActivityLabel(member.lastTransferAt);
              const fallbackHref =
                include === "allHolders" && !member.username
                  ? getBlockExplorerLink(network, member.address)
                  : undefined;
              return (
                <ProfileLink
                  key={member.address}
                  username={member.username}
                  fallbackHref={fallbackHref}
                  className="flex h-full flex-col gap-3 rounded-xl border border-black/5 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage
                        src={member.pfpUrl ?? undefined}
                        alt={member.displayName ?? member.username ?? member.address}
                      />
                      <AvatarFallback className="bg-black/5 text-sm font-semibold">
                        {(member.displayName || member.username || member.address)
                          ?.slice(0, 2)
                          ?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-foreground">
                        {member.displayName || member.username || member.address}
                      </span>
                      {member.username && (
                        <span className="text-xs text-muted-foreground">@{member.username}</span>
                      )}
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <div>
                      <dt className="uppercase tracking-wide">Holdings</dt>
                      <dd className="font-semibold text-foreground">
                        {member.balanceFormatted}
                        {directoryData.tokenSymbol ? ` ${directoryData.tokenSymbol}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-wide">Followers</dt>
                      <dd className="font-semibold text-foreground">
                        {typeof member.followers === "number"
                          ? member.followers.toLocaleString()
                          : "n/a"}
                      </dd>
                    </div>
                    {lastActivity && (
                      <div className="col-span-2 text-xs">
                        <dt className="uppercase tracking-wide">Last activity</dt>
                        <dd>{lastActivity}</dd>
                      </div>
                    )}
                  </dl>
                </ProfileLink>
              );
            })}
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

const DirectoryModule: FidgetModule<FidgetArgs> = {
  fidget: Directory as unknown as React.FC<FidgetArgs>,
  properties: directoryProperties as unknown as FidgetProperties,
};

export default DirectoryModule;
