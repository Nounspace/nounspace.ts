'use client';

import React, { useState } from "react";
import LinkOut from "../LinkOut";

const mosaicColors = [
  "#ffb4c6",
  "#ffd966",
  "#9be7ff",
  "#d1c4e9",
  "#ffe082",
  "#c5e1a5",
  "#ffccbc",
  "#cfd8dc",
  "#f8bbd0",
];

export const ThisIsNounsSection = () => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <div className="grid gap-10 md:grid-cols-[2fr_3fr] md:items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold md:text-4xl">This is Nouns</h2>
          <p className="text-lg text-muted-foreground">
            A new Noun is born every 24 hours. Holders steward a powerful DAO
            treasury and meme the Nouns identity into culture.
          </p>
          <LinkOut
            href="https://nouns.wtf/what-is-nouns"
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
          >
            Learn the story
          </LinkOut>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 18 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl"
              style={{ backgroundColor: mosaicColors[index % mosaicColors.length] }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const NounsFundsIdeasSection = () => {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-[#141414] via-[#1d1d27] to-[#221d33] p-6 text-white shadow-sm md:p-10">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold">Nouns funds ideas.</h2>
          <LinkOut
            href="https://nouns.wtf/vote"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/80"
          >
            Explore proposals
          </LinkOut>
        </div>
        <p className="max-w-2xl text-base text-white/70">
          Everyday people propose projects for the DAO to back-from public goods
          to wild creative endeavors. If it spreads Nouns, it might get funded.
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70"
            >
              Noun {index + 1}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TheseAreNounsStrip = () => {
  return (
    <section className="rounded-3xl bg-[#fdf2ff] p-6 shadow-sm md:p-10">
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold">These are Nouns</h2>
        <p className="text-muted-foreground">
          Each Noun is generated on-chain with a unique combination of traits.
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-9">
          {Array.from({ length: 18 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-2xl border border-dashed border-black/10 bg-white"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const nounActions = [
  {
    title: "Bid on a Noun",
    body: "Win the daily auction and join the DAO.",
    href: "https://nouns.wtf/nouns",
    accent: "#ffd966",
  },
  {
    title: "Build with Nouns",
    body: "Propose ideas, make art, or launch a derivative.",
    href: "https://nouns.center",
    accent: "#b39ddb",
  },
  {
    title: "Learn the lore",
    body: "Dig into the docs, podcasts, and community guides.",
    href: "https://nouns.wtf/about",
    accent: "#9be7ff",
  },
];

export const GetANounSection = () => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <h2 className="text-3xl font-semibold">Get a Noun</h2>
      <p className="mt-2 text-muted-foreground">
        Three steps to join the Nouns experiment.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {nounActions.map((action) => (
          <article
            key={action.title}
            className="flex h-full flex-col justify-between rounded-3xl border border-black/10 bg-[#f7f7ff] p-6"
            style={{ borderColor: action.accent }}
          >
            <div className="space-y-3">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold"
                style={{ backgroundColor: action.accent }}
              >
                NOUN
              </div>
              <h3 className="text-xl font-semibold">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.body}</p>
            </div>
            <LinkOut
              href={action.href}
              className="mt-6 inline-flex items-center text-sm font-semibold text-[#5a5aff] hover:underline"
            >
              Learn more &gt;
            </LinkOut>
          </article>
        ))}
      </div>
    </section>
  );
};

const ownershipLinks = [
  {
    title: "Swap or sell",
    description: "List your Noun or make OTC deals with holders.",
    href: "https://nouns.wtf/trade",
  },
  {
    title: "Delegate votes",
    description: "Empower another builder to steward your influence.",
    href: "https://nouns.wtf/delegates",
  },
];

export const AlreadyOwnSection = () => {
  return (
    <section className="rounded-3xl bg-[#14141c] p-6 text-white shadow-sm md:p-10">
      <h2 className="text-3xl font-semibold">Already own a Noun?</h2>
      <p className="mt-2 max-w-xl text-white/70">
        Stay engaged with treasury proposals or find new collaborations with
        fellow Nouners.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ownershipLinks.map((link) => (
          <article key={link.title} className="rounded-3xl bg-white/10 p-6">
            <h3 className="text-xl font-semibold">{link.title}</h3>
            <p className="mt-2 text-sm text-white/70">{link.description}</p>
            <LinkOut
              href={link.href}
              className="mt-4 inline-flex text-sm font-semibold text-white hover:underline"
            >
              Visit resource &gt;
            </LinkOut>
          </article>
        ))}
      </div>
    </section>
  );
};

const journeyLinks = [
  {
    title: "Join the community",
    body: "Hop into the Nouns Discord and meet holders across the globe.",
    href: "https://discord.gg/nouns",
    color: "#b388ff",
  },
  {
    title: "Explore proposals",
    body: "Vote on treasury usage or follow the latest idea flow.",
    href: "https://nouns.wtf/vote",
    color: "#141414",
  },
];

export const JourneySection = () => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <h2 className="text-3xl font-semibold">Start your Nouns journey</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {journeyLinks.map((link) => (
          <article
            key={link.title}
            className="flex h-full flex-col justify-between rounded-3xl p-6"
            style={{ backgroundColor: link.color, color: link.color === "#141414" ? "white" : "#141414" }}
          >
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">{link.title}</h3>
              <p className="text-sm opacity-80">{link.body}</p>
            </div>
            <LinkOut
              href={link.href}
              className="mt-6 inline-flex text-sm font-semibold hover:underline"
              style={{ color: link.color === "#141414" ? "white" : "#141414" }}
            >
              Dive in &gt;
            </LinkOut>
          </article>
        ))}
      </div>
    </section>
  );
};

const learnCards = [
  {
    title: "Governance 101",
    description: "How the DAO operates, funds ideas, and evolves the meme.",
    href: "https://nouns.center/learn/governance",
  },
  {
    title: "Discuss with Nouners",
    description: "Join discourse, Twitter Spaces, and community calls.",
    href: "https://nouns.camp/",
  },
  {
    title: "WTF is a DAO?",
    description: "Get the beginner's take on decentralized organizations.",
    href: "https://nouns.center/learn/dao-basics",
  },
];

export const LearnSection = () => {
  return (
    <section className="rounded-3xl bg-[#f5f5ff] p-6 shadow-sm md:p-10">
      <h2 className="text-3xl font-semibold">Learn about Nouns DAO</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {learnCards.map((card) => (
          <article key={card.title} className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            <LinkOut
              href={card.href}
              className="mt-4 inline-flex text-sm font-semibold text-[#5a5aff] hover:underline"
            >
              Read more &gt;
            </LinkOut>
          </article>
        ))}
      </div>
    </section>
  );
};

const faqItems = [
  {
    question: "What is Nouns?",
    answer:
      "Nouns is an experimental avatar community that auctions one new character every day and lets holders govern a shared treasury.",
  },
  {
    question: "Who can bid on Nouns?",
    answer:
      "Anyone with an Ethereum wallet and ETH can bid in the daily auction. The highest bid at expiry wins the Noun.",
  },
  {
    question: "Where does auction revenue go?",
    answer:
      "ETH from winning bids flows directly into the on-chain Nouns DAO treasury, which holders manage collectively.",
  },
  {
    question: "What does owning a Noun unlock?",
    answer:
      "Ownership gives you a unique NFT, a vote in governance, and access to a global network of creators and builders.",
  },
  {
    question: "How do proposals work?",
    answer:
      "Nouners and delegates can craft proposals. If enough votes pass quorum, the DAO executes them trustlessly on-chain.",
  },
  {
    question: "Is Nouns open-source?",
    answer:
      "Yes. All core contracts and artwork are open-source and permissively licensed for experimentation.",
  },
  {
    question: "What are Nounish builders?",
    answer:
      "Sub-communities like Nouns Builder spin up their own Nounish DAOs using similar auction mechanics.",
  },
  {
    question: "Where can I follow updates?",
    answer:
      "Check nouns.wtf, the Nouns Discord, and community podcasts for the latest drops.",
  },
];

export const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <h2 className="text-3xl font-semibold">Questions? Answers.</h2>
      <div className="mt-6 space-y-2">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className="rounded-2xl border border-black/10 bg-[#f8f8ff]"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-medium"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                {item.question}
                <span aria-hidden>{isOpen ? "-" : "+"}</span>
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm text-muted-foreground">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
