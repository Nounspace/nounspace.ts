"use client";
import { CHAIN_CONFIG } from "@nouns/config";
import { VoteValue } from "@nouns/data/generated/ponder/graphql";
import { ProposalVote as ProposalVoteType } from "@nouns/data/ponder/governance/getProposal";
import { Avatar, Name } from "@paperclip-labs/whisk-sdk/identity";
import clsx from "clsx";
import { getAddress } from "viem";
import { LinkExternal } from "../ui/link";
import MarkdownRenderer from "../MarkdownRenderer";
import { formatTimeLeft } from "@nouns/utils/format";
import { useCreateVoteContext } from "./CreateVote/CreateVoteProvider";
import { ProposalState } from "@nouns/data/ponder/governance/common";
import ExpandableContent from "../ExpandableContent";
import { Ellipsis } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ProposalVoteProps {
  vote: ProposalVoteType;
  proposalState: ProposalState;
}

export default function ProposalVote({
  vote,
  proposalState,
}: ProposalVoteProps) {
  const timestamp = Math.floor(Date.now() / 1000);
  const timeDelta = Math.max(timestamp - Number(vote.timestamp), 0);

  const { addReply, addRevote } = useCreateVoteContext();

  return (
    <div className="flex gap-4">
      <Avatar
        address={getAddress(vote.voterAddress)}
        size={40}
        className="mt-1"
      />

      <div className="flex w-full min-w-0 flex-col justify-center gap-1 paragraph-sm">
        <div className="flex w-full items-center justify-between gap-2">
          <div
            className={clsx("inline whitespace-pre-wrap label-md", {
              "text-semantic-positive": vote.value === VoteValue.For,
              "text-semantic-negative": vote.value === VoteValue.Against,
              "text-content-secondary": vote.value === VoteValue.Abstain,
            })}
          >
            <LinkExternal
              href={
                CHAIN_CONFIG.publicClient.chain?.blockExplorers?.default.url +
                "/address/" +
                vote.voterAddress
              }
              className="inline *:inline hover:underline"
            >
              <Name
                address={getAddress(vote.voterAddress)}
                className="inline text-content-primary *:inline"
              />
            </LinkExternal>{" "}
            voted {vote.value.toLowerCase()} ({vote.weight})
          </div>
          <Popover>
            <PopoverTrigger className="flex h-full justify-start pt-0.5">
              <Ellipsis size={20} className="stroke-content-secondary" />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex flex-col overflow-hidden bg-background-secondary p-0 text-content-primary"
            >
              <LinkExternal
                href={
                  CHAIN_CONFIG.publicClient.chain?.blockExplorers?.default.url +
                  "/tx/" +
                  vote.transactionHash
                }
                className="bg-background-secondary p-2 transition-all"
              >
                Etherscan
              </LinkExternal>
            </PopoverContent>
          </Popover>
        </div>

        {vote.voteRevotes?.items.map(({ revote }, i) =>
          revote ? (
            <Revote
              revoteVoterAddress={revote.voterAddress}
              revoteReason={revote.reason ?? ""}
              revoteValue={revote.value}
              key={i}
            />
          ) : null,
        )}

        {vote.voteReplies?.items.map(({ replyVote, reply }, i) =>
          replyVote ? (
            <Reply
              voterAddress={replyVote.voterAddress}
              reason={replyVote.reason ?? ""}
              value={replyVote.value}
              reply={reply}
              key={i}
            />
          ) : null,
        )}

        <ExpandableContent maxCollapsedHeight={80}>
          <MarkdownRenderer>{vote.reason ?? ""}</MarkdownRenderer>
        </ExpandableContent>

        <div className="flex items-center gap-6 paragraph-sm">
          <span className="text-content-secondary">
            {formatTimeLeft(timeDelta, true)}
          </span>
          <div
            className={clsx(
              "flex items-center gap-6",
              (!vote.reason ||
                vote.reason == "" ||
                proposalState != "active") &&
                "hidden",
            )}
          >
            <button onClick={() => addReply(vote)} className="hover:underline">
              Reply
            </button>
            <button onClick={() => addRevote(vote)} className="hover:underline">
              Revote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Revote({
  revoteVoterAddress,
  revoteReason,
  revoteValue,
}: {
  revoteVoterAddress: string;
  revoteReason: string;
  revoteValue: VoteValue;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 overflow-hidden rounded-[12px] border px-3 py-2">
      <div className="flex gap-1">
        <Avatar address={getAddress(revoteVoterAddress)} size={20} />
        <Name address={getAddress(revoteVoterAddress)} />
        <span
          className={clsx({
            "text-semantic-positive": revoteValue === VoteValue.For,
            "text-semantic-negative": revoteValue === VoteValue.Against,
            "text-content-secondary": revoteValue === VoteValue.Abstain,
          })}
        >
          ({revoteValue.toLowerCase()})
        </span>
      </div>

      <ExpandableContent maxCollapsedHeight={40}>
        <MarkdownRenderer>{revoteReason}</MarkdownRenderer>
      </ExpandableContent>
    </div>
  );
}

function Reply({
  voterAddress,
  reason,
  value,
  reply,
}: {
  voterAddress: string;
  reason: string;
  value: VoteValue;
  reply: string;
}) {
  return (
    <div>
      <Revote
        revoteVoterAddress={voterAddress}
        revoteReason={reason}
        revoteValue={value}
      />
      <div className="flex gap-2">
        <div className="relative w-[20px] shrink-0">
          <div className="absolute right-0 top-0 h-[19px] w-[7px] rounded-bl-[12px] border-b border-l"></div>
        </div>
        <div className="pt-2">
          <ExpandableContent maxCollapsedHeight={40}>
            <MarkdownRenderer>{reply}</MarkdownRenderer>
          </ExpandableContent>
        </div>
      </div>
    </div>
  );
}
