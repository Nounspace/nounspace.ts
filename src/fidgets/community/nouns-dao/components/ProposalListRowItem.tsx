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

export const getProposalState = (
  proposal: any,
  currentBlock: { number: number; timestamp: number },
) => {
  const {
    id,
    startBlock,
    endBlock,
    quorumVotes,
    createdTimestamp,
    objectionPeriodEndBlock,
    updatePeriodEndBlock,
    forVotes,
    againstVotes,
    abstainVotes,
    canceledTimestamp,
    queuedTimestamp,
    executedTimestamp,
  } = proposal;

  const minThreshold = 80;
  const maxThreshold = 120;
  const dynamicThreshold = Math.min(
    maxThreshold,
    minThreshold +
      (maxThreshold - minThreshold) *
        (Number(againstVotes) /
          (Number(forVotes) + Number(againstVotes) + Number(abstainVotes))),
  );

  if (canceledTimestamp) {
    return "CANCELLED";
  } else if (executedTimestamp) {
    return "EXECUTED";
  } else if (queuedTimestamp) {
    return "QUEUED";
  } else if (currentBlock.number < Number(startBlock)) {
    return "PENDING";
  } else if (
    currentBlock.number >= Number(startBlock) &&
    currentBlock.number <= Number(endBlock)
  ) {
    return "ACTIVE";
  } else if (
    currentBlock.number > Number(endBlock) &&
    (Number(forVotes) + Number(againstVotes) + Number(abstainVotes) <
      Number(quorumVotes) ||
      Number(forVotes) < dynamicThreshold)
  ) {
    return "DEFEATED";
  } else if (
    currentBlock.number > Number(endBlock) &&
    Number(forVotes) >= dynamicThreshold &&
    currentBlock.number < Number(objectionPeriodEndBlock)
  ) {
    return "OBJECTION_PERIOD";
  } else if (
    currentBlock.number > Number(endBlock) &&
    Number(forVotes) >= dynamicThreshold &&
    currentBlock.number < Number(updatePeriodEndBlock)
  ) {
    return "UPDATABLE";
  } else if (
    currentBlock.number > Number(endBlock) &&
    Number(forVotes) >= dynamicThreshold &&
    currentBlock.number >= Number(updatePeriodEndBlock)
  ) {
    return "DEFEATED"; // If not queued by this point, it's defeated
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
  currentBlock: { number: number; timestamp: number };
}) => {
  const proposalStatus = getProposalState(proposal, currentBlock);

  const getDateBadgeText = () => {
    if (!["ACTIVE", "PENDING"].includes(proposalStatus)) {
      return null;
    }
    const startBlock = Number(proposal.startBlock);
    const endBlock = Number(proposal.endBlock);

    if (currentBlock.number < startBlock) {
      const startDate = estimateBlockTime(
        startBlock,
        currentBlock.number,
        currentBlock.timestamp / 1000, // Convert timestamp to seconds
      );
      return "Starts " + moment(startDate).fromNow();
    } else if (currentBlock.number < endBlock) {
      const endDate = estimateBlockTime(
        endBlock,
        currentBlock.number,
        currentBlock.timestamp / 1000, // Convert timestamp to seconds
      );
      return "Ends " + moment(endDate).fromNow();
    }
    return null;
  };

  const dateBadgeText = getDateBadgeText();

  if (proposal.id === "712") {
    console.log(proposal, getProposalState(proposal, currentBlock));
  }

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
      <StatusBadge status={proposalStatus} />
    </div>
  );
};

export default ProposalListRowItem;
