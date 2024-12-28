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

const BuilderProposalItem = ({
  proposal,
  setProposal,
}: {
  proposal: any;
  setProposal: (proposalId: string) => void;
}) => {
  const handleProposalClick = () => {
    console.log("Proposal clicked:", proposal.proposalId);
    setProposal(proposal.proposalId);
  };
  return (
    <div
      onClick={handleProposalClick}
      className={mergeClasses(
        "flex overflow-hidden border border-gray-200 bg-gray-50 rounded-[8px]",
        "p-3 py-2.5 gap-3 cursor-pointer hover:bg-white items-center",
      )}
    >
      <div className="flex flex-col md:flex flex-auto flex-nowrap gap-1.5">
        <p className="flex-auto font-medium text-sm/[1.25] mb-0">
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
      {/* <StatusBadge status={proposal.status} /> */}
    </div>
  );
};

export default BuilderProposalItem;
