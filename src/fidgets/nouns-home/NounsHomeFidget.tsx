'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  WagmiProvider,
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
  useWriteContract,
} from "wagmi";
import { mainnet } from "wagmi/chains";
import { simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import AuctionHero from "./components/AuctionHero";
import BidModal from "./components/BidModal";
import PastAuctions from "./components/PastAuctions";
import StatsRow from "./components/StatsRow";
import {
  AlreadyOwnSection,
  FaqAccordion,
  GetANounSection,
  GovernedByYouSection,
  JourneySection,
  LearnSection,
  NounsFundsIdeasSection,
  TheseAreNounsStrip,
  ThisIsNounsSection,
} from "./components/Sections";
import { nounsWagmiConfig, REQUIRED_CHAIN_ID } from "./wagmiConfig";
import { nounsPublicClient, NOUNS_AH_ADDRESS } from "./config";
import { NounsAuctionHouseV3Abi } from "./abis";
import type { Auction, Settlement } from "./types";
import { formatCountdown, formatEth, getAuctionStatus, shortAddress } from "./utils";
import { useEthUsdPrice, formatUsd } from "./price";
import { fetchExecutedProposalsCount, fetchCurrentTokenHolders, fetchLatestAuction } from "./subgraph";
import LinkOut from "./LinkOut";

const ConnectControl: React.FC = () => {
  const { isConnected, address, chainId } = useAccount();
  const { connectAsync, connectors, status } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    try {
      setError(null);
      if (isConnected) {
        await disconnectAsync();
        return;
      }
      const preferred = connectors[0];
      if (!preferred) {
        setError("No wallet connectors available");
        return;
      }
      await connectAsync({ connector: preferred, chainId: REQUIRED_CHAIN_ID });
    } catch (err) {
      console.error("Connect error", err);
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    }
  };

  const label = isConnected
    ? chainId && chainId !== REQUIRED_CHAIN_ID
      ? `Wrong network (${chainId})`
      : shortAddress(address)
    : "Connect wallet";

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <button
        type="button"
        onClick={handlePress}
        className="rounded-full bg-black px-4 py-2 font-semibold text-white transition hover:bg-black/80"
        disabled={status === "pending"}
      >
        {status === "pending" ? "Connecting..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};

const useAuctionData = () => {
  const [auction, setAuction] = useState<Auction | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchAuction = useCallback(async () => {
    try {
      setLoading(true);
      // Prefer subgraph for resiliency and speed
      try {
        const sg = await fetchLatestAuction();
        if (sg) {
          const normalized: Auction = {
            nounId: BigInt(sg.id),
            amount: BigInt(sg.amount),
            startTime: BigInt(sg.startTime),
            endTime: BigInt(sg.endTime),
            bidder: (sg.bidder?.id ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
            settled: Boolean(sg.settled),
          };
          setAuction(normalized);
          return normalized;
        }
      } catch (_) {
        // fall through to on-chain
      }

      const data = await nounsPublicClient.readContract({
        address: NOUNS_AH_ADDRESS,
        abi: NounsAuctionHouseV3Abi,
        functionName: "auction",
      });
      const [nounId, amount, startTime, endTime, bidder, settled] = data as unknown as [
        bigint,
        bigint,
        bigint,
        bigint,
        `0x${string}`,
        boolean,
      ];
      const normalized: Auction = { nounId, amount, startTime, endTime, bidder, settled };
      setAuction(normalized);
      return normalized;
    } catch (error) {
      console.error("Failed to load auction", error);
      setAuction(undefined);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fetchAuction();
        if (!mounted) return;
        setAuction(result);
      } catch (error) {
        console.error(error);
      }
    };
    load();
    const interval = setInterval(load, 15_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchAuction]);

  return {
    auction,
    loading,
    refetch: fetchAuction,
  };
};

const pageSize = 12;

const useSettlements = (auction?: Auction) => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadSettlements = useCallback(
    async (pageToLoad: number, reset = false) => {
      if (!auction) return;
      setIsLoading(true);
      try {
        const currentAuctionId = Number(auction.nounId);
        const latestSettledId = auction.settled
          ? currentAuctionId
          : currentAuctionId - 1;
        if (latestSettledId < 0) {
          setSettlements([]);
          setHasMore(false);
          return;
        }
        const endId = latestSettledId - pageToLoad * pageSize;
        if (endId < 0) {
          setHasMore(false);
          return;
        }
        const startId = Math.max(0, endId - (pageSize - 1));
        if (startId > endId) {
          setHasMore(false);
          return;
        }
        const data = await nounsPublicClient.readContract({
          address: NOUNS_AH_ADDRESS,
          abi: NounsAuctionHouseV3Abi,
          functionName: "getSettlements",
          args: [BigInt(startId), BigInt(endId), true],
        });
        const normalized = (data as unknown as Settlement[])
          .map((item) => ({
            blockTimestamp: Number(item.blockTimestamp),
            amount: BigInt(item.amount),
            winner: item.winner,
            nounId: BigInt(item.nounId),
            clientId: Number(item.clientId),
          }))
          .sort((a, b) => Number(b.nounId - a.nounId));
        setSettlements((prev) => {
          if (reset || pageToLoad === 0) {
            return normalized;
          }
          const existingIds = new Set(prev.map((item) => item.nounId.toString()));
          const merged = [
            ...prev,
            ...normalized.filter(
              (item) => !existingIds.has(item.nounId.toString()),
            ),
          ];
          return merged;
        });
        setHasMore(startId > 0);
        setPage(pageToLoad);
      } catch (error) {
        console.error("Failed to load settlements", error);
      } finally {
        setIsLoading(false);
      }
    },
    [auction],
  );

  useEffect(() => {
    if (!auction) return;
    loadSettlements(0, true);
  }, [auction, loadSettlements]);

  return {
    settlements,
    isLoading,
    hasMore,
    loadNext: () => {
      if (!hasMore || isLoading) return;
      loadSettlements(page + 1);
    },
    refresh: () => loadSettlements(0, true),
  };
};

const INNER_PADDING = "space-y-10 md:space-y-14";

const NounsHomeInner: React.FC = () => {
  const { auction, refetch } = useAuctionData();
  const { settlements, isLoading: settlementsLoading, hasMore, loadNext, refresh } =
    useSettlements(auction);
  const { isConnected, address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [countdown, setCountdown] = useState(0);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    if (!auction) return;
    const updateCountdown = () => {
      const remaining = Number(auction.endTime) * 1000 - Date.now();
      setCountdown(Math.max(0, remaining));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1_000);
    return () => clearInterval(timer);
  }, [auction]);

  const { data: bidderEns } = useEnsName({
    address: auction?.bidder,
    chainId: mainnet.id,
    query: {
      enabled:
        Boolean(auction?.bidder) &&
        auction?.bidder !== "0x0000000000000000000000000000000000000000",
    },
  });

  const totalSettled = useMemo(() => {
    if (!auction) return 0;
    const base = Number(auction.nounId);
    return auction.settled ? base + 1 : base;
  }, [auction]);

  const nounHolderCount = useMemo(() => {
    if (!settlements?.length) return undefined;
    const holders = new Set<string>();
    for (const settlement of settlements) {
      const winner = settlement.winner?.toLowerCase();
      if (winner && winner !== '0x0000000000000000000000000000000000000000') {
        holders.add(winner);
      }
    }
    if (auction?.bidder && auction.bidder !== '0x0000000000000000000000000000000000000000') {
      holders.add(auction.bidder.toLowerCase());
    }
    return holders.size || undefined;
  }, [settlements, auction]);

  // Fetch precise counts from public subgraph
  const [executedCount, setExecutedCount] = useState<number | undefined>();
  const [holdersFromSubgraph, setHoldersFromSubgraph] = useState<number | undefined>();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [exec, holders] = await Promise.all([
          fetchExecutedProposalsCount().catch(() => undefined),
          fetchCurrentTokenHolders().catch(() => undefined),
        ]);
        if (!cancelled) {
          setExecutedCount(exec);
          setHoldersFromSubgraph(holders);
        }
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const treasuryRaisedLabel = useMemo(() => {
    if (!settlements?.length) return undefined;
    const totalEth = settlements.reduce((acc, item) => acc + item.amount, 0n);
    return formatEth(totalEth);
  }, [settlements]);
  const ethUsd = useEthUsdPrice();
  const treasuryRaisedUsdLabel = useMemo(() => {
    if (!settlements?.length || !ethUsd) return undefined;
    const totalEth = settlements.reduce((acc, item) => acc + item.amount, 0n);
    const asEth = Number(formatEth(totalEth).split(' ')[0].replace(/,/g, ''));
    if (!Number.isFinite(asEth)) return undefined;
    return formatUsd(asEth * ethUsd);
  }, [settlements, ethUsd]);

  const status = getAuctionStatus(auction);

  const canBid = isConnected && chainId === REQUIRED_CHAIN_ID && status === "active";

  const handleOpenBid = useCallback(() => {
    setActionMessage(null);
    if (!isConnected) {
      setActionError("Connect a wallet to place a bid.");
      return;
    }
    if (chainId !== REQUIRED_CHAIN_ID) {
      setActionError("Switch to Ethereum mainnet to bid.");
      return;
    }
    if (!canBid) {
      setActionError("Auction is not currently accepting bids.");
      return;
    }
    setActionError(null);
    setBidModalOpen(true);
  }, [isConnected, chainId, canBid]);

  const handleBidSubmit = useCallback(
    async (valueWei: bigint) => {
      if (!auction) return;
      if (!isConnected) {
        setActionError("Connect a wallet to place a bid.");
        return;
      }
      if (chainId !== REQUIRED_CHAIN_ID) {
        setActionError("Switch to Ethereum mainnet to bid.");
        return;
      }
      try {
        setBidSubmitting(true);
        setActionError(null);
        setActionMessage("Waiting for wallet signature...");
        const simulation = await simulateContract(nounsWagmiConfig, {
          address: NOUNS_AH_ADDRESS,
          abi: NounsAuctionHouseV3Abi,
          functionName: "createBid",
          args: [auction.nounId],
          chainId: REQUIRED_CHAIN_ID,
          account: address!,
          value: valueWei,
        });
        setActionMessage("Transaction submitted. Waiting for confirmation...");
        const hash = await writeContractAsync(simulation.request);
        setTxHash(hash);
        const receipt = await waitForTransactionReceipt(nounsWagmiConfig, {
          hash,
        });
        if (receipt.status === "success") {
          setActionMessage("Bid confirmed!");
          setBidModalOpen(false);
          await refetch();
          await refresh();
        } else {
          setActionError("Bid transaction failed");
        }
      } catch (error) {
        console.error("Bid failed", error);
        const message =
          error instanceof Error ? error.message : "Failed to place bid";
        setActionMessage(null);
        setActionError(message);
      } finally {
        setBidSubmitting(false);
        setTimeout(() => setActionMessage(null), 6_000);
      }
    },
    [
      auction,
      isConnected,
      chainId,
      address,
      refetch,
      refresh,
      writeContractAsync,
    ],
  );

  const attemptSettle = useCallback(
    async (fnName: "settleAuction" | "settleCurrentAndCreateNewAuction") => {
      if (!auction) return null;
      const simulation = await simulateContract(nounsWagmiConfig, {
        address: NOUNS_AH_ADDRESS,
        abi: NounsAuctionHouseV3Abi,
        functionName: fnName,
        args: [],
        chainId: REQUIRED_CHAIN_ID,
        account: address!,
      });
      const hash = await writeContractAsync(simulation.request);
      setTxHash(hash);
      const receipt = await waitForTransactionReceipt(nounsWagmiConfig, { hash });
      return receipt.status;
    },
    [auction, address, writeContractAsync],
  );

  const handleSettle = useCallback(async () => {
    if (!auction) return;
    if (!isConnected) {
      setActionError("Connect a wallet to settle the auction.");
      return;
    }
    if (chainId !== REQUIRED_CHAIN_ID) {
      setActionError("Switch to Ethereum mainnet to settle.");
      return;
    }
    try {
      setIsSettling(true);
      setActionError(null);
      setActionMessage("Submitting settle transaction...");
      const attempts: ("settleAuction" | "settleCurrentAndCreateNewAuction")[] = [
        "settleAuction",
        "settleCurrentAndCreateNewAuction",
      ];
      let success = false;
      let lastError: unknown = null;
      for (const fn of attempts) {
        try {
          const status = await attemptSettle(fn);
          if (status === "success") {
            success = true;
            break;
          }
        } catch (error) {
          lastError = error;
        }
      }
      if (success) {
        setActionMessage("Auction settled!");
        await refetch();
        await refresh();
      } else {
        throw lastError ?? new Error("Settle reverted");
      }
    } catch (error) {
      console.error("Settle failed", error);
      const message =
        error instanceof Error ? error.message : "Failed to settle auction";
      setActionMessage(null);
      setActionError(message);
    } finally {
      setIsSettling(false);
      setTimeout(() => setActionMessage(null), 6_000);
    }
  }, [auction, attemptSettle, chainId, isConnected, refetch, refresh]);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Nouns Auction House</h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Track the live auction, place a bid, settle the previous Noun, and
            dive deeper into the Nouns DAO universe without leaving nounspace.
          </p>
        </div>
        <ConnectControl />
      </div>

      <AuctionHero
        auction={auction}
        ensName={bidderEns}
        countdownMs={countdown}
        onOpenBid={handleOpenBid}
        onSettle={handleSettle}
        isSettling={isSettling}
        isConnected={isConnected}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <PastAuctions
            settlements={settlements}
            isLoading={settlementsLoading}
            hasMore={hasMore}
            onLoadMore={loadNext}
          />
        </section>
        <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Auction details</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">{status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Current bid</dt>
              <dd className="font-medium">
                {auction ? formatEth(auction.amount) : "Loading"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ends in</dt>
              <dd className="font-medium">{formatCountdown(countdown)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Bidder</dt>
              <dd className="font-medium">
                {bidderEns ||
                  (auction?.bidder
                    ? shortAddress(auction.bidder)
                    : "-")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Auction contract</dt>
              <dd className="font-mono text-xs">
                <LinkOut href={`https://etherscan.io/address/${NOUNS_AH_ADDRESS}`}>
                  {shortAddress(NOUNS_AH_ADDRESS)}
                </LinkOut>
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <StatsRow
        totalSettled={totalSettled}
        nounHolderCount={holdersFromSubgraph ?? nounHolderCount}
        ideasFundedLabel={(executedCount ?? undefined)?.toLocaleString() || "Hundreds+"}
        treasuryRaisedLabel={treasuryRaisedUsdLabel ?? treasuryRaisedLabel}
      />

      <div className={INNER_PADDING}>
        <ThisIsNounsSection />
        <NounsFundsIdeasSection />
        <GovernedByYouSection nounHolderCount={holdersFromSubgraph ?? nounHolderCount} />
        <TheseAreNounsStrip />
        <GetANounSection />
        <AlreadyOwnSection />
        <JourneySection />
        <LearnSection />
        <FaqAccordion settlements={settlements} />
      </div>

      {bidModalOpen && auction && (
        <BidModal
          isOpen={bidModalOpen}
          nounId={auction.nounId}
          currentAmount={auction.amount}
          onDismiss={() => {
            setBidModalOpen(false);
            setActionError(null);
          }}
          onConfirm={handleBidSubmit}
          isSubmitting={bidSubmitting}
          errorMessage={actionError ?? undefined}
        />
      )}

      {(actionMessage || actionError || txHash) && (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm shadow-sm">
          {actionMessage && <p className="font-medium">{actionMessage}</p>}
          {actionError && <p className="text-red-600">{actionError}</p>}
          {txHash && (
            <p className="text-xs text-muted-foreground">
              Tx hash: <LinkOut href={`https://etherscan.io/tx/${txHash}`}>{txHash}</LinkOut>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const NounsHomeFidget: React.FC = () => {
  return (
    <WagmiProvider config={nounsWagmiConfig}>
      <NounsHomeInner />
    </WagmiProvider>
  );
};

export default NounsHomeFidget;
