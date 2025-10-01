'use client';

import React, { useMemo, useState } from "react";
import { ArrowRight, Gavel, ShoppingBag, Coins, RefreshCcw, Landmark } from "lucide-react";
import LinkOut from "../LinkOut";
import { fetchNounsCountByOwner } from "../subgraph";
import NounImage from "../NounImage";
import { formatEth, formatCountdown } from "../utils";
import type { Auction } from "../types";
import type { Settlement } from "../types";

const VIDEO_THUMBNAIL = "https://www.nouns.com/this-is-nouns-video-thumbnail.png";
const VIDEO_URL = "https://www.youtube.com/watch?v=lOzCA7bZG_k";

const FUNDED_PROJECTS = [
  {
    title: "Precious Noggles: Recycled Sunglasses",
    image: "https://www.nouns.com/project/precious-noggles.png",
    href: "https://www.youtube.com/watch?v=ZGd_mPiTMgQ",
  },
  {
    title: "Hyalinobatrachium Nouns",
    image: "https://www.nouns.com/project/frog.png",
    href: "https://explore.nouns.world/hyalinobatrachium-nouns/",
  },
  {
    title: "Quack and Lola",
    image: "https://www.nouns.com/project/quack.png",
    href: "https://www.instagram.com/meetquack/",
  },
  {
    title: "Bud Light x Nouns Super Bowl Commercial",
    image: "https://www.nouns.com/project/bud-light.png",
    href: "https://explore.nouns.world/bud-light-and-nouns-super-bowl/",
  },
  {
    title: "Dustin Yellin's PERSON, PLACE, or THING",
    image: "https://www.nouns.com/project/dustin-yellin.png",
    href: "https://explore.nouns.world/dustin-yellins-person-place-or-thing/",
  },
  {
    title: "John Hamon x Nouns",
    image: "https://www.nouns.com/project/john-hamon.png",
    href: "https://explore.nouns.world/john-hamon-and-nouns/",
  },
  {
    title: "The Rise of Blus: A Nouns Movie",
    image: "https://www.nouns.com/project/rise-of-blus.png",
    href: "https://nouns.movie/",
  },
  {
    title: "Nouns House: The hub for builders in Sao Paulo",
    image: "https://www.nouns.com/project/nouns-house.png",
    href: "https://instagram.com/nouns_house",
  },
  {
    title: "Gnars: Nouns Action Sports Team",
    image: "https://www.nouns.com/project/gnars.png",
    href: "https://gnars.com/",
  },
  {
    title: "The Rose Parade: Shark Pickle Cone",
    image: "https://www.nouns.com/project/rose-parade.png",
    href: "https://x.com/NounsDoc/status/1836027328616386725",
  },
  {
    title: "Nouns Esports: A New Model for Gaming",
    image: "https://www.nouns.com/project/e-sports.png",
    href: "https://nouns.gg/",
  },
];

const SAMPLE_NOUN_IDS = [
  1n,
  10n,
  25n,
  42n,
  99n,
  125n,
  150n,
  208n,
  256n,
  314n,
  365n,
  420n,
  512n,
  777n,
  808n,
  903n,
  1111n,
  1337n,
];

const GET_A_NOUN_CARDS = [
  {
    key: 'bid',
    title: "Bid on today's one-of-a-kind Noun and make it yours!",
    description: "", // no secondary copy
    buttonLabel: "Bid now",
    href: "https://www.nouns.com/nouns",
    image: "https://www.nouns.com/feature/join-auction/main.png",
  },
  {
    key: 'shop',
    title: "Buy a Noun! Shop all major marketplaces in one place.",
    description: "",
    buttonLabel: "Shop",
    href: "https://www.nouns.com/explore?buyNow=1",
    image: "https://www.nouns.com/feature/shop/main.png",
  },
  {
    key: 'redeem',
    title: "Collect $NOUNS tokens and redeem them for a Noun.",
    description: "1,000,000 $NOUNS = 1 Noun",
    buttonLabel: "Redeem",
    href: "https://www.nouns.com/convert?tab=redeem",
    image: "https://www.nouns.com/feature/%24nouns-redeem/main.png",
  },
];

