/* eslint-disable react/react-in-jsx-scope */
import { Button } from "@/common/components/atoms/button";
import { Progress } from "@/common/components/atoms/progress";
import Spinner from "@/common/components/atoms/spinner";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import type {
  BuilderProposalData,
  NounsProposalData,
  ProposalData,
} from "@/fidgets/community/nouns-dao";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa6";
import { RiExternalLinkLine } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Address } from "viem";
import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { StatusBadge } from "./BuilderProposalItem";
import { estimateBlockTime } from "./ProposalListRowItem";

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
      <div className="text-sm/[1.25] text-gray-800 font-medium">{value}</div>
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

export const BuilderProposalDetailView = ({
  proposal,
  versions,
  goBack,
  currentBlock,
  loading,
  headingsFont,
  bodyFont,
}: {
  proposal: ProposalData;
  versions: any[];
  goBack: () => void;
  currentBlock: { number: number; timestamp: number };
  loading: boolean;
  headingsFont?: string;
  bodyFont?: string;
}) => {
  const proposer =
    (proposal as BuilderProposalData).proposer ||
    (proposal as NounsProposalData).proposer.id;
  const version = versions?.length;

  const { data: proposerEnsName } = useEnsName({
    address: proposer as Address,
    chainId: mainnet.id,
  });

  const proposerEnsOrAddress = proposerEnsName ?? proposer;

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
      Number((proposal as BuilderProposalData).voteEnd),
      currentBlock.number,
      currentBlock.timestamp,
    )
    : new Date();
  const formattedEndDate = moment(endDate).format("MMM D, YYYY");
  const formattedEndTime = moment(endDate).format("h:mm A");

  return (
    <div className="flex flex-col size-full" style={{ fontFamily: bodyFont }}>
      <div className="flex justify-between pb-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-none h-8 w-8"
          onClick={goBack}
        >
          <FaArrowLeft />
        </Button>
        {(proposal as BuilderProposalData).dao?.tokenAddress && (
          <a
            href={`https://www.nouns.build/dao/base/${(proposal as BuilderProposalData).dao.tokenAddress}/vote/${(proposal as BuilderProposalData).proposalNumber}`}
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
        )}
      </div>
      <div className="flex-auto overflow-hidden">
        <div
          className="flex flex-col gap-4 h-full overflow-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <StatusBadge
                  status={proposal.status}
                  className="px-[8px] rounded-[6px]  text-[10px]/[1.25] font-medium"
                />
              </div>
              <p className="font-medium text-base/[1.25]" style={{ fontFamily: headingsFont }}>{proposal.title}</p>
              {proposer && (
                <AddressInfo label="Proposer" address={proposerEnsOrAddress} />
              )}
            </div>

            <div className="flex gap-2">
              <div className="bg-gray-200 px-2 py-1 text-[10px]/[1.25] font-medium rounded-[4px] text-gray-700 flex-0">
                #{(proposal as BuilderProposalData).proposalNumber || "N/A"}
              </div>
              <div className="bg-gray-200 px-2 py-1 text-[10px]/[1.25] font-medium rounded-[4px] text-gray-700 flex-0">
                {lastUpdatedText}
              </div>
              <div className="bg-gray-200 px-2 py-1 text-[10px]/[1.25] font-medium rounded-[4px] text-gray-700 flex-0">
                Ends {formattedEndDate} at {formattedEndTime}
              </div>
              {version && (
                <div className="bg-gray-200 px-2 py-1 text-[10px]/[1.25] font-medium rounded-[4px] text-gray-700 flex-0">
                  Version {version}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <VoteStat
                label="For"
                value={votes.for}
                total={totalVotes}
                progressColor="#33BB33"
                labelColor="#33BB33"
              />
              <VoteStat
                label="Against"
                value={votes.against}
                total={totalVotes}
                progressColor="#DD3333"
                labelColor="#DD3333"
              />
              <VoteStat
                label="Abstain"
                value={votes.abstain}
                total={totalVotes}
                progressColor="#333333"
                labelColor="#333333"
              />
            </div>
            <div className="flex gap-2 text-xs">
              <InfoBox
                label="Quorum"
                subtext="Votes"
                value={`${votes.quorum}`}
              />
              <InfoBox
                label="Start Block"
                subtext="Block Number"
                value={(proposal as BuilderProposalData).voteStart}
              />
              <InfoBox
                label="End Block"
                subtext="Block Number"
                value={(proposal as BuilderProposalData).voteEnd}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 pb-8 font-normal">
            <h2 className="font-medium text-sm/[1.25]" style={{ fontFamily: headingsFont }}>Description</h2>
            <div className="text-sm/[1.25] border border-gray-200 p-4 rounded-md whitespace-pre-wrap">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={MarkdownRenderers()}
              >
                {proposal.description}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderProposalDetailView;
