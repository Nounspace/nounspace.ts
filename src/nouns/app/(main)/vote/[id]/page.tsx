import { getProposal } from "@nouns/data/ponder/governance/getProposal";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import MarkdownRenderer from "@nouns/components/MarkdownRenderer";
import { ProposalStateBadge } from "@nouns/components/Proposal/ProposalStateBadge";
import ProposalTransactionSummary from "@nouns/components/Proposal/ProposalTransactionSummary";
import {
  SidebarMainContent,
  SidebarProvider,
  SidebarSideContent,
} from "@nouns/components/Sidebar/ProposalSidebar";
import { CreateVote } from "@nouns/components/Proposal/CreateVote";
import CreateVoteProvider from "@nouns/components/Proposal/CreateVote/CreateVoteProvider";
import { Skeleton } from "@nouns/components/ui/skeleton";
import { redirect } from "next/navigation";
import LoadingSkeletons from "@nouns/components/LoadingSkeletons";
import VotingSummary from "@nouns/components/Proposal/VotingSummary";
import { IdentityExplorerLink } from "@nouns/components/IdentityExplorerLink";
import {
  SubnavTabs,
  SubnavTabsContent,
  SubnavTabsList,
  SubnavTabsTrigger,
} from "@nouns/components/SubnavTab";
import { Button } from "@nouns/components/ui/button";
import { formatTimeLeft } from "@nouns/utils/format";
import Icon from "@nouns/components/ui/Icon";
import FilteredSortedProposalVotes, {
  VOTE_SORT_ITEMS,
} from "@nouns/components/Proposal/FilteredSortedProposalVotes";
import SearchProvider, { SearchInput } from "@nouns/components/Search";
import SortProvider, { SortSelect } from "@nouns/components/Sort";
import { TooltipPopover } from "@nouns/components/ui/tooltipPopover";
import { ResponsiveContent } from "@nouns/components/ResponsiveContet";
import { getProposalTitle } from "@nouns/data/ponder/governance/getProposalTitle";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const proposalTitle = await getProposalTitle(Number(id));

  const title = `Proposal ${id} | Nouns DAO`;
  const description = proposalTitle ?? "Vote now";
  const ogImageUrl = `${process.env.NEXT_PUBLIC_URL}/api/og/vote/${id}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          alt: "Nouns DAO Vote",
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: "./",
    },
  };
}

export default async function IndividualVotePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = parseInt(params.id);

  if (isNaN(id)) {
    redirect("/vote");
  }

  return (
    <CreateVoteProvider>
      <SearchProvider>
        <SortProvider defaultSortValue="recent">
          {/* Desktop */}
          <div className="hidden w-full lg:block">
            <SidebarProvider>
              <SidebarMainContent>
                <div className="flex w-full max-w-[780px] flex-col gap-8 p-6 pb-24 md:p-10 md:pb-24">
                  <div className="flex w-full flex-col gap-8 md:px-4">
                    <div className="flex items-center gap-2 paragraph-sm">
                      <Link href="/vote">Proposals</Link>
                      <ChevronRight
                        size={16}
                        className="stroke-content-secondary"
                      />
                      <span className="text-content-secondary">
                        Proposal {id}
                      </span>
                    </div>

                    <Suspense
                      fallback={
                        <LoadingSkeletons
                          count={3}
                          className="h-[80px] w-full"
                        />
                      }
                    >
                      <ProposalTopWrapper proposalId={id} />
                    </Suspense>

                    <Suspense
                      fallback={
                        <LoadingSkeletons
                          count={20}
                          className="h-[200px] w-full"
                        />
                      }
                    >
                      <ProposalMarkdownWrapper proposalId={id} />
                    </Suspense>
                  </div>

                  <Suspense fallback={null}>
                    {/* Prevent render on mobile as it causes issue with drawer state */}
                    <ResponsiveContent screenSizes={["lg"]}>
                      <CreateVoteWrapper proposalId={id} />
                    </ResponsiveContent>
                  </Suspense>
                </div>
              </SidebarMainContent>
              <SidebarSideContent className="flex flex-col gap-8 p-6 pb-24 pt-10 scrollbar-thin">
                <div className="flex flex-col gap-4">
                  <h2 className="heading-6">Proposal votes</h2>
                  <Suspense
                    fallback={<Skeleton className="h-[112px] w-full" />}
                  >
                    <VotingSummaryWrapper proposalId={id} />
                  </Suspense>
                </div>

                <div className="flex justify-between">
                  <div>
                    <h2 className="heading-5">Activity</h2>
                    <LearnHowActivityWorksTooltipPopover />
                  </div>
                  <SortSelect items={VOTE_SORT_ITEMS} className="w-[160px]" />
                </div>
                <SearchInput
                  placeholder="Search activity"
                  className="w-full bg-background-primary"
                />
                <div className="flex flex-col gap-6 pb-[48px]">
                  <Suspense
                    fallback={
                      <LoadingSkeletons
                        count={30}
                        className="h-[80px] w-full"
                      />
                    }
                  >
                    <VotesWrapper proposalId={id} />
                  </Suspense>
                </div>
              </SidebarSideContent>
            </SidebarProvider>
          </div>

          {/* Mobile */}
          <div className="flex w-full max-w-[780px] flex-col gap-8 p-6 pb-24 md:p-10 md:pb-24 lg:hidden">
            <div className="flex items-center gap-2 paragraph-sm">
              <Link href="/vote">Proposals</Link>
              <ChevronRight size={16} className="stroke-content-secondary" />
              <span className="text-content-secondary">Proposal {id}</span>
            </div>

            <Suspense
              fallback={
                <LoadingSkeletons count={3} className="h-[80px] w-full" />
              }
            >
              <ProposalTopWrapper proposalId={id} />
            </Suspense>

            <SubnavTabs defaultTab="proposal" className="w-full">
              <SubnavTabsList className="sticky top-[64px] z-[1]">
                <SubnavTabsTrigger tab="proposal">Proposal</SubnavTabsTrigger>
                <SubnavTabsTrigger tab="activity">Activity</SubnavTabsTrigger>
              </SubnavTabsList>
              <SubnavTabsContent tab="proposal">
                <Suspense
                  fallback={
                    <LoadingSkeletons count={20} className="h-[200px] w-full" />
                  }
                >
                  <ProposalMarkdownWrapper proposalId={id} />
                </Suspense>
              </SubnavTabsContent>
              <SubnavTabsContent tab="activity" className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <LearnHowActivityWorksTooltipPopover />
                  <SortSelect
                    items={VOTE_SORT_ITEMS}
                    className="h-[44px] w-full"
                  />
                  <SearchInput
                    placeholder="Search activity"
                    className="w-full bg-background-primary"
                  />
                </div>
                <Suspense
                  fallback={
                    <LoadingSkeletons count={30} className="h-[80px] w-full" />
                  }
                >
                  <VotesWrapper proposalId={id} />
                </Suspense>
              </SubnavTabsContent>
            </SubnavTabs>

            <Suspense fallback={null}>
              {/* Prevent render on desktop as it causes issue with form */}
              <ResponsiveContent screenSizes={["sm", "md"]}>
                <CreateVoteWrapper proposalId={id} />
              </ResponsiveContent>
            </Suspense>
          </div>
        </SortProvider>
      </SearchProvider>
    </CreateVoteProvider>
  );
}

async function ProposalTopWrapper({ proposalId }: { proposalId: number }) {
  const proposal = await getProposal(proposalId);
  if (!proposal) {
    return (
      <div className="flex h-screen w-full flex-col items-center gap-4 py-8 text-center">
        <h2>Ooops, prop {proposalId} not found.</h2>
        <Link href="/vote">
          <Button className="rounded-full">Back to proposals</Button>
        </Link>
      </div>
    );
  }

  const nowTimestamp = Math.floor(Date.now() / 1000);
  const endTimeDelta = Math.max(proposal.votingEndTimestamp - nowTimestamp, 0);
  const timeToVotingEndFormatted = formatTimeLeft(endTimeDelta, true);

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="heading-3">{proposal.title}</h1>
        <div className="flex gap-2 text-content-secondary label-sm">
          {proposal.state === "active" && (
            <div className="flex items-center gap-1">
              <Icon icon="clock" size={16} className="fill-content-secondary" />
              <span>{timeToVotingEndFormatted} left • </span>
            </div>
          )}
          <ProposalStateBadge state={proposal.state} />
        </div>
      </div>

      <div className="w-full md:hidden">
        <VotingSummary
          forVotes={proposal.forVotes}
          againstVotes={proposal.againstVotes}
          abstainVotes={proposal.abstainVotes}
          quorumVotes={proposal.quorumVotes}
        />
      </div>

      <div className="flex flex-wrap items-center whitespace-pre-wrap border-b border-t py-6 leading-7 text-content-secondary">
        Proposed by{" "}
        <IdentityExplorerLink address={proposal.proposerAddress} showAvatar />
        {proposal.sponsorAddresses.length > 0 && (
          <>
            , sponsored by{" "}
            {proposal.sponsorAddresses.map((sponsor, i) => (
              <span
                key={i}
                className="inline-flex items-center whitespace-pre-wrap"
              >
                <IdentityExplorerLink address={sponsor} showAvatar />
                {i < proposal.sponsorAddresses.length - 1 && ", "}
              </span>
            ))}
          </>
        )}
      </div>

      <ProposalTransactionSummary transactions={proposal.transactions} />
    </>
  );
}

function LearnHowActivityWorksTooltipPopover() {
  return (
    <TooltipPopover
      trigger={
        <div className="text-content-secondary underline transition-all label-sm hover:brightness-90">
          Learn how activity works
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p>
          The Activity Feed offers a real-time view of proposal participation,
          including votes, comments, and discussions. Anyone can leave a
          comment, but only Nouns delegates can vote on proposals.
        </p>
        <Link
          href="/learn/nouns-dao-governance-explained"
          className="underline"
        >
          Learn more about Governance
        </Link>
      </div>
    </TooltipPopover>
  );
}

async function ProposalMarkdownWrapper({ proposalId }: { proposalId: number }) {
  const proposal = await getProposal(proposalId);
  if (!proposal) {
    return null;
  }

  return (
    <MarkdownRenderer className="gap-4">
      {proposal.description}
    </MarkdownRenderer>
  );
}

async function VotingSummaryWrapper({ proposalId }: { proposalId: number }) {
  const proposal = await getProposal(proposalId);
  if (!proposal) {
    return null;
  }

  return (
    <VotingSummary
      forVotes={proposal.forVotes}
      againstVotes={proposal.againstVotes}
      abstainVotes={proposal.abstainVotes}
      quorumVotes={proposal.quorumVotes}
    />
  );
}

async function VotesWrapper({ proposalId }: { proposalId: number }) {
  const proposal = await getProposal(proposalId);
  if (!proposal) {
    return null;
  }

  return <FilteredSortedProposalVotes proposal={proposal} />;
}

async function CreateVoteWrapper({ proposalId }: { proposalId: number }) {
  const proposal = await getProposal(proposalId);

  if (!proposal || proposal.state !== "active") {
    return null;
  }

  return <CreateVote proposal={proposal} />;
}
