"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, isAddress, parseEther } from "viem";
import { base, mainnet, optimism } from "viem/chains";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import { Input } from "@/common/components/atoms/input";
import { Button } from "@/common/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import { Separator } from "@/common/components/atoms/separator";
import { DAO_OPTIONS } from "@/constants/basedDaos";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import { wagmiConfig } from "@/common/providers/Wagmi";
import { DaoSelector } from "@/common/components/molecules/DaoSelector";

const BUILDER_SUBGRAPH_ENDPOINTS: Record<string, string> = {
  base:
    "https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-mainnet/stable/gn",
  mainnet: "https://api.thegraph.com/subgraphs/name/neokry/nouns-builder-mainnet",
  optimism:
    "https://api.thegraph.com/subgraphs/name/neokry/noun-builder-optimism-mainnet",
};

const SUPPORTED_NETWORKS = [
  { label: "Base", value: "base", chain: base },
  { label: "Ethereum", value: "mainnet", chain: mainnet },
  { label: "Optimism", value: "optimism", chain: optimism },
] as const;

type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number]["value"];

type DaoOption = {
  name: string;
  contract: string;
  graphUrl: string;
  icon?: string;
};

type BuilderAuction = {
  id: string;
  endTime: number;
  startTime: number;
  settled: boolean;
  tokenId: string;
  imageUrl?: string;
  highestBidAmount?: string;
  highestBidder?: string;
  winningBidAmount?: string;
  winningBidder?: string;
};

type BuilderDao = {
  auctionAddress?: `0x${string}`;
  name?: string;
};

const ACTIVE_AUCTION_QUERY = /* GraphQL */ `
  query ActiveAuction($dao: ID!) {
    dao(id: $dao) {
      auctionAddress
      name
    }
    auctions(
      where: { dao: $dao, settled: false }
      orderBy: startTime
      orderDirection: desc
      first: 1
    ) {
      id
      endTime
      startTime
      settled
      token {
        tokenId
        image
      }
      highestBid {
        amount
        bidder
      }
      winningBid {
        amount
        bidder
      }
    }
  }
`;

const PAST_AUCTIONS_QUERY = /* GraphQL */ `
  query PastAuctions($dao: ID!, $first: Int!, $skip: Int!) {
    auctions(
      where: { dao: $dao, settled: true }
      orderBy: endTime
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      endTime
      token {
        tokenId
        image
      }
      winningBid {
        amount
        bidder
      }
      highestBid {
        amount
        bidder
      }
    }
  }
`;

const auctionAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "auction",
    inputs: [],
    outputs: [
      { name: "tokenId", type: "uint256" },
      { name: "highestBid", type: "uint256" },
      { name: "highestBidder", type: "address" },
      { name: "startTime", type: "uint40" },
      { name: "endTime", type: "uint40" },
      { name: "settled", type: "bool" },
    ],
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "createBid",
    inputs: [{ name: "_tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "settleAuction",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "settleCurrentAndCreateNewAuction",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

async function runGraphQuery<T>(endpoint: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const json = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(", "));
  }

  if (!json.data) {
    throw new Error("No data returned from subgraph");
  }

  return json.data;
}

const toHttpUri = (uri?: string | null): string | undefined => {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
};

const formatEth = (value?: string | null): string => {
  if (!value) return "0";
  const asBigInt = BigInt(value);
  const formatted = Number.parseFloat(formatEther(asBigInt));
  return formatted.toFixed(4);
};

