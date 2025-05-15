import { Button } from "@/common/components/atoms/button";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";
import React, { useReducer, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
    renderApprovalVotingUI,
    renderRankedChoiceVotingUI,
    renderSingleChoiceVotingUI,
    renderWeightedVotingUI,
} from "../utils/renderVotingUI";
import { Action, initialState, reducer, State } from "../utils/stateManagement";
import voteOnProposal, { ProposalType } from "../utils/voteOnProposal";

interface ProposalItemProps {
  proposal: any;
  space: string;
  headingsFont: string;
  headingsColor: string;
  bodyFont: string;
  bodyColor: string;
}

const ProposalItem: React.FC<ProposalItemProps> = ({ 
  proposal, 
  space, 
  headingsFont,
  headingsColor,
  bodyFont,
  bodyColor,
}) => {
  const extractImageUrl = (markdown: string): string | null => {
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = imageRegex.exec(markdown);
    return match ? match[1] : null;
  };

  const [avatarUrl, setAvatarUrl] = useState<string>(
    extractImageUrl(proposal.body) ||
      `https://cdn.stamp.fyi/space/${proposal.space.id.toString()}?s=96&cb=80b2fc0910dab4fa`,
  );

  const handleError = () => {
    setAvatarUrl("/images/noggles.svg"); // Fallback placeholder image
  };

  const handleVote = (
    choiceId: number | number[] | { [key: string]: number },
    reason: string,
  ) => {
    const now = Date.now() / 1000;
    if (now < proposal.start || now > proposal.end) {
      alert("Voting is not open for this proposal.");
      return;
    }
    voteOnProposal(
      proposal.id,
      choiceId,
      reason,
      space,
      proposal.type as ProposalType,
    );
  };

  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(
    reducer,
    initialState,
  );

  const renderVotingButtons = () => {
    switch (proposal.type) {
      case "single-choice":
        return renderSingleChoiceVotingUI(proposal, handleVote);
      case "approval":
        return renderApprovalVotingUI(proposal, state, dispatch, handleVote);
      case "quadratic":
        return renderWeightedVotingUI(proposal, state, dispatch, handleVote);
      case "ranked-choice":
        return renderRankedChoiceVotingUI(
          proposal,
          state,
          dispatch,
          handleVote,
        );
      case "weighted":
        return renderWeightedVotingUI(proposal, state, dispatch, handleVote);
      case "basic":
        return renderSingleChoiceVotingUI(proposal, handleVote);
      default:
        return renderSingleChoiceVotingUI(proposal, handleVote);
    }
  };

  const getStatus = () => {
    const now = Date.now() / 1000;
    if (now < proposal.start) return "Pending";
    if (now > proposal.end) {
      if (proposal.state === "closed") {
        if (proposal.type === "ranked-choice" || proposal.type === "weighted") {
          return "Closed";
        }
        const maxScore = Math.max(...proposal.scores);
        const isPassed = proposal.scores[0] === maxScore;
        return isPassed ? "Passed" : "Failed";
      }
      return proposal.state;
    }
    return "Active";
  };

  const status = getStatus();

  const getStatusBadgeColor = () => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 w-16";
      case "Active":
        return "bg-blue-400 w-16";
      case "Passed":
        return "bg-green-500 w-16";
      case "Failed":
        return "bg-red-500 w-16";
      case "Closed":
        return "bg-gray-500 w-16";
      default:
        return "bg-gray-500 w-16";
    }
  };

  const renderVotingResults = () => {
    const totalScores = proposal.scores.reduce(
      (acc: number, score: number) => acc + score,
      0,
    );

    return (
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2" style={{ fontFamily: bodyFont }}>
        {proposal.choices.map((choice: string, index: number) => {
          const score = proposal.scores[index];
          const percentage = (score / totalScores) * 100;

          return (
            <React.Fragment key={index}>
              <div className="text-xs font-medium">{choice}</div>
              <div className="h-2 w-full bg-gray-300 rounded">
                <div
                  className="h-full bg-green-500 rounded"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs font-medium">
                {score.toFixed(2)} Votes
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const [visibleSection, setVisibleSection] = useState<string | undefined>();

  const handleSectionChange = (section: string) => {
    // onToggleExpand(proposal.id);
    setVisibleSection((prevSection) =>
      prevSection === section ? undefined : section,
    );
  };

  return (
    <div className="p-4 border border-gray-200 bg-white rounded-lg" style={{ fontFamily: bodyFont }}>
      <div className="grid grid-cols-[4rem_1fr] gap-4">
        <img
          src={avatarUrl}
          alt="Avatar"
          width={64}
          height={64}
          style={{ width: "auto", height: "auto" }}
          className="rounded-md mr-4 object-cover"
          onError={handleError}
        />
        <div className="flex flex-col flex-grow">
          <h4 className="font-bold grid grid-cols-[1fr_auto] gap-4 items-start" style={{ fontFamily: headingsFont }}>
            {proposal.title}
            <Badge color={getStatusBadgeColor()} status={status} />
          </h4>
          <div className="flex gap-2 mt-4">
            <CardButton
              label="Preview"
              onClick={() => handleSectionChange("preview")}
              isActive={visibleSection === "preview"}
            />
            <CardButton
              label="Results"
              onClick={() => handleSectionChange("results")}
              isActive={visibleSection === "results"}
            />
            <CardButton
              label="Voting"
              onClick={() => handleSectionChange("voting")}
              isActive={visibleSection === "voting"}
            />
          </div>
        </div>
      </div>
      <div className={visibleSection !== undefined ? `border-t mt-4 pt-4` : ``}>
        {visibleSection === "preview" && (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={MarkdownRenderers()}
          >
            {proposal.body}
          </ReactMarkdown>
        )}
        {visibleSection === "results" && renderVotingResults()}
        {visibleSection === "voting" &&
          (status === "Active" ? (
            renderVotingButtons()
          ) : (
            <div>
              <center>Proposal is not active</center>
            </div>
          ))}
      </div>
    </div>
  );
};

const Badge: React.FC<{ color: string; status: string }> = ({
  color,
  status,
}) => {
  return (
    <div
      className={`inline-block text-white py-1 px-3 rounded-full text-xs ${color}`}
    >
      {status}
    </div>
  );
};

const CardButton: React.FC<{
  label: string;
  onClick: () => void;
  isActive: boolean;
}> = ({ label, onClick, isActive }) => {
  return (
    <Button
      variant="outline"
      size="md"
      onClick={onClick}
      className={`rounded-full text-slate-600 ${isActive ? "bg-slate-100 text-slate-700 border-slate-300" : ""}`}
      withIcon
    >
      {label}{" "}
      <FaAngleDown
        className={`fill-slate-400 transition-all ease-in ${isActive ? "rotate-180" : ""}`}
      />
    </Button>
  );
};

export default ProposalItem;
