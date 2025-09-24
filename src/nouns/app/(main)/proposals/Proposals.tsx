"use client";
import WalletButton from "@nouns/components/WalletButton";
import SwapNounGraphic from "@nouns/components/SwapNounGraphic";
import { twMerge } from "tailwind-merge";
import { getNounSwapProposalsForProposer } from "@nouns/data/getNounSwapProposalsForProposer";
import { LinkExternal } from "@nouns/components/ui/link";
import { ProposalState } from "@nouns/utils/types";
import { Suspense } from "react";
import LoadingSpinner from "@nouns/components/LoadingSpinner";
import { CHAIN_CONFIG } from "@nouns/config";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Link from "next/link";

export function Proposals() {
  const { address } = useAccount();
  const { data: proposals } = useQuery({
    queryKey: ["noun-swap-proposals-for-proposer", address],
    queryFn: () => getNounSwapProposalsForProposer(address!),
    enabled: address != undefined,
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 text-content-secondary">
      {address == undefined ? (
        <div className="flex w-full flex-col items-center justify-center gap-6 rounded-3xl border-4 px-4 py-24 text-center">
          <h4 className="text-content-primary">
            Connect your wallet to view your props
          </h4>
          <WalletButton />
        </div>
      ) : proposals?.length == 0 ? (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-4 py-24 text-center">
          <h4 className="text-content-primary">
            You don{"'"}t have any Swap Props
          </h4>
          <span>
            You can create one from the{" "}
            <Suspense fallback={<LoadingSpinner />}>
              <Link
                href="/"
                className="inline text-semantic-accent hover:text-semantic-accent-dark"
              >
                Explore Page
              </Link>
            </Suspense>
          </span>
        </div>
      ) : (
        <>
          {proposals?.map((proposal, i) => {
            return (
              <LinkExternal
                href={
                  proposal.state == ProposalState.Candidate
                    ? CHAIN_CONFIG.nounsGovernanceUrl +
                      "/candidates/" +
                      proposal.id
                    : "/vote/" + proposal.id
                }
                className="flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-border-secondary p-6 text-center text-content-secondary hover:bg-background-secondary md:flex-row md:justify-start md:text-start"
                key={i}
              >
                <SwapNounGraphic
                  fromNoun={proposal.fromNoun}
                  toNoun={proposal.toNoun}
                />
                <div className="flex flex-col justify-center md:justify-start">
                  <h4 className="text-content-primary">
                    Prop{" "}
                    {proposal.state == ProposalState.Candidate
                      ? "Candidate"
                      : proposal.id}
                  </h4>
                  <div className="text-content-secondary">
                    Swap Noun {proposal.fromNoun.id} for Noun{" "}
                    {proposal.toNoun.id}
                  </div>
                </div>
                <div
                  className={twMerge(
                    "ml-auto flex w-full justify-center justify-self-end rounded-2xl bg-background-disabled px-8 py-4 font-londrina text-white md:w-auto",
                    (proposal.state == ProposalState.Active ||
                      proposal.state == ProposalState.Pending) &&
                      "bg-semantic-positive",
                    (proposal.state == ProposalState.Defeated ||
                      proposal.state == ProposalState.Vetoed) &&
                      "bg-semantic-negative",
                    (proposal.state == ProposalState.Executed ||
                      proposal.state == ProposalState.Succeeded) &&
                      "bg-semantic-accent",
                  )}
                >
                  {proposal.state}
                </div>
              </LinkExternal>
            );
          })}
        </>
      )}
    </div>
  );
}