const shortenAddress = (address?: string | null): string => {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const AuctionArt: React.FC<{ imageUrl?: string; tokenId?: string }> = ({ imageUrl, tokenId }) => {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`Token ${tokenId}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          No artwork
        </div>
      )}
    </div>
  );
};

const PastAuctionCard: React.FC<{ auction: BuilderAuction }> = ({ auction }) => (
  <Card className="h-full">
    <CardContent className="space-y-3 p-4">
      <AuctionArt imageUrl={auction.imageUrl} tokenId={auction.tokenId} />
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Token #{auction.tokenId}</span>
        <span>{new Date(auction.endTime * 1000).toLocaleDateString()}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="text-muted-foreground">Final bid</div>
        <div className="text-lg font-semibold">{formatEth(auction.winningBidAmount ?? auction.highestBidAmount)} ETH</div>
      </div>
      <div className="space-y-1 text-sm">
        <div className="text-muted-foreground">Winner</div>
        <div className="font-mono">{shortenAddress(auction.winningBidder ?? auction.highestBidder)}</div>
      </div>
    </CardContent>
  </Card>
);

const Countdown: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [remaining, setRemaining] = useState(endTime * 1000 - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(endTime * 1000 - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (remaining <= 0) {
    return <span className="text-red-500">Auction ended</span>;
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return (
    <span>
      {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds
        .toString()
        .padStart(2, "0")}
    </span>
  );
};

const ActiveAuctionCard: React.FC<{
  auction: BuilderAuction;
  dao?: BuilderDao;
  onBid: (value: string) => Promise<void>;
  onSettle: () => Promise<void>;
  submitting: boolean;
  disabled: boolean;
}> = ({ auction, dao, onBid, onSettle, submitting, disabled }) => {
  const [bidValue, setBidValue] = useState<string>("");
  const endsInFuture = auction.endTime * 1000 > Date.now();
  const currentBid = auction.highestBidAmount ?? auction.winningBidAmount ?? "0";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{dao?.name ?? "Active Auction"}</CardTitle>
            <CardDescription>Token #{auction.tokenId}</CardDescription>
          </div>
          <div className={mergeClasses("rounded-full px-3 py-1 text-xs font-semibold", endsInFuture ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}> 
            {endsInFuture ? "Live" : "Needs settlement"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <AuctionArt imageUrl={auction.imageUrl} tokenId={auction.tokenId} />

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <div className="text-muted-foreground">Current bid</div>
            <div className="text-lg font-semibold">{formatEth(currentBid)} ETH</div>
          </div>
          <div>
            <div className="text-muted-foreground">Highest bidder</div>
            <div className="font-mono text-sm">{shortenAddress(auction.highestBidder ?? auction.winningBidder)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Ends</div>
            <div>{new Date(auction.endTime * 1000).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Countdown</div>
            <div className="font-mono">{endsInFuture ? <Countdown endTime={auction.endTime} /> : "Ended"}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label className="text-sm text-muted-foreground">Bid amount (ETH)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={bidValue}
              onChange={(event) => setBidValue(event.target.value)}
              placeholder="0.05"
              disabled={submitting || disabled || !endsInFuture}
            />
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            <Button
              disabled={submitting || disabled || !endsInFuture || !bidValue}
              onClick={() => onBid(bidValue)}
            >
              Place bid
            </Button>
            <Button
              variant="outline"
              disabled={submitting || disabled || endsInFuture}
              onClick={onSettle}
            >
              Settle auction
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export type NounishAuctionsSettings = {
  selectedDao: DaoOption;
  customDaoContract?: string;
  builderNetwork?: SupportedNetwork;
  customGraphUrl?: string;
} & FidgetSettingsStyle;

export const nounishAuctionsConfig: FidgetProperties = {
  fidgetName: "Nounish Auctions",
  icon: 0x1f3b0,
  fields: [
    {
      fieldName: "selectedDao",
      displayName: "Select DAO",
      displayNameHint: "Choose a Builder DAO to prefill address and subgraph",
      default: DAO_OPTIONS.find((dao) => dao.name === "Gnars") ?? DAO_OPTIONS[0],
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <DaoSelector {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "customDaoContract",
      displayName: "Custom DAO contract",
      displayNameHint: "Override the DAO address if it is not listed",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <Input {...props} placeholder="0x..." />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "builderNetwork",
      displayName: "Builder network",
      displayNameHint: "Network where the DAO is deployed",
      default: "base",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <Select value={props.value as string} onValueChange={(value) => props.onChange(value as SupportedNetwork)}>
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_NETWORKS.map((network) => (
                <SelectItem key={network.value} value={network.value}>
                  {network.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "customGraphUrl",
      displayName: "Custom subgraph URL",
      displayNameHint: "Provide a custom Builder subgraph endpoint if needed",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <Input {...props} placeholder="https://..." />
        </WithMargin>
      ),
      group: "settings",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 8,
    maxHeight: 36,
    minWidth: 6,
    maxWidth: 36,
  },
};

const pageSize = 9;

export const NounishAuctions: React.FC<FidgetArgs<NounishAuctionsSettings>> = ({ settings }) => {
  const initialDao = settings.selectedDao ?? DAO_OPTIONS[0];
  const [activeAuction, setActiveAuction] = useState<BuilderAuction | null>(null);
  const [daoDetails, setDaoDetails] = useState<BuilderDao | null>(null);
  const [pastAuctions, setPastAuctions] = useState<BuilderAuction[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingPast, setLoadingPast] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [txPending, setTxPending] = useState(false);
  const [hasMorePast, setHasMorePast] = useState(true);
  const [daoChoice, setDaoChoice] = useState<DaoOption>(initialDao);
  const [customAddress, setCustomAddress] = useState(settings.customDaoContract ?? "");
  const [networkValue, setNetworkValue] = useState<SupportedNetwork>(
    (settings.builderNetwork ?? "base") as SupportedNetwork,
  );
  const [customGraphUrl, setCustomGraphUrl] = useState(settings.customGraphUrl ?? "");

  const { address, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const daoAddress = useMemo(() => {
    const override = customAddress.trim();
    const fromSelector = daoChoice?.contract;
    return (override && isAddress(override) ? override : fromSelector) as `0x${string}` | undefined;
  }, [customAddress, daoChoice?.contract]);

  const resolvedNetwork =
    SUPPORTED_NETWORKS.find((item) => item.value === networkValue) ?? SUPPORTED_NETWORKS[0];

  const subgraphUrl =
    customGraphUrl ||
    daoChoice?.graphUrl ||
    BUILDER_SUBGRAPH_ENDPOINTS[networkValue] ||
    BUILDER_SUBGRAPH_ENDPOINTS.base;

  const hasValidDao = Boolean(daoAddress);

  const fetchActiveAuction = useCallback(async () => {
    if (!hasValidDao) return;
    setLoadingActive(true);
    setError(null);
    try {
      const data = await runGraphQuery<{
        dao?: BuilderDao;
        auctions: Array<{
          id: string;
          endTime: string;
          startTime: string;
          settled: boolean;
          token?: { tokenId: string; image?: string | null } | null;
          highestBid?: { amount: string; bidder: string } | null;
          winningBid?: { amount: string; bidder: string } | null;
        }>;
      }>(subgraphUrl, ACTIVE_AUCTION_QUERY, { dao: daoAddress?.toLowerCase() });

      const auction = data.auctions?.[0];
      setDaoDetails(data.dao ?? null);

      if (auction) {
        setActiveAuction({
          id: auction.id,
          endTime: Number(auction.endTime),
          startTime: Number(auction.startTime),
          settled: auction.settled,
          tokenId: auction.token?.tokenId ?? "",
          imageUrl: toHttpUri(auction.token?.image),
          highestBidAmount: auction.highestBid?.amount ?? undefined,
          highestBidder: auction.highestBid?.bidder,
          winningBidAmount: auction.winningBid?.amount ?? undefined,
          winningBidder: auction.winningBid?.bidder,
        });
      } else {
        setActiveAuction(null);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoadingActive(false);
    }
  }, [daoAddress, hasValidDao, subgraphUrl]);

  const fetchPastAuctions = useCallback(
    async (pageIndex: number, reset = false) => {
      if (!hasValidDao) return;
      setLoadingPast(true);
      setError(null);
      if (reset) {
        setHasMorePast(true);
      }
      try {
        const data = await runGraphQuery<{
          auctions: Array<{
            id: string;
            endTime: string;
            token?: { tokenId: string; image?: string | null } | null;
            winningBid?: { amount: string; bidder: string } | null;
            highestBid?: { amount: string; bidder: string } | null;
          }>;
        }>(subgraphUrl, PAST_AUCTIONS_QUERY, {
          dao: daoAddress?.toLowerCase(),
          first: pageSize,
          skip: pageIndex * pageSize,
        });

        const mapped = (data.auctions || []).map((auction) => ({
          id: auction.id,
          endTime: Number(auction.endTime),
          startTime: Number(auction.endTime),
          settled: true,
          tokenId: auction.token?.tokenId ?? "",
          imageUrl: toHttpUri(auction.token?.image),
          highestBidAmount: auction.highestBid?.amount ?? undefined,
          highestBidder: auction.highestBid?.bidder,
          winningBidAmount: auction.winningBid?.amount ?? undefined,
          winningBidder: auction.winningBid?.bidder,
        }));

        setPastAuctions((prev) => (reset ? mapped : [...prev, ...mapped]));
        if (mapped.length < pageSize) {
          setHasMorePast(false);
        }
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoadingPast(false);
      }
    },
    [daoAddress, hasValidDao, subgraphUrl],
  );

  useEffect(() => {
    setPage(0);
    fetchActiveAuction();
    fetchPastAuctions(0, true);
  }, [fetchActiveAuction, fetchPastAuctions, refreshKey]);

  const ensureConnection = useCallback(async () => {
    if (!connectAsync || !switchChainAsync) return;
    if (!address) {
      const connector = connectors[0];
      if (!connector) throw new Error("No wallet connector available");
      await connectAsync({ connector, chainId: resolvedNetwork.chain.id });
      return;
    }
    if (chainId !== resolvedNetwork.chain.id) {
      await switchChainAsync({ chainId: resolvedNetwork.chain.id });
    }
  }, [address, chainId, connectAsync, connectors, resolvedNetwork.chain.id, switchChainAsync]);

  const handleBid = useCallback(
    async (value: string) => {
      if (!activeAuction || !daoDetails?.auctionAddress) return;
      const trimmed = value.trim();
      if (!trimmed || Number(trimmed) <= 0) {
        setError("Enter a valid bid amount");
        return;
      }
      setError(null);
      try {
        setTxPending(true);
        await ensureConnection();
        const hash = await writeContractAsync({
          address: daoDetails.auctionAddress,
          abi: auctionAbi,
          functionName: "createBid",
          args: [BigInt(activeAuction.tokenId)],
          value: parseEther(trimmed),
          chainId: resolvedNetwork.chain.id,
        });
        await waitForTransactionReceipt(wagmiConfig, { hash, chainId: resolvedNetwork.chain.id });
        setRefreshKey((prev) => prev + 1);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setTxPending(false);
      }
    },
    [activeAuction, daoDetails?.auctionAddress, ensureConnection, resolvedNetwork.chain.id, writeContractAsync],
  );

  const handleSettle = useCallback(async () => {
    if (!activeAuction || !daoDetails?.auctionAddress) return;
    setError(null);
    try {
      setTxPending(true);
      await ensureConnection();
      const hash = await writeContractAsync({
        address: daoDetails.auctionAddress,
        abi: auctionAbi,
        functionName: "settleCurrentAndCreateNewAuction",
        args: [],
        chainId: resolvedNetwork.chain.id,
      });
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: resolvedNetwork.chain.id });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setTxPending(false);
    }
  }, [activeAuction, daoDetails?.auctionAddress, ensureConnection, resolvedNetwork.chain.id, writeContractAsync]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPastAuctions(nextPage);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4" style={{ fontFamily: settings.fontFamily, color: settings.fontColor }}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>DAO</CardTitle>
            <CardDescription>Select a Builder DAO</CardDescription>
          </CardHeader>
          <CardContent>
            <DaoSelector
              onChange={(dao) => {
                setDaoChoice(dao);
                setRefreshKey((prev) => prev + 1);
              }}
              value={daoChoice}
            />
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div>Address: {daoAddress ?? "-"}</div>
              <div>Network: {resolvedNetwork.label}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom DAO</CardTitle>
            <CardDescription>Override DAO address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={customAddress}
              placeholder="0x..."
              onChange={(event) => setCustomAddress(event.target.value)}
              onBlur={() => setRefreshKey((prev) => prev + 1)}
            />
            <Select
              value={networkValue}
              onValueChange={(value) => {
                setNetworkValue(value as SupportedNetwork);
                setRefreshKey((prev) => prev + 1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_NETWORKS.map((network) => (
                  <SelectItem key={network.value} value={network.value}>
                    {network.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subgraph endpoint</CardTitle>
            <CardDescription>Override if your DAO uses a custom URL</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={customGraphUrl}
              placeholder="https://..."
              onChange={(event) => setCustomGraphUrl(event.target.value)}
              onBlur={() => setRefreshKey((prev) => prev + 1)}
            />
            <div className="mt-2 text-xs text-muted-foreground">Current endpoint: {subgraphUrl}</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!hasValidDao && (
        <div className="text-sm text-muted-foreground">Enter a valid DAO contract address to load auctions.</div>
      )}

      {loadingActive && <div className="text-sm text-muted-foreground">Loading active auction...</div>}

      {hasValidDao && !loadingActive && activeAuction && (
        <ActiveAuctionCard
          auction={activeAuction}
          dao={daoDetails ?? undefined}
          onBid={handleBid}
          onSettle={handleSettle}
          submitting={txPending}
          disabled={!daoDetails?.auctionAddress}
        />
      )}

      {hasValidDao && !loadingActive && !activeAuction && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No active auction found for this DAO.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Past auctions</h3>
          {loadingPast && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>
        {pastAuctions.length === 0 && !loadingPast ? (
          <div className="text-sm text-muted-foreground">No past auctions yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastAuctions.map((auction) => (
              <PastAuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
        {pastAuctions.length >= pageSize && hasMorePast && (
          <div className="flex justify-center">
            <Button variant="outline" disabled={loadingPast || !hasMorePast} onClick={handleLoadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  fidget: NounishAuctions,
  properties: nounishAuctionsConfig,
} as FidgetModule<FidgetArgs<NounishAuctionsSettings>>;