const ALREADY_OWN_CARDS = [
  {
    title: "Instant Swap",
    description: "Swap your Noun for another in a single trade.",
    buttonLabel: "Swap",
    href: "https://www.nouns.com/explore?instantSwap=1",
    image: "https://www.nouns.com/feature/instant-swap/main.png",
  },
  {
    title: "Treasury Swap",
    description: "Offer to trade your Noun with one held by the Treasury.",
    buttonLabel: "Trade",
    href: "https://www.nouns.com/explore?onlyTreasuryNouns=1",
    image: "https://www.nouns.com/feature/treasury-swap/main.png",
  },
];

const JOURNEY_CARDS = [
  {
    title: "Join the Nouns Community",
    description:
      "Join the conversation on Farcaster to share ideas and meet other Nouners.",
    buttonLabel: "Join Nouns on Farcaster",
    href: "https://warpcast.com/~/channel/nouns",
    image: "https://www.nouns.com/socials/farcaster.svg",
    footer: "100k+ Followers",
  },
  {
    title: "Explore Proposals",
    description:
      "Discover active proposals and see what the community is funding next.",
    buttonLabel: "View proposals",
    href: "https://www.nouns.com/vote",
    image: "https://www.nouns.com/proposals.svg",
  },
];

const LEARN_POSTS = [
  {
    title: "Nouns Governance: How Nouns DAO backs proposals",
    description:
      "Understand the lifecycle of a proposal, from idea to execution on-chain.",
    href: "https://www.nouns.com/learn/nouns-governance",
    image: "https://www.nouns.com/learn/nouns-governance.png",
  },
  {
    title: "Noggle the Glossary of Nouns DAO",
    description:
      "Decode the vocabulary, memes, and phrases you will hear inside the DAO.",
    href: "https://www.nouns.com/learn/noggle-the-glossary",
    image: "https://www.nouns.com/learn/noggle-the-glossary.png",
  },
  {
    title: "This is Nouns 101",
    description:
      "A primer on what Nouns are, how auctions work, and why the DAO exists.",
    href: "https://www.nouns.com/learn/this-is-nouns-101",
    image: "https://www.nouns.com/learn/this-is-nouns-101.png",
  },
];

