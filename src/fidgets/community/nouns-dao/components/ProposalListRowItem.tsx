import React from "react";
import { Badge } from "@/common/components/atoms/badge";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import moment from "moment";
import { MdAccessTimeFilled } from "react-icons/md";

const baseBadgeClassNames =
  "rounded-lg shadow-none font-semibold text-[11px] gap-1";

const statusBadgeClassNames = {
  ACTIVE: "bg-[#0E9F6E]",
  EXECUTED: "bg-blue-600",
  CANCELLED: "bg-gray-500",
  DEFEATED: "bg-red-600",
  QUEUED: "bg-gray-500",
  PENDING: "bg-white border border-orange-600 text-orange-600",
  "": "text-gray-600 bg-gray-200",
};

const statusTextOverrides = {
  ACTIVE: "Active",
  EXECUTED: "Executed",
  CANCELLED: "Cancelled",
  DEFEATED: "Defeated",
  QUEUED: "Queued",
  PENDING: "Updatable",
};

export const StatusBadge = ({
  status,
  className,
  children,
}: {
  status?: string;
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

export const estimateBlockTime = (
  blockNumber: number,
  currentBlockNumber: number,
  currentBlockTimestamp: number,
  secondsPerBlock: number = 12,
) => {
  const blocksDelta = blockNumber - currentBlockNumber;
  const secondsDelta = blocksDelta * secondsPerBlock;
  const estimatedUnix = (currentBlockTimestamp + secondsDelta) * 1000;
  return new Date(estimatedUnix);
};

const getProposalState = (proposal: any, currentBlock: any) => {
  const {
    startBlock,
    endBlock,
    eta,
    quorumVotes,
    objectionPeriodEndBlock,
    updatePeriodEndBlock,
    executionETA,
    forVotes,
    againstVotes,
    abstainVotes,
  } = proposal;

  if (currentBlock < startBlock) {
    return "PENDING";
  } else if (currentBlock >= startBlock && currentBlock <= endBlock) {
    return "ACTIVE";
  } else if (
    currentBlock > endBlock &&
    forVotes + againstVotes + abstainVotes < quorumVotes
  ) {
    return "DEFEATED";
  } else if (
    currentBlock > endBlock &&
    forVotes > againstVotes &&
    currentBlock < objectionPeriodEndBlock
  ) {
    return "OBJECTION_PERIOD";
  } else if (
    currentBlock > endBlock &&
    forVotes > againstVotes &&
    currentBlock < updatePeriodEndBlock
  ) {
    return "UPDATABLE";
  } else if (
    currentBlock > endBlock &&
    forVotes > againstVotes &&
    currentBlock >= updatePeriodEndBlock &&
    currentBlock < eta
  ) {
    return "QUEUED";
  } else if (currentBlock >= eta && currentBlock < executionETA) {
    return "EXECUTED";
  } else if (currentBlock >= executionETA) {
    return "EXPIRED";
  } else {
    return "UNKNOWN";
  }
};

const ProposalListRowItem = ({
  proposal,
  setProposal,
  currentBlock,
}: {
  proposal: any;
  setProposal: (proposalId: string, proposal: any) => void;
  currentBlock: any;
}) => {
  const proposalStatus = getProposalState(proposal, currentBlock);

  const getDateBadgeText = () => {
    if (!["ACTIVE", "PENDING"].includes(proposalStatus)) {
      return null;
    }
    const startBlock = Number(proposal.startBlock);
    const endBlock = Number(proposal.endBlock);

    if (currentBlock < startBlock) {
      const startDate = estimateBlockTime(
        startBlock,
        currentBlock,
        currentBlock.timestamp,
      );
      return "Starts " + moment(startDate).fromNow();
    } else if (currentBlock < endBlock) {
      const endDate = estimateBlockTime(
        endBlock,
        currentBlock,
        currentBlock.timestamp,
      );
      return "Ends " + moment(endDate).fromNow();
    }
    return null;
  };
  const dateBadgeText = getDateBadgeText();

  return (
    <div
      onClick={() => {
        setProposal(proposal.id, proposal);
      }}
      className={mergeClasses(
        "flex overflow-hidden border border-gray-200 bg-gray-50 rounded-[8px]",
        "p-3 py-2.5 gap-3 cursor-pointer hover:bg-white items-center",
      )}
    >
      <div className="flex flex-col md:flex flex-auto flex-nowrap gap-1.5">
        <p className="flex-auto font-medium text-sm/[1.25] mb-0">
          <span className="flex-none mr-2 text-gray-400 font-bold">
            {proposal.id}
          </span>
          {proposal.title}
        </p>
        {dateBadgeText && (
          <div>
            <Badge
              className={mergeClasses(
                baseBadgeClassNames,
                "text-gray-600 bg-gray-200",
              )}
              variant="secondary"
            >
              <MdAccessTimeFilled size={12} className="text-gray-500" />
              {dateBadgeText}
            </Badge>
          </div>
        )}
      </div>
      <StatusBadge status={proposal.status} />
      {/* TODO: change for newer implementation */}
    </div>
  );
};

export default ProposalListRowItem;
