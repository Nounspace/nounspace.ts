import React, { useEffect, useMemo, useState } from "react";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import {
  fetchAuctionById,
  fetchAuctionSettings,
  fetchCurrentAuctionId,
  fetchRecentAuctions,
  nounsPublicClient,
} from "./api";
import { AuctionData, AuctionWithState } from "./types";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ConnectedWallet,
  useLogin,
  usePrivy,
} from "@privy-io/react-auth";
import {
  createWalletClient,
  custom,
  formatEther,
  parseEther,
} from "viem";
import { mainnet } from "viem/chains";
import nounsAuctionHouseAbi from "./nounsAuctionHouseAbi";
import { waitForTransactionReceipt } from "viem/actions";
import clsx from "clsx";

const CLIENT_ID = 5;
const NOUNS_AUCTION_HOUSE_ADDRESS = "0x830BD73E4184ceF73443C15111a1DF14e495C706" as const;

export type NounsAuctionSettings = FidgetSettingsStyle;

const properties: FidgetProperties = {
  fidgetName: "Nouns Auction",
  icon: 0x1f3c6,
  fields: [...defaultStyleFields],
  size: {
    minHeight: 8,
    minWidth: 6,
    maxHeight: 36,
    maxWidth: 36,
  },
};

const etherscanTxUrl = (hash: string) =>
  `https://etherscan.io/tx/${hash}`;

function formatAddress(address?: string | null) {
  if (!address) return "Unknown";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatRelativeTime(timestampSeconds: number) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const delta = nowSeconds - timestampSeconds;
  if (delta <= 0) return "just now";
  const intervals: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
  ];
  let value = delta;
  let unit = "second";
  for (const [step, name] of intervals) {
    if (value < step) {
      unit = name;
      break;
    }
    value = Math.floor(value / step);
    unit = name;
  }
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

