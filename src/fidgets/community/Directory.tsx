import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import TextInput from "@/common/components/molecules/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/atoms/avatar";
import { Button } from "@/common/components/atoms/button";
import {
  FidgetArgs,
  FidgetData,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import axiosBackend from "@/common/data/api/backend";
import { isEqual } from "lodash";
import { LuRefreshCcw } from "react-icons/lu";
import { PiUsersThreeFill } from "react-icons/pi";
import { defaultStyleFields, WithMargin } from "../helpers";

type DirectoryNetwork = "base" | "polygon" | "ethereum";

type DirectorySortBy = "tokenHoldings" | "followers" | "recentlyUpdated";

type DirectoryStyle = "cards" | "list";

type DirectoryFidgetSettings = {
  network: DirectoryNetwork;
  contractAddress: string;
  sortBy: DirectorySortBy;
  style: DirectoryStyle;
} & FidgetSettingsStyle;

type DirectoryMemberData = {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  followerCount?: number;
  tokenBalance?: {
    units: string;
    formatted: string;
    symbol?: string;
    decimals?: number;
  };
  lastUpdatedAt?: string;
};

type DirectoryFidgetData = FidgetData & {
  members?: DirectoryMemberData[];
  lastUpdatedTimestamp?: string;
  cachedNetwork?: DirectoryNetwork;
  cachedContractAddress?: string;
  sortBy?: DirectorySortBy;
  tokenSymbol?: string;
  tokenDecimals?: number;
};

type DirectoryApiResponse = {
  members: DirectoryMemberData[];
  fetchedAt: string;
  network: DirectoryNetwork;
  contractAddress: string;
  token?: { symbol?: string; decimals?: number };
  sortBy: DirectorySortBy;
};

const NETWORK_OPTIONS = [
  { name: "Base", value: "base" satisfies DirectoryNetwork },
  { name: "Polygon", value: "polygon" satisfies DirectoryNetwork },
  { name: "Ethereum Mainnet", value: "ethereum" satisfies DirectoryNetwork },
];

const SORT_OPTIONS = [
  { name: "Token holdings", value: "tokenHoldings" satisfies DirectorySortBy },
  { name: "Followers", value: "followers" satisfies DirectorySortBy },
  { name: "Recently updated", value: "recentlyUpdated" satisfies DirectorySortBy },
];

const STYLE_OPTIONS = [
  { name: "Cards", value: "cards" satisfies DirectoryStyle },
  { name: "List", value: "list" satisfies DirectoryStyle },
];

const ONE_HOUR_MS = 60 * 60 * 1000;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const directoryProperties: FidgetProperties<DirectoryFidgetSettings> = {
  fidgetName: "Directory",
  icon: 0x1f465,
  mobileIcon: <PiUsersThreeFill size={20} />,
  fields: [
    {
      fieldName: "network",
      displayName: "Network",
      default: "base",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector {...props} settings={NETWORK_OPTIONS} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "contractAddress",
      displayName: "Contract Address",
      default: "",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} placeholder="0x..." className="[&_label]:!normal-case" />
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
          <SettingsSelector {...props} settings={SORT_OPTIONS} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "style",
      displayName: "Style",
      default: "cards",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector {...props} settings={STYLE_OPTIONS} />
        </WithMargin>
      ),
      group: "settings",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 4,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const isValidAddress = (address: string) => ADDRESS_REGEX.test(address);

const toBigInt = (value?: string): bigint => {
  if (!value) return 0n;
  try {
    return BigInt(value);
  } catch (error) {
    return 0n;
  }
};

const sortMembers = (
  members: DirectoryMemberData[],
  sortBy: DirectorySortBy,
): DirectoryMemberData[] => {
  const copy = [...members];

  switch (sortBy) {
    case "followers":
      copy.sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0));
      break;
    case "recentlyUpdated":
      copy.sort((a, b) => {
        const aTimeRaw = a.lastUpdatedAt ? Date.parse(a.lastUpdatedAt) : 0;
        const bTimeRaw = b.lastUpdatedAt ? Date.parse(b.lastUpdatedAt) : 0;
        const aTime = Number.isNaN(aTimeRaw) ? 0 : aTimeRaw;
        const bTime = Number.isNaN(bTimeRaw) ? 0 : bTimeRaw;
        if (bTime === aTime) return 0;
        return bTime - aTime;
      });
      break;
    case "tokenHoldings":
    default:
      copy.sort((a, b) => {
        const aUnits = toBigInt(a.tokenBalance?.units);
        const bUnits = toBigInt(b.tokenBalance?.units);
        if (aUnits === bUnits) return 0;
        return aUnits > bUnits ? -1 : 1;
      });
  }

  return copy;
};

