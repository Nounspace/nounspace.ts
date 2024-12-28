import React from "react";
import { Button } from "@/common/components/atoms/button";
import { Progress } from "@/common/components/atoms/progress";
import Spinner from "@/common/components/atoms/spinner";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa6";
import { RiExternalLinkLine } from "react-icons/ri";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { StatusBadge } from "./BuilderProposalItem";
import { estimateBlockTime, getProposalState } from "./ProposalListRowItem";
import ReactMarkdown from "react-markdown";

const VoteStat = ({ label, value, total, progressColor, labelColor }) => {
  const percentage = Math.round((100.0 * value) / total);
  return (
    <div
      className={mergeClasses(
        "grid gap-1 flex-1 text-center rounded-[8px]",
        "border border-gray-200 bg-gray-50 p-2 px-3",
      )}
    >
      <div className="text-xs/[1.25]" style={{ color: labelColor }}>
        {label}
      </div>
      <div className="text-sm/[1.25] text-gray-800 font-medium">
        {String(value)}
      </div>
      <Progress
        className="h-[6px] rounded-[2px] mt-[2px]"
        value={percentage}
        indicatorStyles={{
          background: progressColor,
        }}
      />
    </div>
  );
};

const InfoBox = ({ label, subtext, value }) => {
  return (
    <div
      className={mergeClasses(
        "flex flex-col items-center text-center",
        "gap-1.5 flex-1 border border-gray-200 bg-white rounded-[8px] p-2 px-3",
      )}
    >
      <div className="text-xs/[1.25] flex-auto text-gray-800 font-medium">
        {label}
      </div>
      <div className="flex flex-col flex-auto gap-1 text-center">
        <div className="text-[10px]/[1.25] text-gray-500 font-medium whitespace-nowrap">
          {subtext}
        </div>
        <div className="text-xs/[1.25] text-gray-800 font-semibold">
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
    <div className="flex flex-col flex-0 gap-y-1 gap-x-2 overflow-hidden flex-nowrap">
      <label className="text-gray-500 text-xs/[1.25] whitespace-nowrap">
        {label}
      </label>
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

export const NounsProposalDetailView = ({
  proposal,
  versions,
  goBack,
  currentBlock,
  loading,
}: {
  proposal: any;
  versions: any[];
  goBack: () => void;
  currentBlock: { number: number; timestamp: number };
  loading: boolean;
}) => {
  const proposer = proposal?.proposer?.id;
  const sponsor = proposal?.signers?.length
    ? proposal.signers[0].id
    : undefined;
  const version = versions?.length;

  const { data: proposerEnsName } = useEnsName({
    address: proposer,
    chainId: mainnet.id,
  });

  const { data: sponsorEnsName } = useEnsName({
    address: sponsor,
    chainId: mainnet.id,
  });

  const proposerEnsOrAddress = proposerEnsName ?? proposer;
  const sponsorEnsOrAddress = sponsorEnsName ?? sponsor;

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

  const votes = {
    for: Number(proposal.forVotes),
    against: Number(proposal.againstVotes),
    abstain: Number(proposal.abstainVotes),
    quorum: Number(proposal.quorumVotes),
  };

  const totalVotes = votes.for + votes.against + votes.abstain;

  const lastUpdated = versions?.[0]?.createdAt
    ? moment(Number(versions[0].createdAt) * 1000).fromNow()
    : "N/A";
  const lastUpdatedText =
    version === 1 ? `Created ${lastUpdated}` : `Updated ${lastUpdated}`;

  const endDate = currentBlock
    ? estimateBlockTime(
        Number(proposal.endBlock),
        currentBlock.number,
        currentBlock.timestamp,
      )
    : new Date();
  const formattedEndDate = moment(endDate).format("MMM D, YYYY");
  const formattedEndTime = moment(endDate).format("h:mm A");

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
        <a
          href={`https://www.nouns.camp/proposals/${proposal.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-none h-8 w-8"
          >
            <RiExternalLinkLine size={16} />
          </Button>
        </a>
      </div>
      <div className="flex-auto overflow-hidden">
        <div
          className="flex flex-col gap-4 h-full overflow-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <span className="flex-none mr-2 text-gray-700 font-medium text-xs/[1.25]">
                  Proposal {proposal.id}
                </span>
                <StatusBadge
                  status={getProposalState(proposal, currentBlock)}
                  className="px-[8px] rounded-[6px]  text-[10px]/[1.25] font-medium"
                />
              </div>
              <p className="font-medium text-base/[1.25]">{proposal.title}</p>
              {(proposer || sponsor) && (
                <div className="flex gap-4">
                  <AddressInfo
                    label="Proposed by"
                    address={proposerEnsOrAddress}
                  />
                  <AddressInfo
                    label="Sponsored by"
                    address={sponsorEnsOrAddress}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <StatusBadge
                className={mergeClasses(
                  "px-[8px] rounded-[6px] bg-gray-100",
                  "hover:bg-gray-100 text-[10px]/[1.25] font-semibold",
                )}
              >
                Version {version}
              </StatusBadge>
              <span className="text-[10px]/[1.25] text-gray-500">
                {lastUpdatedText}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <VoteStat
                label="For"
                value={votes.for}
                total={totalVotes}
                labelColor="#0E9F6E"
                progressColor="#31C48D"
              />
              <VoteStat
                label="Against"
                value={votes.against}
                total={totalVotes}
                labelColor="#F05252"
                progressColor="#F05252"
              />
              <VoteStat
                label="Abstain"
                value={votes.abstain}
                total={totalVotes}
                labelColor="#6B7280"
                progressColor="#111928"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <InfoBox
                label="Threshold"
                subtext="Threshold"
                value={`${votes.quorum} votes`}
              />
              <InfoBox
                label="Ends"
                subtext={formattedEndTime}
                value={formattedEndDate}
              />
              <InfoBox
                label="Snapshot"
                subtext="Taken at block"
                value={proposal.voteSnapshotBlock}
              />
            </div>
            <ReactMarkdown className="prose">
              {proposal.description}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NounsProposalDetailView;