function formatCountdown(milliseconds: number) {
  if (milliseconds <= 0) {
    return "Auction ended";
  }
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const dayPrefix = days > 0 ? `${days}d ` : "";
  return `${dayPrefix}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function deriveAuctionState(
  auction: AuctionData,
  reservePrice: bigint,
  minIncrement: bigint,
): AuctionWithState {
  const highestBidFromHistory =
    auction.bids && auction.bids.length > 0
      ? BigInt(auction.bids[0].amount)
      : BigInt(auction.amount ?? "0");

  const minBidWithIncrement =
    highestBidFromHistory === 0n
      ? reservePrice
      : highestBidFromHistory +
        (highestBidFromHistory * minIncrement) / BigInt(100);

  const nextMinBid = minBidWithIncrement > reservePrice ? minBidWithIncrement : reservePrice;

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  const endTime = BigInt(auction.endTime ?? "0");
  const hasEnded = nowSeconds >= endTime;

  const state: AuctionWithState["state"] = hasEnded
    ? auction.settled
      ? "ended-settled"
      : "ended-unsettled"
    : "live";

  return {
    ...auction,
    state,
    highestBid: highestBidFromHistory,
    nextMinBid,
  };
}

async function ensureWalletOnMainnet(wallet: ConnectedWallet) {
  try {
    await wallet.switchChain(mainnet.id);
  } catch (err) {
    // ignore if already on chain
  }
}

const staticSections = {
  learnMore: {
    title: "This is Nouns",
    description:
      "Nouns are unique digital art pieces. One new Noun is auctioned every day, forever. They fund creative projects and form a community-owned brand that anyone can build on.",
    videoUrl: "https://www.youtube.com/watch?v=lOzCA7bZG_k",
  },
  funding: {
    title: "Nouns Fund Ideas",
    description:
      "Proceeds from daily auctions are used to support ideas of all shapes and sizes.",
    projects: [
      {
        title: "Precious Noggles: Recycled Sunglasses",
        image: "https://nouns.com/project/precious-noggles.png",
        link: "https://www.youtube.com/watch?v=ZGd_mPiTMgQ",
      },
      {
        title: "Hyalinobatrachium Nouns",
        image: "https://nouns.com/project/frog.png",
        link: "https://explore.nouns.world/hyalinobatrachium-nouns/",
      },
      {
        title: "Bud Light x Nouns Super Bowl Commercial",
        image: "https://nouns.com/project/bud-light.png",
        link: "https://explore.nouns.world/bud-light-and-nouns-super-bowl/",
      },
      {
        title: "Nouns Esports: A New Model for Gaming",
        image: "https://nouns.com/project/e-sports.png",
        link: "https://nouns.gg/",
      },
    ],
  },
  governance: {
    title: "Governed by You",
    description:
      "Noun holders collectively decide which ideas to fund and shape the future direction of the community.",
    cta: "One Noun = One Vote",
    link: "https://nouns.camp/",
  },
  faq: [
    {
      question: "How does the Nouns auction work?",
      answer:
        "A new Noun is generated and auctioned every 24 hours. Auctions are settled on Ethereum, and anyone with ETH can participate.",
    },
    {
      question: "What happens after the auction?",
      answer:
        "When the auction is settled, the winning Noun is minted to the highest bidder and proceeds are sent to the Nouns DAO treasury.",
    },
    {
      question: "Where can I learn more about the community?",
      answer:
        "Visit nouns.center, explore.nouns.world, or join the conversation on Farcaster to discover how people are building with Nouns.",
    },
  ],
};

const NounsAuctionFidget: React.FC<FidgetArgs<NounsAuctionSettings>> = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["nouns-auction-settings"],
    queryFn: fetchAuctionSettings,
    staleTime: 1000 * 60 * 15,
  });

  const { data: currentAuctionId } = useQuery({
    queryKey: ["nouns-auction-current-id"],
    queryFn: fetchCurrentAuctionId,
    refetchInterval: 10_000,
  });

  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  useEffect(() => {
    if (currentAuctionId && !selectedAuctionId) {
      setSelectedAuctionId(currentAuctionId);
    }
    if (
      currentAuctionId &&
      selectedAuctionId &&
      Number(selectedAuctionId) > Number(currentAuctionId)
    ) {
      setSelectedAuctionId(currentAuctionId);
    }
  }, [currentAuctionId, selectedAuctionId]);

  const { data: auctionRaw } = useQuery({
    queryKey: ["nouns-auction", selectedAuctionId],
    queryFn: () => fetchAuctionById(selectedAuctionId ?? ""),
    enabled: Boolean(selectedAuctionId),
    refetchInterval: ({ state }) => {
      return state.data && selectedAuctionId === currentAuctionId ? 5_000 : false;
    },
  });

  const { data: recentAuctions, isFetching: historyLoading } = useQuery({
    queryKey: ["nouns-auction-history"],
    queryFn: () => fetchRecentAuctions(12, 0),
    staleTime: 1000 * 60,
  });

  const auction = useMemo(() => {
    if (!auctionRaw || !settings) return null;
    return deriveAuctionState(
      auctionRaw,
      settings.reservePrice,
      settings.minBidIncrementPercentage,
    );
  }, [auctionRaw, settings]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeRemainingMs = useMemo(() => {
    if (!auction) return 0;
    const endMs = Number(auction.endTime) * 1000;
    return Math.max(0, endMs - now);
  }, [auction, now]);

  const { login } = useLogin();
  const { ready, authenticated, user } = usePrivy();

  const [bidInput, setBidInput] = useState("");
  const [txnState, setTxnState] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnHash, setTxnHash] = useState<string | null>(null);

  const [settleState, setSettleState] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settleHash, setSettleHash] = useState<string | null>(null);

  async function getWalletClient() {
    if (!ready) {
      throw new Error("Wallet is not ready yet");
    }
    const wallet = user?.wallet;
    if (!wallet) {
      await login();
      throw new Error("Wallet connection required");
    }
    await ensureWalletOnMainnet(wallet);
    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: mainnet,
      transport: custom(provider),
    });
  }

  async function handleBid(e: React.FormEvent) {
    e.preventDefault();
    if (!auction || !settings) return;

    let value: bigint;
    try {
      value = parseEther(bidInput || "0");
    } catch (err) {
      setTxnError("Enter a valid ETH amount.");
      setTxnState("error");
      return;
    }

    if (value < auction.nextMinBid) {
      setTxnError(
        `Bid must be at least ${Number(
          formatEther(auction.nextMinBid),
        ).toFixed(4)} ETH`,
      );
      setTxnState("error");
      return;
    }

    try {
      setTxnState("pending");
      setTxnError(null);
      setTxnHash(null);
      const walletClient = await getWalletClient();
      const hash = await walletClient.writeContract({
        abi: nounsAuctionHouseAbi,
        address: NOUNS_AUCTION_HOUSE_ADDRESS,
        functionName: "createBid",
        args: [BigInt(auction.noun.id), Number(CLIENT_ID)],
        value,
      });
      setTxnHash(hash);
      await waitForTransactionReceipt(nounsPublicClient, { hash });
      setTxnState("success");
      setBidInput("");
      queryClient.invalidateQueries({ queryKey: ["nouns-auction"] });
      queryClient.invalidateQueries({ queryKey: ["nouns-auction-history"] });
      queryClient.invalidateQueries({ queryKey: ["nouns-auction-current-id"] });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong while bidding.";
      setTxnError(message);
      setTxnState("error");
    }
  }

  async function handleSettle() {
    if (!auction) return;
    try {
      setSettleState("pending");
      setSettleError(null);
      setSettleHash(null);
      const walletClient = await getWalletClient();
      const hash = await walletClient.writeContract({
        abi: nounsAuctionHouseAbi,
        address: NOUNS_AUCTION_HOUSE_ADDRESS,
        functionName: "settleCurrentAndCreateNewAuction",
        args: [],
      });
      setSettleHash(hash);
      await waitForTransactionReceipt(nounsPublicClient, { hash });
      setSettleState("success");
      queryClient.invalidateQueries({ queryKey: ["nouns-auction"] });
      queryClient.invalidateQueries({ queryKey: ["nouns-auction-current-id"] });
      queryClient.invalidateQueries({ queryKey: ["nouns-auction-history"] });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to settle the auction.";
      setSettleError(message);
      setSettleState("error");
    }
  }

  const currentAuctionNumber = auction?.noun.id ?? selectedAuctionId ?? "";
  const currentBidDisplay = auction
    ? `${Number(formatEther(auction.highestBid)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} ETH`
    : "--";
  const nextBidDisplay = auction
    ? `${Number(formatEther(auction.nextMinBid)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} ETH`
    : "--";

  return (
    <div className="flex h-full w-full flex-col gap-12 overflow-y-auto bg-gradient-to-b from-white to-slate-100 px-4 py-6 text-slate-900">
      <section className="flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Current Auction</span>
            {auction && (
              <span>
                Ends {new Date(Number(auction.endTime) * 1000).toLocaleString()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold md:text-5xl">Noun {currentAuctionNumber}</h1>
          <p className="text-base text-slate-600">
            Time remaining: <span className="font-semibold text-slate-900">{formatCountdown(timeRemainingMs)}</span>
          </p>
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span>Current bid</span>
              <span className="text-xl font-semibold text-slate-900">{currentBidDisplay}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Leading bidder</span>
              <span className="font-medium text-slate-700">
                {formatAddress(auction?.bids?.[0]?.bidder?.id ?? auction?.bidder?.id ?? null)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Next minimum bid</span>
              <span className="font-medium text-slate-700">{nextBidDisplay}</span>
            </div>
          </div>
          <form onSubmit={handleBid} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="bid-input">
              Place a bid
            </label>
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                id="bid-input"
                type="number"
                min="0"
                step="0.01"
                value={bidInput}
                onChange={(event) => setBidInput(event.target.value)}
                placeholder="Enter amount in ETH"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base shadow-sm focus:border-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={txnState === "pending" || !auction}
                className={clsx(
                  "rounded-xl px-5 py-3 text-base font-semibold text-white transition",
                  txnState === "pending"
                    ? "bg-slate-400"
                    : "bg-slate-900 hover:bg-slate-800",
                )}
              >
                {txnState === "pending" ? "Submitting..." : "Place Bid"}
              </button>
            </div>
            {!authenticated && (
              <p className="text-xs text-slate-500">
                You will be prompted to connect your wallet with Privy before bidding.
              </p>
            )}
            {txnError && (
              <p className="text-sm text-red-500">{txnError}</p>
            )}
            {txnState === "success" && txnHash && (
              <a
                href={etherscanTxUrl(txnHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-green-600 underline"
              >
                View bid on Etherscan
              </a>
            )}
          </form>
          {auction && auction.state === "ended-unsettled" && (
            <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                The latest auction has ended but not been settled yet.
              </p>
              <button
                type="button"
                onClick={handleSettle}
                disabled={settleState === "pending"}
                className={clsx(
                  "w-full rounded-xl px-5 py-3 text-base font-semibold text-white transition",
                  settleState === "pending"
                    ? "bg-amber-400"
                    : "bg-amber-600 hover:bg-amber-500",
                )}
              >
                {settleState === "pending" ? "Settling..." : "Settle Auction"}
              </button>
              {settleError && (
                <p className="text-sm text-amber-700">{settleError}</p>
              )}
              {settleState === "success" && settleHash && (
                <a
                  href={etherscanTxUrl(settleHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-amber-700 underline"
                >
                  View settlement on Etherscan
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {auction ? (
              <img
                src={`https://noun.pics/${auction.noun.id}.png`}
                alt={`Noun ${auction.noun.id}`}
                className="h-72 w-72 rounded-2xl border border-slate-200 object-contain shadow-inner"
              />
            ) : (
              <div className="h-72 w-72 animate-pulse rounded-2xl bg-slate-200" />
            )}
          </div>
          <div className="w-full rounded-2xl bg-slate-900 p-4 text-white">
            <h3 className="text-lg font-semibold">Bid history</h3>
            <div className="mt-3 flex max-h-48 flex-col gap-3 overflow-y-auto pr-1">
              {auction?.bids?.length ? (
                auction.bids.slice(0, 10).map((bid) => (
                  <div
                    key={bid.txHash}
                    className="flex flex-col gap-1 rounded-xl bg-white/10 p-3"
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{Number(formatEther(BigInt(bid.amount))).toFixed(3)} ETH</span>
                      <span>{formatRelativeTime(Number(bid.blockTimestamp))}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{formatAddress(bid.bidder?.id)}</span>
                      <a
                        href={etherscanTxUrl(bid.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View tx
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/80">No bids yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Nouns</h2>
          <p className="text-sm text-slate-500">
            Browse the latest auctions and tap any Noun to view its auction details.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(recentAuctions ?? []).map((item) => {
            const isActive = item.id === selectedAuctionId;
            const highest = item.bids?.[0]?.amount ?? item.amount;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedAuctionId(item.id)}
                className={clsx(
                  "flex flex-col items-center gap-3 rounded-2xl border p-3 text-left transition",
                  isActive
                    ? "border-slate-900 bg-slate-900/5"
                    : "border-transparent bg-white shadow",
                )}
              >
                <img
                  src={`https://noun.pics/${item.noun.id}.png`}
                  alt={`Noun ${item.noun.id}`}
                  className="h-32 w-32 rounded-xl border border-slate-200 object-contain"
                />
                <div className="flex w-full flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">Noun {item.noun.id}</span>
                  <span className="text-xs text-slate-500">
                    {Number(formatEther(BigInt(highest ?? "0"))).toFixed(2)} ETH
                  </span>
                </div>
              </button>
            );
          })}
          {historyLoading &&
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">{staticSections.learnMore.title}</h2>
          <p className="text-base text-slate-600">{staticSections.learnMore.description}</p>
          <a
            href={staticSections.learnMore.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow hover:bg-slate-800"
          >
            Watch the video
          </a>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">{staticSections.funding.title}</h2>
          <p className="text-base text-slate-600">{staticSections.funding.description}</p>
          <div className="grid grid-cols-2 gap-3">
            {staticSections.funding.projects.map((project) => (
              <a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex h-40 items-end overflow-hidden rounded-2xl bg-slate-900 text-white shadow"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
                <div className="relative z-10 w-full bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-xs font-semibold">
                  {project.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold">{staticSections.governance.title}</h2>
          <span className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold uppercase">
            {staticSections.governance.cta}
          </span>
        </div>
        <p className="max-w-3xl text-base text-white/80">{staticSections.governance.description}</p>
        <a
          href={staticSections.governance.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
        >
          Explore governance
        </a>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Questions? Answers.</h2>
        <div className="flex flex-col divide-y divide-slate-200">
          {staticSections.faq.map((item) => (
            <details key={item.question} className="py-4">
              <summary className="cursor-pointer text-lg font-semibold text-slate-900">
                {item.question}
              </summary>
              <p className="mt-3 text-base text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default {
  fidget: NounsAuctionFidget,
  properties,
} as FidgetModule<FidgetArgs<NounsAuctionSettings>>;
