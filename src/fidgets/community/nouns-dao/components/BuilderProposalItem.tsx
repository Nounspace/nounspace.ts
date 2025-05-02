import { Badge } from "@/common/components/atoms/badge";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import moment from "moment";
import React from "react";
import { MdAccessTimeFilled } from "react-icons/md";

export enum Status {
  CANCELLED = 'CANCELLED',
  QUEUED = 'QUEUED',
  EXECUTED = 'EXECUTED',
  VETOED = 'VETOED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DEFEATED = 'DEFEATED',
  SUCCEEDED = 'SUCCEEDED',
  EXPIRED = 'EXPIRED',
}

const baseBadgeClassNames =
  "rounded-lg shadow-none font-semibold text-[11px] gap-1 min-w-[85px] text-center px-2 justify-center";

const statusBadgeClassNames: Record<Status | string, string> = {
  [Status.ACTIVE]: "bg-[#0E9F6E]",
  [Status.EXECUTED]: "bg-blue-600",
  [Status.CANCELLED]: "bg-gray-500",
  [Status.DEFEATED]: "bg-red-600",
  [Status.QUEUED]: "bg-gray-500",
  [Status.PENDING]: "bg-white border border-orange-600 text-orange-600",
  [Status.VETOED]: "bg-gray-500",
  [Status.SUCCEEDED]: "bg-blue-600",
  [Status.EXPIRED]: "bg-red-600",
  "": "text-gray-600 bg-gray-200",
};

const statusTextOverrides: Record<Status | string, string> = {
  [Status.ACTIVE]: "Active",
  [Status.EXECUTED]: "Executed",
  [Status.CANCELLED]: "Cancelled",
  [Status.DEFEATED]: "Defeated",
  [Status.QUEUED]: "Queued",
  [Status.PENDING]: "Updatable",
  [Status.VETOED]: "Vetoed",
  [Status.SUCCEEDED]: "Succeeded",
  [Status.EXPIRED]: "Expired",
  "": "",
};

export const getProposalStatus = (proposal: any): Status => {
  const currentTime = new Date().getTime();

  // Check for cancelled proposals using different possible property names
  if (proposal.canceled || proposal.cancelled ||
    proposal.status === 'CANCELLED' || proposal.status === Status.CANCELLED) {
    return Status.CANCELLED;
  }

  if (proposal.expiresAt && proposal.queued) {
    const voteExpireTime = parseInt(proposal.expiresAt) * 1000;
    if (currentTime > voteExpireTime) return Status.EXPIRED;
  }

  if (proposal.executed) return Status.EXECUTED;
  if (proposal.vetoed) return Status.VETOED;
  if (proposal.queued) return Status.QUEUED;

  // Handle case where proposal data might not have all required fields
  if (!proposal.voteStart || !proposal.voteEnd) {
    // If the proposal has a status field, use it
    if (proposal.status) {
      return proposal.status as Status;
    }
    return Status.PENDING; // Default fallback
  }

  const voteStartTime = parseInt(proposal.voteStart) * 1000;
  const voteEndTime = parseInt(proposal.voteEnd) * 1000;

  if (currentTime < voteStartTime) return Status.PENDING;

  if (currentTime > voteStartTime && currentTime < voteEndTime)
    return Status.ACTIVE;

  if (currentTime > voteEndTime) {
    return proposal.forVotes > proposal.againstVotes &&
      proposal.forVotes > parseInt(proposal.quorumVotes)
      ? Status.SUCCEEDED
      : Status.DEFEATED;
  }

  return Status.EXPIRED;
};

export const StatusBadge = ({
  status,
  className,
  children,
}: {
  status?: Status | string;
  className?: string | null;
  children?: React.ReactNode | null;
}) => {
  return (
    <Badge
      className={mergeClasses(
        baseBadgeClassNames,
        statusBadgeClassNames[status ?? ""],
        className,
      )}
      variant="default"
    >
      {children ?? statusTextOverrides[status ?? ""] ?? status}
    </Badge>
  );
};


const BuilderProposalItem = ({
  proposal,
  setProposal,
  headingsFont,
  bodyFont,
}: {
  proposal: any;
  setProposal: (proposalId: string, proposal?: any) => void;
  headingsFont?: string;
  bodyFont?: string;
}) => {
  const handleProposalClick = () => {
    setProposal(proposal.proposalId);
  };

  // Calculate the proposal status
  const proposalStatus = getProposalStatus(proposal);

  return (
    <div
      onClick={handleProposalClick}
      className={mergeClasses(
        "flex overflow-hidden border border-gray-200 bg-gray-50 rounded-[8px]",
        "p-3 py-2.5 gap-3 cursor-pointer hover:bg-white items-center",
      )}
      style={{ fontFamily: bodyFont }}
    >
      <div className="flex flex-col md:flex flex-auto flex-nowrap gap-1.5">
        <p className="flex-auto font-medium text-sm/[1.25] mb-0" style={{ fontFamily: headingsFont }}>
          <span className="flex-none mr-2 text-gray-400 font-bold">
            {proposal.proposalNumber}
          </span>
          {proposal.title}
        </p>
        <div>
          <Badge
            className={mergeClasses(
              baseBadgeClassNames,
              "text-gray-600 bg-gray-200",
            )}
            variant="secondary"
          >
            <MdAccessTimeFilled size={12} className="text-gray-500" />
            {"Created " + moment.unix(proposal.timeCreated).fromNow()}
          </Badge>
        </div>
      </div>
      <StatusBadge status={proposalStatus} />
    </div>
  );
};

export default BuilderProposalItem;
