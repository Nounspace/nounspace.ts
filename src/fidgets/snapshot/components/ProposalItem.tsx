// src/components/ProposalItem.tsx

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";
import voteOnProposal, { ProposalType } from "../utils/voteOnProposal";

interface ProposalItemProps {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  space: string;
}

const ProposalItem: React.FC<ProposalItemProps> = ({
  proposal,
  isExpanded,
  onToggleExpand,
  space,
}) => {
  const extractImageUrl = (markdown: string): string | null => {
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = imageRegex.exec(markdown);
    return match ? match[1] : null;
  };

  const [avatarUrl, setAvatarUrl] = useState<string>(
    extractImageUrl(proposal.body) || "/images/noggles.svg",
  );

  const [rankedChoices, setRankedChoices] = useState<number[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [weightedChoices, setWeightedChoices] = useState<Map<number, number>>(
    new Map(),
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

  const handleRankedChoice = (choiceIndex: number) => {
    setRankedChoices((prevChoices) => {
      const newChoices = [...prevChoices];
      if (newChoices.includes(choiceIndex)) {
        return newChoices.filter((choice) => choice !== choiceIndex);
      } else {
        newChoices.push(choiceIndex);
        return newChoices;
      }
    });
  };

  const handleApprovalChoice = (choiceIndex: number) => {
    setSelectedChoices((prevChoices) => {
      const newChoices = [...prevChoices];
      if (newChoices.includes(choiceIndex)) {
        return newChoices.filter((choice) => choice !== choiceIndex);
      } else {
        newChoices.push(choiceIndex);
        return newChoices;
      }
    });
  };

  const handleWeightedChoice = (choiceIndex: number, weight: number) => {
    setWeightedChoices((prevChoices) => {
      const newChoices = new Map(prevChoices);
      if (weight === 0) {
        newChoices.delete(choiceIndex);
      } else {
        newChoices.set(choiceIndex, weight);
      }
      return newChoices;
    });
  };

  const submitRankedChoiceVote = () => {
    handleVote(rankedChoices, "Ranked choice vote");
  };

  const submitApprovalVote = () => {
    handleVote(selectedChoices, "Approval vote");
  };

  const submitWeightedVote = () => {
    const weightedVote = Object.fromEntries(weightedChoices.entries());
    handleVote(weightedVote, "Weighted vote");
  };

  const renderSingleChoiceVotingUI = () => {
    return proposal.choices.map((choice: string, index: number) => (
      <button
        key={index}
        className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
        onClick={() => handleVote(index + 1, choice)}
      >
        Vote {choice}
      </button>
    ));
  };

  const renderApprovalVotingUI = () => {
    return (
      <div>
        {proposal.choices.map((choice: string, index: number) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`choice-${index}`}
              checked={selectedChoices.includes(index)}
              onChange={() => handleApprovalChoice(index)}
              className="mr-2"
            />
            <label htmlFor={`choice-${index}`} className="cursor-pointer">
              {choice}
            </label>
          </div>
        ))}
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          onClick={submitApprovalVote}
        >
          Submit Approval Vote
        </button>
      </div>
    );
  };

  const renderQuadraticVotingUI = () => {
    // Quadratic voting UI can be implemented similarly to weighted voting but with a different calculation
    return renderWeightedVotingUI();
  };

  const renderRankedChoiceVotingUI = () => {
    return (
      <div>
        {proposal.choices.map((choice: string, index: number) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`choice-${index}`}
              checked={rankedChoices.includes(index)}
              onChange={() => handleRankedChoice(index)}
              className="mr-2"
            />
            <label htmlFor={`choice-${index}`} className="cursor-pointer">
              {choice}
            </label>
          </div>
        ))}
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          onClick={submitRankedChoiceVote}
        >
          Submit Ranked Vote
        </button>
      </div>
    );
  };

  const renderWeightedVotingUI = () => {
    return (
      <div>
        {proposal.choices.map((choice: string, index: number) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="number"
              id={`choice-${index}`}
              value={weightedChoices.get(index) || 0}
              onChange={(e) =>
                handleWeightedChoice(index, Number(e.target.value))
              }
              className="mr-2"
              min={0}
              max={10}
            />
            <label htmlFor={`choice-${index}`} className="cursor-pointer">
              {choice}
            </label>
          </div>
        ))}
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          onClick={submitWeightedVote}
        >
          Submit Weighted Vote
        </button>
      </div>
    );
  };

  const renderVotingButtons = () => {
    switch (proposal.type) {
      case "single-choice":
        return renderSingleChoiceVotingUI();
      case "approval":
        return renderApprovalVotingUI();
      case "quadratic":
        return renderQuadraticVotingUI();
      case "ranked-choice":
        return renderRankedChoiceVotingUI();
      case "weighted":
        return renderWeightedVotingUI();
      case "basic":
        return renderSingleChoiceVotingUI();
      default:
        return renderSingleChoiceVotingUI();
    }
  };

  return (
    <div className="flex flex-row p-4 border border-gray-200 rounded-lg mb-1">
      <img
        src={avatarUrl}
        alt="Avatar"
        className="w-16 h-16 rounded-md mr-4"
        onError={handleError}
      />
      <div className="flex flex-col flex-grow">
        <h4
          className="font-bold cursor-pointer"
          onClick={() => onToggleExpand(proposal.id)}
        >
          {proposal.title}
        </h4>
        {isExpanded && (
          <>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={MarkdownRenderers}
            >
              {proposal.body}
            </ReactMarkdown>
            <div className="mt-4">{renderVotingButtons()}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProposalItem;
