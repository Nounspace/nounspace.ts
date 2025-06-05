import React, { memo, useState, useCallback, useMemo, useReducer } from "react";
import { useProposalStatus } from "../hooks/useProposalStatus";
import { useSpaceQuorum } from "../hooks/useSpaceQuorum";
import Badge from "./Badge";
import CardButton from "./CardButton";
import VotingResults from "./VotingResults";
import ProposalPreview from "./ProposalPreview";
import {
  renderApprovalVotingUI,
  renderRankedChoiceVotingUI,
  renderSingleChoiceVotingUI,
  renderWeightedVotingUI,
} from "../utils/renderVotingUI";
import { Action, initialState, reducer, State } from "../utils/stateManagement";
import { voteOnProposal, ProposalType } from "../utils/voteOnProposal";

interface Proposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  state: string;
  type: string;
  scores: number[];
  scores_total?: number;
  space: {
    id: string;
  };
}

interface ProposalItemProps {
  proposal: Proposal;
  space: string;
  headingsFont: string;
  headingsColor: string;
  bodyFont: string;
  bodyColor: string;
}

const ProposalItem: React.FC<ProposalItemProps> = memo(
  ({ proposal, space, headingsFont, headingsColor, bodyFont, bodyColor }) => {
    const [visibleSection, setVisibleSection] = useState<string | undefined>();

    const [state, dispatch] = useReducer<React.Reducer<State, Action>>(
      reducer,
      initialState
    );

    // Get space quorum settings
    const spaceQuorum = useSpaceQuorum(space);

    // Get proposal status with quorum consideration
    const status = useProposalStatus({ proposal, spaceQuorum });

    // Memoize avatar URL extraction
    const avatarUrl = useMemo(() => {
      const extractImageUrl = (markdown: string): string | null => {
        const imageRegex = /!\[.*?\]\((.*?)\)/;
        const match = imageRegex.exec(markdown);
        return match ? match[1] : null;
      };

      return (
        extractImageUrl(proposal.body) ||
        `https://cdn.stamp.fyi/space/${proposal.space.id.toString()}?s=96&cb=80b2fc0910dab4fa`
      );
    }, [proposal.body, proposal.space.id]);

    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(avatarUrl);

    const handleError = useCallback(() => {
      setCurrentAvatarUrl("/images/noggles.svg");
    }, []);

    const handleVote = useCallback(
      async (
        choiceId: number | number[] | { [key: string]: number },
        reason: string
      ) => {
        const now = Date.now() / 1000;
        if (now < proposal.start || now > proposal.end) {
          alert("Voting is not open for this proposal.");
          return;
        }

        await voteOnProposal({
          proposalId: proposal.id,
          choiceId,
          reason,
          space,
          type: proposal.type as ProposalType,
        });
      },
      [proposal.id, proposal.start, proposal.end, proposal.type, space]
    );

    const handleSectionChange = useCallback((section: string) => {
      setVisibleSection((prevSection) =>
        prevSection === section ? undefined : section
      );
    }, []);

    const renderVotingButtons = useCallback(() => {
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
            handleVote
          );
        case "weighted":
          return renderWeightedVotingUI(proposal, state, dispatch, handleVote);
        case "basic":
          return renderSingleChoiceVotingUI(proposal, handleVote);
        default:
          return renderSingleChoiceVotingUI(proposal, handleVote);
      }
    }, [proposal, state, handleVote]);

    const headingStyle = useMemo(
      () => ({
        fontFamily: headingsFont,
        color: headingsColor,
      }),
      [headingsFont, headingsColor]
    );

    const bodyStyle = useMemo(
      () => ({
        fontFamily: bodyFont,
        color: bodyColor,
      }),
      [bodyFont, bodyColor]
    );

    return (
      <div
        className="p-4 border border-gray-200 bg-white rounded-lg"
        style={bodyStyle}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[4rem_1fr] gap-4">
          <img
            src={currentAvatarUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="w-16 h-16 rounded-md mr-4 object-cover"
            onError={handleError}
          />
          <div className="flex flex-col flex-grow">
            <h4
              className="font-bold flex flex-wrap items-start gap-2"
              style={headingStyle}
            >
              <span className="break-words flex-1">{proposal.title}</span>
              <Badge status={status} />
            </h4>
            <div className="flex flex-wrap gap-2 mt-4">
              <CardButton
                label="Preview"
                onClick={handleSectionChange}
                isActive={visibleSection === "preview"}
                section="preview"
              />
              <CardButton
                label="Results"
                onClick={handleSectionChange}
                isActive={visibleSection === "results"}
                section="results"
              />
              <CardButton
                label="Voting"
                onClick={handleSectionChange}
                isActive={visibleSection === "voting"}
                section="voting"
              />
            </div>
          </div>
        </div>

        {visibleSection && (
          <div className="border-t mt-4 pt-4">
            {visibleSection === "preview" && (
              <ProposalPreview body={proposal.body} />
            )}
            {visibleSection === "results" && (
              <VotingResults
                choices={proposal.choices}
                scores={proposal.scores}
                scores_total={proposal.scores_total}
                bodyFont={bodyFont}
                quorumInfo={spaceQuorum}
              />
            )}
            {visibleSection === "voting" &&
              (status === "Active" ? (
                renderVotingButtons()
              ) : (
                <div>
                  <center>Proposal is not active</center>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }
);

ProposalItem.displayName = "ProposalItem";

export default ProposalItem;
