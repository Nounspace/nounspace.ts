import { ProposalOverview } from "@nouns/data/ponder/governance/common";
import { formatTimeLeft } from "@nouns/utils/format";
import clsx from "clsx";
import { truncate } from "lodash";
import Link from "next/link";
import Icon from "../ui/Icon";
import { ProposalStateBadge } from "./ProposalStateBadge";

export function ProposalOverviewCard({
  proposalOverview,
}: {
  proposalOverview: ProposalOverview;
}) {
  const votes = (
    <div className="flex gap-3">
      <span>For: {proposalOverview.forVotes}</span>
      <span>Against: {proposalOverview.againstVotes}</span>
      <span>Abstain: {proposalOverview.abstainVotes}</span>
    </div>
  );

  const nowTimestamp = Math.floor(Date.now() / 1000);
  const startTimeDelta = Math.max(
    proposalOverview.votingStartTimestamp - nowTimestamp,
    0,
  );
  const endTimeDelta = Math.max(
    proposalOverview.votingEndTimestamp - nowTimestamp,
    0,
  );

  const timeToVotingStartFormatted = formatTimeLeft(startTimeDelta, true);
  const timeToVotingEndFormatted = formatTimeLeft(endTimeDelta, true);

  return (
    <Link
      href={`/vote/${proposalOverview.id}`}
      className="flex w-full justify-between rounded-[16px] border p-4 transition-colors hover:bg-background-ternary"
    >
      <div className="flex w-full items-center gap-6">
        <div
          className={clsx(
            "flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-[8px] label-md md:self-auto",
            {
              "bg-background-secondary text-semantic-accent":
                proposalOverview.state === "active",
              "bg-semantic-positive text-white":
                proposalOverview.state === "successful" ||
                proposalOverview.state === "queued" ||
                proposalOverview.state === "executed",
              "bg-semantic-negative text-white":
                proposalOverview.state === "failed" ||
                proposalOverview.state === "cancelled" ||
                proposalOverview.state === "expired",
              "bg-semantic-warning text-content-primary":
                proposalOverview.state === "vetoed",
              "bg-background-secondary text-content-secondary":
                proposalOverview.state === "updateable" ||
                proposalOverview.state === "pending",
            },
          )}
        >
          {proposalOverview.id}
        </div>
        <div className="flex h-full w-full min-w-0 flex-col justify-between gap-3">
          <div className="overflow-hidden label-lg md:text-ellipsis md:whitespace-nowrap">
            {truncate(proposalOverview.title, { length: 65 })}
          </div>

          <div className="flex flex-col justify-between gap-3 text-content-secondary label-sm md:flex-row">
            {proposalOverview.state == "updateable" ||
            proposalOverview.state == "pending" ? (
              <div className="flex items-center gap-1">
                <Icon
                  icon="clock"
                  size={16}
                  className="fill-content-secondary"
                />
                <span>Starts in {timeToVotingStartFormatted}</span>
              </div>
            ) : (
              votes
            )}
            <div className="flex flex-row-reverse justify-end gap-1 md:flex-row md:justify-start">
              {proposalOverview.state == "active" && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="block md:hidden">•</span>
                    <Icon
                      icon="clock"
                      size={16}
                      className="fill-content-secondary"
                    />
                    <span>{timeToVotingEndFormatted} left</span>
                  </div>
                  <span className="hidden md:block">•</span>
                </>
              )}
              <ProposalStateBadge state={proposalOverview.state} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NoProposals({
  type,
  searchFilterActive,
}: {
  type: string;
  searchFilterActive: boolean;
}) {
  return (
    <div className="flex h-[85px] w-full items-center justify-center rounded-[16px] border bg-gray-100 p-4 text-center">
      There are no {type} proposals
      {searchFilterActive && " matching the search filter"}.
    </div>
  );
}