const formatFollowers = (value?: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact" }).format(value ?? 0);

const formatLastUpdated = (timestamp?: string) => {
  if (!timestamp) return "Unknown";
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) return "Unknown";
  return new Date(parsed).toLocaleString();
};

const Directory: React.FC<
  FidgetArgs<DirectoryFidgetSettings, DirectoryFidgetData>
> = ({ settings, data, saveData }) => {
  const normalizedAddress = settings.contractAddress.trim().toLowerCase();
  const addressIsValid = normalizedAddress.length > 0 && isValidAddress(normalizedAddress);
  const [members, setMembers] = useState<DirectoryMemberData[]>(
    data?.members ?? [],
  );
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(
    data?.lastUpdatedTimestamp,
  );
  const [tokenSymbol, setTokenSymbol] = useState<string | undefined>(
    data?.tokenSymbol,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMembers(data?.members ?? []);
  }, [data?.members]);

  useEffect(() => {
    setLastUpdated(data?.lastUpdatedTimestamp);
  }, [data?.lastUpdatedTimestamp]);

  useEffect(() => {
    setTokenSymbol(data?.tokenSymbol);
  }, [data?.tokenSymbol]);

  const dataMatchesSettings =
    data?.cachedNetwork === settings.network &&
    data?.cachedContractAddress === normalizedAddress;

  const isStale = useMemo(() => {
    if (!lastUpdated) return true;
    const parsed = Date.parse(lastUpdated);
    if (Number.isNaN(parsed)) return true;
    return Date.now() - parsed > ONE_HOUR_MS;
  }, [lastUpdated]);

  const hasCachedMembers = Array.isArray(data?.members);

  const shouldFetch =
    addressIsValid &&
    (!dataMatchesSettings || (!hasCachedMembers && !isLoading) || isStale);

  const fetchDirectory = useCallback(async () => {
    if (!addressIsValid) {
      setError("Enter a valid contract address to load the directory.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { data: response } = await axiosBackend.get<DirectoryApiResponse>(
        "/api/farcaster/neynar/token/directory",
        {
          params: {
            network: settings.network,
            contractAddress: normalizedAddress,
            sortBy: settings.sortBy,
          },
        },
      );

      const nextData: DirectoryFidgetData = {
        members: response.members,
        lastUpdatedTimestamp: response.fetchedAt,
        cachedNetwork: response.network,
        cachedContractAddress: response.contractAddress,
        sortBy: response.sortBy,
        tokenSymbol: response.token?.symbol,
        tokenDecimals: response.token?.decimals,
      };

      setMembers(response.members);
      setLastUpdated(response.fetchedAt);
      setTokenSymbol(response.token?.symbol);

      if (!isEqual(data, nextData)) {
        await saveData(nextData);
      }
    } catch (err) {
      let message = "Failed to load directory";
      if (isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === "string") {
          message = data;
        } else if (data && typeof data === "object") {
          const errorMessage = (data as { error?: string; message?: string }).error;
          const messageField = (data as { error?: string; message?: string }).message;
          message = errorMessage || messageField || err.message;
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [addressIsValid, data, normalizedAddress, saveData, settings.network, settings.sortBy]);

  useEffect(() => {
    if (shouldFetch && !isLoading) {
      void fetchDirectory();
    }
  }, [fetchDirectory, isLoading, shouldFetch]);

  useEffect(() => {
    if (!dataMatchesSettings || !data?.members) {
      return;
    }
    const storedSort = data.sortBy ?? "tokenHoldings";
    if (storedSort === settings.sortBy) {
      return;
    }

    const sortedMembers = sortMembers(data.members, settings.sortBy);
    if (isEqual(sortedMembers, data.members)) {
      return;
    }

    setMembers(sortedMembers);
    const updatedData: DirectoryFidgetData = {
      ...data,
      members: sortedMembers,
      sortBy: settings.sortBy,
    };
    void saveData(updatedData);
  }, [data, dataMatchesSettings, saveData, settings.sortBy]);

  const displayedMembers = useMemo(
    () => sortMembers(members, settings.sortBy),
    [members, settings.sortBy],
  );

  const directoryTitle = useMemo(() => {
    if (!addressIsValid) {
      return "Enter a contract address to see holders";
    }
    if (!displayedMembers.length && !isLoading) {
      return "No members found";
    }
    return `Community members (${displayedMembers.length})`;
  }, [addressIsValid, displayedMembers.length, isLoading]);

  const handleRefresh = useCallback(() => {
    if (isLoading) return;
    void fetchDirectory();
  }, [fetchDirectory, isLoading]);

  const renderMemberCard = (member: DirectoryMemberData) => {
    const linkHref = member.username ? `/s/${member.username}` : undefined;
    const displayName = member.displayName || member.username || `FID ${member.fid}`;
    const followerLabel = `${formatFollowers(member.followerCount)} followers`;
    const balanceLabel = member.tokenBalance?.formatted ?? "0";
    const balanceSymbol = member.tokenBalance?.symbol ?? tokenSymbol ?? "";
    const balanceDisplay = balanceSymbol
      ? `${balanceLabel} ${balanceSymbol}`
      : balanceLabel;

    const content = (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 shadow-sm transition-colors hover:border-primary/60">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={member.pfpUrl} alt={displayName} />
            <AvatarFallback>
              {(member.displayName || member.username || "?")
                .slice(0, 1)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {member.username ? `@${member.username}` : `FID ${member.fid}`}
            </span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium text-foreground">{balanceDisplay}</p>
            <p className="text-xs text-muted-foreground">{followerLabel}</p>
          </div>
        </div>
        {member.lastUpdatedAt && (
          <p className="text-xs text-muted-foreground">
            Last activity: {formatLastUpdated(member.lastUpdatedAt)}
          </p>
        )}
      </div>
    );

    return linkHref ? (
      <Link key={member.fid} href={linkHref} target="_blank" rel="noreferrer">
        {content}
      </Link>
    ) : (
      <div key={member.fid}>{content}</div>
    );
  };

  const renderMemberRow = (member: DirectoryMemberData) => {
    const linkHref = member.username ? `/s/${member.username}` : undefined;
    const displayName = member.displayName || member.username || `FID ${member.fid}`;
    const followerLabel = `${formatFollowers(member.followerCount)} followers`;
    const balanceLabel = member.tokenBalance?.formatted ?? "0";
    const balanceSymbol = member.tokenBalance?.symbol ?? tokenSymbol ?? "";
    const balanceDisplay = balanceSymbol
      ? `${balanceLabel} ${balanceSymbol}`
      : balanceLabel;

    const row = (
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,160px)_minmax(0,140px)] items-center gap-4 rounded-lg border border-border bg-background/60 px-4 py-3 text-sm hover:border-primary/60">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={member.pfpUrl} alt={displayName} />
            <AvatarFallback>
              {(member.displayName || member.username || "?")
                .slice(0, 1)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {member.username ? `@${member.username}` : `FID ${member.fid}`}
            </span>
          </div>
        </div>
        <div className="text-sm font-medium text-foreground">{balanceDisplay}</div>
        <div className="text-xs text-muted-foreground">
          <div>{followerLabel}</div>
          {member.lastUpdatedAt && (
            <div>Last activity: {formatLastUpdated(member.lastUpdatedAt)}</div>
          )}
        </div>
      </div>
    );

    return linkHref ? (
      <Link key={member.fid} href={linkHref} target="_blank" rel="noreferrer">
        {row}
      </Link>
    ) : (
      <div key={member.fid}>{row}</div>
    );
  };

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span>{directoryTitle}</span>
          {isLoading && <LuRefreshCcw className="size-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lastUpdated && !isLoading && (
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            withIcon
            onClick={handleRefresh}
            disabled={!addressIsValid || isLoading}
          >
            <LuRefreshCcw className="size-4" /> Refresh
          </Button>
        </div>
      </div>
      {!addressIsValid && (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          Enter a valid EVM contract address to populate the directory.
        </div>
      )}
      {addressIsValid && error && (
        <div className="px-4 py-2 text-sm text-red-500">{error}</div>
      )}
      {addressIsValid && !error && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {displayedMembers.length === 0 && !isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No token holders found for this contract.
            </div>
          ) : settings.style === "list" ? (
            <div className="flex flex-col gap-2" data-testid="directory-list-view">
              {displayedMembers.map((member) => renderMemberRow(member))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
              data-testid="directory-card-view"
            >
              {displayedMembers.map((member) => renderMemberCard(member))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  fidget: Directory,
  properties: directoryProperties,
} as FidgetModule<FidgetArgs<DirectoryFidgetSettings, DirectoryFidgetData>>;