const FAQ_ITEMS: {
  question: string;
  answer: React.ReactNode;
}[] = [
  {
    question: "What is a Noun?",
    answer: (
      <>
        <p>
          A Noun is a one-of-a-kind 32x32 pixel art character created daily as
          part of the Nouns project. Each Noun is randomly generated with
          traits:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>backgrounds</li>
          <li>heads</li>
          <li>glasses</li>
          <li>body</li>
          <li>accessory</li>
        </ul>
        <p>
          Each Noun is stored on the Ethereum blockchain. Beyond the art, owning
          a Noun gives you membership in Nouns DAO, a community that manages a
          shared treasury to fund creative and impactful projects.
        </p>
      </>
    ),
  },
  {
    question: "What is Nouns DAO?",
    answer: (
      <>
        <p>
          Nouns is a community-driven project that creates and funds creative
          ideas and public initiatives. Each day, a unique pixel art character
          called a &quot;Noun&quot; is generated and sold through an auction. The
          funds raised go into a shared community treasury, managed collectively
          by Noun holders.
        </p>
        <p>
          Since 2021, Nouns has supported hundreds of impactful projects across
          arts, education, the environment, sports, and more. These include
          funding schools, providing artist grants, supporting clean water
          initiatives, creating public goods, backing charity events, empowering
          underrepresented communities, producing educational resources, and
          sponsoring cultural and environmental projects.
        </p>
      </>
    ),
  },
  {
    question: "How do daily auctions work?",
    answer: (
      <>
        <p>
          Every day, a new Noun is created and auctioned. The auction lasts 24
          hours, and the highest bidder at the end wins the Noun. Once the
          auction is settled, the proceeds are sent to the Nouns treasury and the
          next auction begins automatically.
        </p>
        <p>
          This cycle continues indefinitely. Anyone can participate, and every
          auction funds creative ideas decided by Noun holders.
        </p>
      </>
    ),
  },
  {
    question: "Who can own a Noun, and what does it mean?",
    answer: (
      <>
        <p>
          Anyone can own a Noun by winning a daily auction, purchasing one from
          an existing owner, or redeeming 1,000,000 $NOUNS tokens. Ownership
          grants one vote in Nouns DAO, letting you help decide how the treasury
          supports creative and impactful projects.
        </p>
      </>
    ),
  },
  {
    question: "Are Nouns free to use?",
    answer: (
      <>
        <p>
          Yes. Nouns artwork is in the public domain, so anyone can use, remix,
          or build on Nouns without restrictions. This openness encourages
          creativity across art, media, fashion, software, and more.
        </p>
      </>
    ),
  },
  {
    question: "What kinds of projects does Nouns fund?",
    answer: (
      <>
        <p>Nouns backs creativity and subcultures, funding work like:</p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>Art: public installations, artist grants, and films.</li>
          <li>Education: schools, learning tools, and resources.</li>
          <li>Environment: clean water and sustainability efforts.</li>
          <li>Sports: community events and athlete support.</li>
          <li>Technology: open-source tools and blockchain research.</li>
          <li>Charity: empowering underrepresented communities and social causes.</li>
          <li>and many more.</li>
        </ul>
      </>
    ),
  },
  {
    question: "Who created Nouns?",
    answer: (
      <>
        <p>
          The Nounders created Nouns. Every 10th Noun for the first five years
          (IDs #0, #10, #20, and so on) is automatically sent to the Nounders&apos;
          wallet so they stay invested while 100% of auction proceeds go to the
          DAO.
        </p>
        <p>The Nounders include:</p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          {[
            "@cryptoseneca",
            "@gremplin",
            "@punk4156",
            "@eboyarts",
            "@punk4464",
            "@solimander",
            "@dhof",
            "@carrot_init",
            "@TimpersHD",
            "@lastpunk9999",
          ].map((handle) => (
            <li key={handle}>
              <LinkOut
                href={`https://x.com/${handle.replace('@', '')}`}
                className="underline"
              >
                {handle}
              </LinkOut>
            </li>
          ))}
        </ul>
        <p>
          These distributions do not interrupt the 24 hour auction cadence.
          Auctions continue seamlessly with the next Noun ID.
        </p>
      </>
    ),
  },
  {
    question: "What are $NOUNS tokens?",
    answer: (
      <>
        <p>
          $NOUNS tokens represent fractional ownership of a Noun. Any Noun can
          be converted into 1,000,000 $NOUNS tokens, which can be collected and
          redeemed to claim a Noun held in the token contract.
        </p>
      </>
    ),
  },
];

export const ThisIsNounsSection = () => {
  const [showVideo, setShowVideo] = React.useState(false);
  const [dim, setDim] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const mobileIds = SAMPLE_NOUN_IDS.slice(0, 5);
  const leftIds = SAMPLE_NOUN_IDS.slice(0, 10);
  const rightIds = SAMPLE_NOUN_IDS.slice(9, 19);

  // Precomputed loose positions for desktop floating tiles
  const leftPositions = [
    { top: 6, left: -12 },
    { top: 18, left: 0 },
    { top: 30, left: -6 },
    { top: 46, left: 6 },
    { top: 62, left: -4 },
    { top: 12, left: 14 },
    { top: 38, left: 18 },
    { top: 56, left: 22 },
    { top: 26, left: 24 },
    { top: 72, left: 14 },
  ];
  const rightPositions = [
    { top: 6, right: -12 },
    { top: 18, right: 0 },
    { top: 34, right: -6 },
    { top: 50, right: 8 },
    { top: 64, right: -4 },
    { top: 12, right: 14 },
    { top: 40, right: 18 },
    { top: 56, right: 22 },
    { top: 26, right: 24 },
    { top: 72, right: 14 },
  ];

  // Dim/blur tiles on scroll similar to nouns.com
  React.useEffect(() => {
    const onScroll = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Center distance factor 0 (center) .. 1 (far)
      const center = rect.top + rect.height / 2;
      const d = Math.min(1, Math.abs(center - vh / 2) / (vh / 2));
      setDim(d);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={rootRef} className="relative flex w-full flex-col items-center justify-center gap-10 overflow-hidden rounded-3xl bg-white p-6 text-center shadow-sm md:p-12">
      {/* Floating tiles - desktop */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ opacity: 0.95 - dim * 0.15 }}
      >
        {/* Left cluster */}
        {leftIds.map((id, i) => (
          <div
            key={`left-${id.toString()}`}
            className="absolute h-16 w-16 rounded-2xl bg-white/90 p-1 shadow-sm"
            style={{
              top: `${leftPositions[i % leftPositions.length].top}%`,
              left: `${leftPositions[i % leftPositions.length].left}%`,
              animation: `floatY 6s ease-in-out ${i * 0.3}s infinite alternate` as any,
              transform: `rotate(${(i % 5) - 2}deg) scale(${1 + (i % 3) * 0.04})`,
            }}
          >
            <img
              src={`/nouns-samples/${id.toString()}.svg`}
              alt={`Noun ${id.toString()}`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                const fb = `https://noun.pics/${id.toString()}.svg`;
                if (t.src !== fb) t.src = fb;
              }}
            />
          </div>
        ))}
        {/* Right cluster */}
        {rightIds.map((id, i) => (
          <div
            key={`right-${id.toString()}`}
            className="absolute h-16 w-16 rounded-2xl bg-white/90 p-1 shadow-sm"
            style={{
              top: `${rightPositions[i % rightPositions.length].top}%`,
              right: `${rightPositions[i % rightPositions.length].right}%`,
              animation: `floatY 6.5s ease-in-out ${i * 0.35}s infinite alternate` as any,
              transform: `rotate(${(i % 5) - 2}deg) scale(${1 + ((i + 1) % 3) * 0.04})`,
            }}
          >
            <img
              src={`/nouns-samples/${id.toString()}.svg`}
              alt={`Noun ${id.toString()}`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                const fb = `https://noun.pics/${id.toString()}.svg`;
                if (t.src !== fb) t.src = fb;
              }}
            />
          </div>
        ))}
      </div>

      {/* Floating tiles - mobile (above header) */}
      <div className="flex w-full items-center justify-center gap-3 md:hidden">
        {mobileIds.map((id, i) => (
          <div
            key={`mob-${id.toString()}`}
            className="h-14 w-14 rounded-2xl bg-white/90 p-1 shadow-sm"
            style={{ animation: `floatY 6s ease-in-out ${i * 0.25}s infinite alternate` as any }}
          >
            <img
              src={`/nouns-samples/${id.toString()}.svg`}
              alt={`Noun ${id.toString()}`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                const fb = `https://noun.pics/${id.toString()}.svg`;
                if (t.src !== fb) t.src = fb;
              }}
            />
          </div>
        ))}
      </div>

      {/* Copy + CTA */}
      <div className="relative z-[1] flex flex-col items-center gap-4">
        <h2 className="user-theme-headings-font text-4xl font-semibold md:text-5xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>This is Nouns</h2>
        <p className="max-w-lg md:max-w-xl text-base text-[#5a5a70] md:text-lg">
          Nouns are unique digital art pieces. One new Noun is auctioned every
          day, forever. They fund creative projects and form a community-owned,
          open-source brand that anyone can use and build upon.
        </p>
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 text-left transition hover:border-black/30"
          aria-label="Watch This is Nouns"
        >
          <img
            src={VIDEO_THUMBNAIL}
            alt="This is Nouns video thumbnail"
            className="h-14 w-[96px] rounded-xl object-cover"
            loading="lazy"
          />
          <div className="flex flex-1 flex-col justify-center">
            <span className="text-base font-semibold">This is Nouns</span>
            <span className="text-sm text-[#5a5a70]">Watch the video</span>
          </div>
        </button>
      </div>

      {/* Inline video modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-auto">
          <div className="relative w-[min(92vw,960px)] rounded-2xl bg-black">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold"
              onClick={() => setShowVideo(false)}
              aria-label="Close video"
            >
              Close
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/lOzCA7bZG_k?autoplay=1&rel=0"
                title="This is Nouns"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Local keyframes for gentle float */}
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px) rotate(0.5deg); }
          50% { transform: translateY(-8px) rotate(-0.5deg); }
          100% { transform: translateY(0px) rotate(0.5deg); }
        }
      `}</style>
    </section>
  );
};

export const NounsFundsIdeasSection = () => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 rounded-3xl bg-white p-6 shadow-sm md:gap-12 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="user-theme-headings-font text-3xl font-semibold md:text-4xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>Nouns Funds Ideas</h2>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Proceeds from daily auctions are used to support ideas of all shapes
          and sizes, like these:
        </p>
      </div>
      <div className="flex w-full gap-4 overflow-x-auto pb-2">
        {FUNDED_PROJECTS.map((project) => (
          <LinkOut
            key={project.title}
            href={project.href}
            className="relative flex h-[408px] w-[306px] flex-shrink-0 flex-col justify-end overflow-hidden rounded-[20px]"
          >
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="relative z-[1] bg-gradient-to-t from-black/80 to-black/0 px-4 pb-6 pt-24 text-left">
              <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            </div>
          </LinkOut>
        ))}
      </div>
    </section>
  );
};

export const GovernedByYouSection = ({
  nounHolderCount,
}: {
  nounHolderCount?: number;
}) => {
  const countLabel = (nounHolderCount && nounHolderCount > 0)
    ? nounHolderCount.toLocaleString()
    : undefined;

  return (
    <section className="flex w-full items-center justify-center">
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-black px-6 py-14 text-center text-white shadow-sm md:px-20 md:py-24">
        <img
          src="https://www.nouns.com/governed-by-you-background.png"
          alt="Nouns governance"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
          loading="lazy"
        />
        <div className="relative z-[1] flex flex-col items-center gap-4">
          <h2 className="user-theme-headings-font text-3xl font-semibold md:text-5xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>
            Governed by you &{' '}
            {countLabel ? (
              <span className="text-[#3B82F6]">{countLabel}</span>
            ) : (
              <span className="text-[#3B82F6]">others</span>
            )}{' '}
            {countLabel ? 'others' : ''}
          </h2>
          <p className="max-w-2xl text-base text-gray-200 md:text-lg">
            Noun holders collectively decide which ideas to fund and shape the future direction of the community.
          </p>
          <div className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white px-6 text-sm font-semibold uppercase">
            One Noun = One Vote
          </div>
        </div>
      </div>
    </section>
  );
};

export const TheseAreNounsStrip = () => {
  // Build a sequence for marquee rows; duplicate so translateX(-50%) loops seamlessly
  const rowIds = [...SAMPLE_NOUN_IDS, ...SAMPLE_NOUN_IDS];

  const Tile = ({ id }: { id: bigint }) => {
    const src = `/nouns-samples/${id.toString()}.svg`;
    const fallback = `https://noun.pics/${id.toString()}.svg`;
    return (
      <div className="h-16 w-16 rounded-2xl border border-black/10 bg-white p-1 md:h-20 md:w-20">
        {/* Prefer local asset; fall back to noun.pics to avoid gaps */}
        <img
          src={src}
          alt={`Noun ${id.toString()}`}
          className="h-full w-full rounded-xl object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            if (t.src !== fallback) t.src = fallback;
          }}
        />
      </div>
    );
  };

  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 rounded-3xl bg-[#f7f7ff] p-6 shadow-sm md:gap-12 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="user-theme-headings-font text-3xl font-semibold md:text-4xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>
          These are Nouns
        </h2>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          One new Noun is born each day with randomly generated traits and
          preserved on the blockchain forever.
        </p>
      </div>

      {/* Top marquee (scrolls left) */}
      <div className="relative w-full overflow-hidden">
        <div className="marquee-left flex w-max gap-3" style={{ animation: 'scrollLeft 36s linear infinite' as any }}>
          {rowIds.map((id, i) => (
            <Tile key={`rowA-${i}`} id={id} />
          ))}
        </div>
      </div>
      {/* Bottom marquee (scrolls right) */}
      <div className="relative w-full overflow-hidden">
        <div className="marquee-right flex w-max gap-3" style={{ animation: 'scrollRight 38s linear infinite' as any }}>
          {rowIds.map((id, i) => (
            <Tile key={`rowB-${i}`} id={id} />
          ))}
        </div>
      </div>

      <LinkOut
        href="https://www.nouns.com/explore"
        className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
      >
        Explore Nouns
      </LinkOut>

      {/* keyframes for endless marquee pairs */}
      <style>{`
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </section>
  );
};

export const GetANounSection = ({
  currentAuction,
  countdownMs,
  onScrollToAuction,
  auctionBgHex,
}: {
  currentAuction?: Auction;
  countdownMs?: number;
  onScrollToAuction?: () => void;
  auctionBgHex?: string;
}) => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 rounded-3xl bg-white p-6 shadow-sm md:gap-12 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="user-theme-headings-font text-3xl font-semibold md:text-4xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>Get a Noun!</h2>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Bid, buy, or explore fractional ownership. Choose the best way to make
          a Noun yours.
        </p>
      </div>
      <div className="grid w-full gap-6 md:grid-cols-3">
        {GET_A_NOUN_CARDS.map((card) => {
          const isBid = card.key === 'bid';
          const isShop = card.key === 'shop';
          const isRedeem = card.key === 'redeem';
          const bg = isBid && auctionBgHex ? auctionBgHex : (isRedeem ? '#3B82F6' : '#f7f7ff');
          const CardTag: any = isShop || isRedeem ? LinkOut : 'div';
          const linkProps = isShop || isRedeem ? { href: card.href } : {};
          return (
          <CardTag
            key={card.title}
            {...linkProps}
            className="group relative flex h-full flex-col justify-between gap-4 rounded-3xl p-6 transition-colors hover:brightness-95"
            style={{ backgroundColor: bg }}
          >
            {/* Top chip button with icon + hover arrow */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={isBid ? onScrollToAuction : undefined}
                className="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17171d]"
              >
                <span className="inline-flex items-center gap-1 transition-transform duration-200 group-hover:-translate-x-2">
                  {isBid ? (
                    <Gavel className="h-4 w-4" />
                  ) : isShop ? (
                    <ShoppingBag className="h-4 w-4" />
                  ) : (
                    <Coins className="h-4 w-4" />
                  )}
                  {isBid ? 'Bid' : isShop ? 'Shop' : 'Redeem'}
                </span>
                <ArrowRight className="absolute right-3 h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              {card.description && (
                <p className="text-sm text-muted-foreground">{card.description}</p>
              )}
            </div>

            {/* Card specific content */}
            {isBid ? (
              <div onClick={onScrollToAuction} className="cursor-pointer select-none">
                {currentAuction ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-28 w-auto">
                      <NounImage nounId={currentAuction.nounId} className="h-full w-auto object-contain" />
                    </div>
                    <div className="w-full max-w-xs rounded-2xl bg-white p-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className="rounded-2xl bg-[#eef0f5] px-4 py-2 text-sm">
                          <div className="text-[#5a5a70]">Current bid</div>
                          <div className="font-semibold">{formatEth(currentAuction.amount)}</div>
                        </div>
                        <div className="rounded-2xl bg-[#eef0f5] px-4 py-2 text-sm">
                          <div className="text-[#5a5a70]">Time left</div>
                          <div className="font-semibold">{formatCountdown(countdownMs ?? 0)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <span className="h-2 w-2 rounded-full bg-green-600" /> Live auction
                    </div>
                  </div>
                ) : (
                  <div className="h-28 w-full rounded-2xl bg-white/60" />
                )}
              </div>
            ) : (
              <div className="mt-auto flex h-48 w-full items-end justify-center">
                <img
                  src={card.image}
                  alt={card.title}
                  className="max-h-full w-auto rounded-2xl object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </CardTag>
        );})}
      </div>
    </section>
  );
};

export const AlreadyOwnSection = () => {
  const [instantCount, setInstantCount] = React.useState<number | null>(null);
  const [treasuryCount, setTreasuryCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        // Same owners used by nouns.com
        const erc20 = "0x5c1760c98be951A4067DF234695c8014D8e7619C";
        const treasury = "0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71";
        const [i, t] = await Promise.all([
          fetchNounsCountByOwner(erc20).catch(() => null),
          fetchNounsCountByOwner(treasury).catch(() => null),
        ]);
        setInstantCount(i);
        setTreasuryCount(t);
      } catch (_) {
        // Silently handle errors
      }
    })();
  }, []);

  const cards = [
    {
      title: "Instant Swap",
      description: "Swap your Noun! for another Noun.",
      href: "https://www.nouns.com/explore?instantSwap=1",
      icon: <RefreshCcw className="h-4 w-4" />,
      cta: `${instantCount ?? 7} Nouns Available`,
      image: "https://www.nouns.com/feature/instant-swap/main.png",
      imageClass: "h-44 w-60 object-cover",
    },
    {
      title: "Treasury Swap",
      description: "Offer to trade your Noun with one held by the Treasury.",
      href: "https://www.nouns.com/explore?onlyTreasuryNouns=1",
      icon: <Landmark className="h-4 w-4" />,
      cta: `${treasuryCount ?? 537} Nouns Available`,
      image: "https://www.nouns.com/feature/treasury-swap/main.png",
      imageClass: "h-44 w-44 object-cover object-left",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 rounded-3xl bg-white p-6 md:gap-12 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="user-theme-headings-font text-3xl font-semibold md:text-4xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>
          Already own a Noun?
        </h2>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Swap it for another or trade with the Nouns treasury to find your
          Forever Noun.
        </p>
      </div>
      <div className="grid w-full gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <LinkOut
            key={card.title}
            href={card.href}
            className="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-3xl bg-[#f1f2f8] p-6 transition-colors hover:brightness-95"
          >
            {/* top chip */}
            <div className="flex items-center justify-between">
              <span className="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17171d]">
                <span className="inline-flex items-center gap-1 transition-transform duration-200 group-hover:-translate-x-2">
                  {card.icon}
                  {card.title.includes('Instant') ? 'Swap' : 'Trade'}
                </span>
                <ArrowRight className="absolute right-3 h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1" />
              </span>
            </div>
            <div className="z-[1] mt-3 space-y-2 text-left">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <div className="text-sm font-semibold text-[#3B82F6] inline-flex items-center gap-1">
                {card.cta}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            {/* art bottom-right cropped */}
            <div className="pointer-events-none absolute bottom-0 right-0 flex items-end justify-end">
              <img src={card.image} alt={card.title} className={`translate-x-6 translate-y-4 ${card.imageClass}`} loading="lazy" />
            </div>
          </LinkOut>
        ))}
      </div>
    </section>
  );
};

export const JourneySection = () => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 rounded-3xl bg-white p-6 md:gap-12 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="user-theme-headings-font text-3xl font-semibold md:text-4xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>
          Start your Nouns journey
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Whether you are an artist, technologist, scientist, athlete, or
          someone with big ideas, there is a place for you in the Nouns
          community.
        </p>
      </div>
      <div className="grid w-full gap-6 md:grid-cols-2">
        {JOURNEY_CARDS.map((card) => (
          <LinkOut
            key={card.title}
            href={card.href}
            className={`flex h-full flex-col items-center justify-between gap-6 rounded-3xl p-6 text-center text-white transition hover:brightness-95 md:p-12 ${card.title === 'Join the Nouns Community' ? 'bg-[#8661CD]' : 'bg-black'}`}
          >
            <img src={card.image} alt={card.title} className="h-12 w-12" loading="lazy" />
            <div className="space-y-4">
              <h3 className="user-theme-headings-font text-2xl font-semibold" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>
                {card.title}
              </h3>
              <p className="text-base text-gray-200">{card.description}</p>
            </div>
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
                {card.buttonLabel}
              </span>
              {card.title === 'Join the Nouns Community' && (
                <div className="flex items-center justify-center gap-1 text-gray-200">
                  <img src="https://www.nouns.com/farcaster-followers.png" alt="Farcaster followers" className="h-6 w-[58px]" loading="lazy" />
                  <span className="text-xs uppercase tracking-wider">100k+ Followers</span>
                </div>
              )}
            </div>
          </LinkOut>
        ))}
      </div>
    </section>
  );
};

export const LearnSection = () => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 rounded-3xl bg-[#f7f7ff] p-6 shadow-sm md:gap-12 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">Learn about Nouns DAO</h2>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          All the latest guides, tutorials, and explainers.
        </p>
      </div>
      <div className="grid w-full gap-6 md:grid-cols-3">
        {LEARN_POSTS.map((post) => (
          <LinkOut
            key={post.title}
            href={post.href}
            className="flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-sm"
          >
            <img
              src={post.image}
              alt={post.title}
              className="h-48 w-full object-cover"
              loading="lazy"
            />
            <div className="space-y-3 p-6 text-left">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.description}</p>
            </div>
          </LinkOut>
        ))}
      </div>
      <LinkOut
        href="https://www.nouns.com/learn"
        className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/80"
      >
        See all posts
      </LinkOut>
    </section>
  );
};

export const FaqAccordion = ({
  settlements,
}: {
  settlements?: Settlement[];
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const totalEth = useMemo(() => {
    if (!settlements?.length) return null;
    const sum = settlements.reduce((acc, item) => acc + item.amount, 0n);
    return formatEth(sum);
  }, [settlements]);

  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 rounded-3xl bg-white p-6 shadow-sm md:gap-10 md:p-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">Questions? Answers.</h2>
        {totalEth && (
          <p className="text-sm text-muted-foreground">
            Community auctions have raised {totalEth} for the treasury.
          </p>
        )}
      </div>
      <div className="w-full space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className="rounded-2xl border border-black/10 bg-[#f7f7ff]"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-4 text-left text-base font-semibold"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                {item.question}
                <span aria-hidden>{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen && (
                <div className="space-y-3 px-6 pb-6 text-sm text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
