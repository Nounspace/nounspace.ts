import React from "react";
import { Badge } from "@/common/components/atoms/badge";
import type { ProposalData } from "@/fidgets/community/nouns-dao";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";
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

const ProposalListRowItem = ({
  proposal,
  setProposal,
  currentBlock,
}: {
  proposal: ProposalData;
  setProposal: (proposal: ProposalData) => void;
  currentBlock: any;
}) => {
  const getDateBadgeText = () => {
    if (!["ACTIVE", "PENDING"].includes(proposal.status)) {
      return null;
    }
    const startBlock = Number(proposal.startBlock);
    const endBlock = Number(proposal.endBlock);

    if (currentBlock.number < startBlock) {
      const startDate = estimateBlockTime(
        startBlock,
        currentBlock.number,
        currentBlock.timestamp,
      );
      return "Starts " + moment(startDate).fromNow();
    } else if (currentBlock.number < endBlock) {
      const endDate = estimateBlockTime(
        endBlock,
        currentBlock.number,
        currentBlock.timestamp,
      );
      return "Ends " + moment(endDate).fromNow();
    }
    return null;
  };
  const dateBadgeText = getDateBadgeText();

  return (
    <div
      onClick={() => setProposal(proposal.id)}
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
    </div>
  );
};

export const ProposalListView = ({
  proposals,
  setProposal,
  currentBlock,
  loading,
}: {
  proposals: ProposalData[];
  setProposal: (proposal: ProposalData) => void;
  currentBlock: any;
  loading: boolean;
}) => {
  if (loading) {
    return <div>Fetching data...</div>;
  }

  return (
    <>
      <CardHeader className="px-0 pt-2 pb-4">
        <CardDescription className="font-semibold text-sm/[1.0]">
          Nouns DAO
        </CardDescription>
        <CardTitle className="text-xl">Proposals</CardTitle>
      </CardHeader>
      <div className="grid gap-2">
        {proposals.map((proposal, i) => (
          <ProposalListRowItem
            key={i}
            proposal={proposal}
            setProposal={setProposal}
            currentBlock={currentBlock}
          />
        ))}
      </div>
    </>
  );
};

export default ProposalListView;
