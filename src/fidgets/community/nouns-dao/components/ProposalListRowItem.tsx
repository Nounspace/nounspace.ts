import React from "react";
import { Badge } from "@/common/components/atoms/badge";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import moment from "moment";
import { MdAccessTimeFilled } from "react-icons/md";

const baseBadgeClassNames =
  "rounded-lg shadow-none font-semibold text-[11px] gap-1 min-w-[110px] flex justify-center text-center";

const statusBadgeClassNames = {
  ACTIVE: "bg-[#0E9F6E]",
  EXECUTED: "bg-blue-600",
  CANCELLED: "bg-gray-500",
  DEFEATED: "bg-red-600",
  QUEUED: "bg-gray-500",
  PENDING: "bg-white border border-orange-600 text-orange-600",
  OBJECTION_PERIOD: "bg-yellow-500",
  UPDATABLE: "bg-purple-500",
  "": "text-gray-600 bg-gray-200",
};

const statusTextOverrides = {
  ACTIVE: "Active",
  EXECUTED: "Executed",
  CANCELLED: "Cancelled",
  DEFEATED: "Defeated",
  QUEUED: "Queued",
  PENDING: "Updatable",
  OBJECTION_PERIOD: "Objection Period",
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
  // Create a debug object to collect all information
  const debug = {
    id: proposal.id,
    title: proposal.title?.substring(0, 20) + "...",
    blocks: {},
    calculations: {},
    conditions: {},
    result: "",
    serverStatus: proposal.status || "Not provided"
  };

  const {
    startBlock,
    endBlock,
    quorumVotes,
    objectionPeriodEndBlock,
    updatePeriodEndBlock,
    forVotes,
    againstVotes,
    abstainVotes,
    canceledTimestamp,
    queuedTimestamp,
    executedTimestamp,
  } = proposal;

  // Convert strings to numbers for reliable comparison
  const startBlockNum = Number(startBlock);
  const endBlockNum = Number(endBlock);
  const objectionPeriodEndBlockNum = Number(objectionPeriodEndBlock);
  const updatePeriodEndBlockNum = Number(updatePeriodEndBlock);
  const forVotesNum = Number(forVotes);
  const againstVotesNum = Number(againstVotes);
  const abstainVotesNum = Number(abstainVotes);
  const quorumVotesNum = Number(quorumVotes);
  const currentBlockNum = currentBlock.number;

  // Determine relative block position first - using let instead of const to allow reassignment
  let isBeforeStart = currentBlockNum < startBlockNum;
  let isDuringVoting = currentBlockNum >= startBlockNum && currentBlockNum <= endBlockNum;
  let isAfterVoting = currentBlockNum > endBlockNum;

  // Check for potential chain/network mismatch
  const blockDiscrepancy = Math.abs(currentBlockNum - startBlockNum);
  const isLikelyDifferentChain = blockDiscrepancy > 1000000; // If blocks are more than 1M apart

  // For chain mismatches, use time-based estimates
  if (isLikelyDifferentChain) {
    // Use current time and creation timestamp for relative position
    const now = Math.floor(Date.now() / 1000);
    const createdTimestamp = Number(proposal.createdTimestamp || 0);
    const avgBlockTime = 12; // Ethereum average seconds per block

    // Estimate when the proposal starts voting based on block delta
    const startBlockDelta = startBlockNum - Number(proposal.createdBlock || 0);
    const estimatedStartTime = createdTimestamp + (startBlockDelta * avgBlockTime);

    // Estimate when voting ends
    const votingDuration = endBlockNum - startBlockNum;
    const estimatedEndTime = estimatedStartTime + (votingDuration * avgBlockTime);

    // Override block-based checks with time-based ones
    if (now < estimatedStartTime) {
      isBeforeStart = true;
      isDuringVoting = false;
      isAfterVoting = false;
    } else if (now >= estimatedStartTime && now <= estimatedEndTime) {
      isBeforeStart = false;
      isDuringVoting = true;
      isAfterVoting = false;
    } else {
      isBeforeStart = false;
      isDuringVoting = false;
      isAfterVoting = true;
    }
  }

  // Calculate vote-related metrics
  const totalVotes = forVotesNum + againstVotesNum + abstainVotesNum;
  const hasMetQuorum = totalVotes >= quorumVotesNum;

  // Calculate dynamic threshold
  const minThreshold = 80;
  const maxThreshold = 120;
  const dynamicThreshold = Math.min(
    maxThreshold,
    minThreshold +
    (maxThreshold - minThreshold) *
    (againstVotesNum / (totalVotes || 1)),
  );

  // Check if the proposal has met vote requirements
  const hasEnoughForVotes = forVotesNum >= dynamicThreshold;
  const hasEnoughVotes = hasMetQuorum && hasEnoughForVotes;

  // Check period validities
  const isInPreVoteUpdatablePeriod =
    updatePeriodEndBlockNum > 0 &&
    updatePeriodEndBlockNum < startBlockNum &&
    (!isLikelyDifferentChain && currentBlockNum < updatePeriodEndBlockNum);

  const isObjectionPeriodValid = objectionPeriodEndBlockNum > endBlockNum;
  const isUpdatePeriodValid =
    updatePeriodEndBlockNum > endBlockNum &&
    (objectionPeriodEndBlockNum === 0 || updatePeriodEndBlockNum > objectionPeriodEndBlockNum);

  // Check if proposal is in objection period
  const isInObjectionPeriod =
    isAfterVoting &&
    hasEnoughVotes &&
    isObjectionPeriodValid &&
    (!isLikelyDifferentChain && currentBlockNum < objectionPeriodEndBlockNum);

  // Check if proposal is in post-vote updatable period
  const isInPostVoteUpdatablePeriod =
    isAfterVoting &&
    hasEnoughVotes &&
    isUpdatePeriodValid &&
    (objectionPeriodEndBlockNum === 0 ||
      (!isLikelyDifferentChain && currentBlockNum >= objectionPeriodEndBlockNum)) &&
    (!isLikelyDifferentChain && currentBlockNum < updatePeriodEndBlockNum);

  // Determine if the proposal is defeated based on votes and block numbers
  const isDefeatedByVotes = isAfterVoting && !hasMetQuorum;
  const isDefeatedByThreshold = isAfterVoting && hasMetQuorum && !hasEnoughForVotes;
  const isDefeatedByExpiry =
    isAfterVoting &&
    hasEnoughVotes &&
    (!isUpdatePeriodValid ||
      (!isLikelyDifferentChain && currentBlockNum >= updatePeriodEndBlockNum)) &&
    !queuedTimestamp;

  const isDefeated = isDefeatedByVotes || isDefeatedByThreshold || isDefeatedByExpiry;

  // Log all calculation data
  debug.calculations = {
    totalVotes,
    quorumRequired: quorumVotesNum,
    quorumMet: hasMetQuorum,
    dynamicThreshold,
    forVotes: forVotesNum,
    forVotesEnough: hasEnoughForVotes,
    isDefeatedByVotes,
    isDefeatedByThreshold,
    isDefeatedByExpiry
  };

  debug.blocks = {
    currentBlock: currentBlockNum,
    startBlock: startBlockNum,
    endBlock: endBlockNum,
    updatePeriodEndBlock: updatePeriodEndBlockNum,
    objectionPeriodEndBlock: objectionPeriodEndBlockNum,
    blockDiscrepancy,
    isLikelyDifferentChain
  };

  debug.conditions = {
    isBeforeStart,
    isDuringVoting,
    isAfterVoting,
    isInPreVoteUpdatablePeriod,
    isInObjectionPeriod,
    isInPostVoteUpdatablePeriod,
    isDefeated,
    timestamps: {
      canceled: !!canceledTimestamp,
      executed: !!executedTimestamp,
      queued: !!queuedTimestamp
    }
  };

  // Determine proposal status
  let result = "UNKNOWN";

  // First check explicit states based on timestamps
  if (canceledTimestamp) {
    result = "CANCELLED";
  } else if (executedTimestamp) {
    result = "EXECUTED";
  } else if (queuedTimestamp) {
    result = "QUEUED";
  }
  // Then check states based on voting period and results
  else if (isInPreVoteUpdatablePeriod) {
    result = "UPDATABLE"; // Pre-vote updatable period
  } else if (isBeforeStart) {
    result = "PENDING";
  } else if (isDuringVoting) {
    result = "ACTIVE";
  } else if (isInObjectionPeriod) {
    result = "OBJECTION_PERIOD";
  } else if (isInPostVoteUpdatablePeriod) {
    result = "UPDATABLE"; // Post-vote updatable period
  } else if (isDefeated) {
    result = "DEFEATED";
  }

  // Only check server status at the end if we couldn't determine state ourselves
  if (result === "UNKNOWN" && proposal.status && proposal.status !== "UNKNOWN") {
    result = proposal.status;
  }

  debug.result = result;

  // Only log for specific proposals or those with issues
  if (result === "DEFEATED" || result === "UPDATABLE" ||
    proposal.id === "771" || proposal.id === "772" || proposal.id === "773") {
    //console.log("Proposal Debug:", debug);
  }

  return result;
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

  // Additional logging for specific problematic proposals
  if (proposal.id === "772" || proposal.id === "773") {
    //console.log(`Proposal ${proposal.id} final status:`, proposalStatus);
  }

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