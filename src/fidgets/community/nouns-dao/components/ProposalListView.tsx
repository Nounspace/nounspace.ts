import React from "react";
import { Badge } from "@/common/components/atoms/badge";
import type { ProposalData } from "@/fidgets/community/nouns-dao";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";

const baseBadgeClassNames = "rounded-lg shadow-none font-semibold text-[11px]";

const statusBadgeClassNames = {
  Active: "bg-emerald-600",
  Executed: "bg-blue-600",
  Canceled: "bg-gray-500",
  Defeated: "bg-red-600",
  Pending: "bg-white border border-orange-600 text-orange-600",
  "": "text-gray-600 bg-gray-200",
};

const statusTextOverrides = {
  Pending: "Updatable",
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

const ProposalListRowItem = ({
  proposal,
  setProposal,
}: {
  proposal: ProposalData;
  setProposal: (proposal: ProposalData) => void;
}) => {
  const status = proposal.status.currentStatus;
  const dateBadgeText = "";

  const dateBadgeClassName = mergeClasses(
    baseBadgeClassNames,
    "text-gray-600 bg-gray-200",
  );

  return (
    <div
      onClick={() => setProposal(proposal.proposalId)}
      className={mergeClasses(
        "flex overflow-hidden border border-gray-200 bg-gray-50 rounded-[8px]",
        "p-3 py-2.5 gap-3 cursor-pointer hover:bg-white items-center",
      )}
    >
      <div className="grid md:flex flex-auto flex-nowrap gap-2">
        <p className="flex-auto font-medium text-sm/[1.25] mb-0">
          <span className="flex-none mr-2 text-gray-400 font-bold">
            {proposal.proposalId}
          </span>
          {proposal.title}
        </p>
        {dateBadgeText && (
          <div className="">
            <Badge className={dateBadgeClassName} variant="secondary">
              {dateBadgeText}
            </Badge>
          </div>
        )}
      </div>
      <StatusBadge status={status} />
    </div>
  );
};

export const ProposalListView = ({
  proposals,
  setProposal,
  loading,
}: {
  proposals: ProposalData[];
  setProposal: (proposal: ProposalData) => void;
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
          />
        ))}
      </div>
    </>
  );
};

export default ProposalListView;
