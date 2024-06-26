import React from "react";
import { Button } from "@/common/components/atoms/button";
import { FaArrowLeft } from "react-icons/fa6";
import { RiExternalLinkLine } from "react-icons/ri";
import { Progress } from "@/common/components/atoms/progress";
import type { ProposalData } from "@/fidgets/community/nouns-dao";
import { StatusBadge } from "@/fidgets/community/nouns-dao/components/ProposalListView";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import Spinner from "@/common/components/atoms/spinner";

const VoteStat = ({ label, value, total, _color }) => {
  return (
    <div
      className={mergeClasses(
        "grid gap-1 flex-1 text-center rounded-[8px]",
        "border border-gray-200 bg-gray-50 p-2 px-3",
      )}
    >
      <div className={`text-xs/[1.25] text-${_color}`}>{label}</div>
      <div className="text-sm/[1.25] text-gray-800 font-medium">{value}</div>
      <Progress
        className="h-[6px] rounded-[2px] mt-[2px]"
        value={(100 * Number(value)) / Number(total)}
        indicatorClassName={`bg-${_color}`}
      />
    </div>
  );
};

const InfoBox = ({ label, subtext, value }) => {
  return (
    <div
      className={mergeClasses(
        "flex flex-col items-center justify-center content-center text-center",
        "gap-2 flex-1 border border-gray-200 bg-gray-50 rounded-[8px] p-2 px-3",
      )}
    >
      <div className="text-sm/[1.25] flex-auto text-gray-800 font-semibold">
        {label}
      </div>
      <div className="flex flex-col flex-auto gap-1 text-center">
        <div className="text-xs/[1.25] text-gray-500 font-medium whitespace-nowrap">
          {subtext}
        </div>
        <div className="text-sm/[1.25] text-gray-800 font-semibold">
          {value}
        </div>
      </div>
    </div>
  );
};

const AddressInfo = ({ label, address }) => {
  const href = `https://etherscan.io/address/${address}/`;

  if (!address) {
    return null;
  }

  return (
    <div className="flex gap-y-1 gap-x-2 overflow-hidden flex-wrap">
      <label className="text-gray-500 text-xs/[1.25]">{label}</label>
      <a
        className="overflow-hidden"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        <p className="text-red-500 text-xs/[1.25] font-medium text-ellipsis overflow-hidden">
          {address}
        </p>
      </a>
    </div>
  );
};

export const ProposalDetailView = ({
  proposal,
  goBack,
  loading,
}: {
  proposal: ProposalData;
  goBack: () => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center size-full">
        <Spinner />
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  const proposer = proposal.proposer;
  const sponsor = proposal.signers.length ? proposal.signers[0] : null;
  const updates = proposal.status.updateMessages;
  const version = 1 + updates.length;

  const votes = {
    for: proposal.votes.filter((v) => v.support == "FOR").length,
    nay: proposal.votes.filter((v) => v.support == "AGAINST").length,
    abs: proposal.votes.filter((v) => v.support == "ABSTAIN").length,
    total: proposal.votes.length,
    quorum: proposal.quorumVotes,
  };

  return (
    <div className="flex flex-col size-full">
      <div className="flex justify-between pb-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-none h-8 w-8"
          onClick={goBack}
        >
          <FaArrowLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-none h-8 w-8"
        >
          <RiExternalLinkLine size={16} />
        </Button>
      </div>
      <div className="flex-auto overflow-hidden">
        <div className="flex flex-col gap-4 h-full overflow-auto">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <span className="flex-none mr-2 text-gray-700 font-medium text-xs/[1.25]">
                  Proposal {proposal.proposalId}
                </span>
                <StatusBadge
                  status={proposal.status.currentStatus}
                  className="px-[8px] rounded-[6px]  text-[10px]/[1.25] font-medium"
                />
              </div>
              <p className="font-medium text-base/[1.25]">{proposal.title}</p>
              {(proposer || sponsor) && (
                <div className="flex gap-4">
                  <AddressInfo label="Proposed by" address={proposer} />
                  <AddressInfo label="Sponsored by" address={sponsor} />
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <StatusBadge
                className={mergeClasses(
                  "px-[8px] rounded-[6px] bg-gray-100",
                  "hover:bg-gray-100 text-[10px]/[1.25] font-medium",
                )}
              >
                Version {version}
              </StatusBadge>
              {/* <span className="text-[10px]/[1.25] text-gray-500">Created on</span> */}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <VoteStat
                label="For"
                value={votes.for}
                total={votes.total}
                _color="green-600"
              />
              <VoteStat
                label="Against"
                value={votes.nay}
                total={votes.total}
                _color="red-500"
              />
              <VoteStat
                label="Abstain"
                value={votes.abs}
                total={votes.total}
                _color="gray-900"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <InfoBox
                label="Threshold"
                subtext="Threshold"
                value={`${votes.quorum} votes`}
              />
              {/* <InfoBox label="Ends" subtext={"11:32 PM GMT"} value={"Jun 2, 2024"} /> */}
              <InfoBox
                label="Snapshot"
                subtext="Taken at block"
                value={proposal.startBlock}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailView;
