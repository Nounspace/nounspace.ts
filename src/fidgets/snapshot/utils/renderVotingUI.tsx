import React, { memo, useCallback, useState } from "react";
import Slider from "@mui/material/Slider";
import { Button } from "@/common/components/atoms/button";

// --- Add explicit types ---
type Proposal = {
  choices: string[];
};

type ApprovalVotingState = {
  selectedChoices: number[];
};

type WeightedVotingState = {
  weightedChoices: Map<number, number>;
};

type RankedChoiceVotingState = {
  rankedChoices: Map<number, number>;
};
// ---

type VotingAction =
  | { type: "toggleApprovalChoice"; index: number }
  | { type: "setWeightedChoice"; index: number; weight: number }
  | { type: "setRankedChoice"; index: number; rank: number };

interface VotingUIProps {
  proposal: Proposal;
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string
  ) => void;
}

// Use generics for stateful props
interface StatefulVotingUIProps<TState> extends VotingUIProps {
  state: TState;
  dispatch: React.Dispatch<VotingAction>;
}

// --- SingleChoiceVotingUI ---
export const SingleChoiceVotingUI: React.FC<VotingUIProps> = memo(
  ({ proposal, handleVote }) => {
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [reason, setReason] = useState<string>("");

    const handleChoiceClick = useCallback((choiceIndex: number) => {
      setSelectedChoice(choiceIndex);
    }, []);

    const handleSubmit = useCallback(() => {
      if (selectedChoice !== null) {
        handleVote(selectedChoice, reason);
      }
    }, [selectedChoice, reason, handleVote]);

    return (
      <div className="flex flex-col justify-center gap-4">
        {proposal.choices.map((choice: string, index: number) => {
          const choiceIndex = index + 1;
          const isSelected = selectedChoice === choiceIndex;

          return (
            <Button
              key={index}
              onClick={() => handleChoiceClick(choiceIndex)}
              className={`w-full rounded-full border-2 m-1 ${
                isSelected
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-transparent border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white"
              }`}
            >
              {choice}
            </Button>
          );
        })}
        
        <div className="mt-4">
          <label htmlFor="vote-reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason (optional)
          </label>
          <textarea
            id="vote-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason for this vote..."
            className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[80px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selectedChoice === null}
          className={`w-full rounded-full border-2 m-1 ${
            selectedChoice !== null
              ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
              : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
          }`}
        >
          Submit Vote
        </Button>
      </div>
    );
  }
);

// --- ApprovalVotingUI ---
export const ApprovalVotingUI: React.FC<
  StatefulVotingUIProps<ApprovalVotingState>
> = memo(({ proposal, state, dispatch, handleVote }) => {
  const handleSubmit = useCallback(() => {
    handleVote(state.selectedChoices, "Approval vote");
  }, [state.selectedChoices, handleVote]);

  return (
    <div>
      {proposal.choices.map((choice: string, index: number) => {
        const choiceIndex = index + 1;
        const isChecked = state.selectedChoices.includes(choiceIndex);

        const handleToggle = () => {
          dispatch({ type: "toggleApprovalChoice", index: choiceIndex });
        };

        return (
          <div key={index} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`choice-${choiceIndex}`}
              checked={isChecked}
              onChange={handleToggle}
              className="mr-2"
            />
            <label htmlFor={`choice-${choiceIndex}`} className="cursor-pointer">
              {choice}
            </label>
          </div>
        );
      })}
      <Button
        variant="primary"
        className="w-full rounded-full bg-transparent border-2 border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white m-1"
        onClick={handleSubmit}
      >
        Submit Approval Vote
      </Button>
    </div>
  );
});

// --- WeightedVotingUI ---
export const WeightedVotingUI: React.FC<
  StatefulVotingUIProps<WeightedVotingState>
> = memo(({ proposal, state, dispatch, handleVote }) => {
  const handleSubmit = useCallback(() => {
    handleVote(
      Object.fromEntries(state.weightedChoices.entries()),
      "Weighted vote"
    );
  }, [state.weightedChoices, handleVote]);

  const createSliderChangeHandler = useCallback(
    (choiceIndex: number) => {
      return (e: Event, newValue: number | number[]) => {
        dispatch({
          type: "setWeightedChoice",
          index: choiceIndex,
          weight: newValue as number,
        });
      };
    },
    [dispatch]
  );

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        {proposal.choices.map((choice: string, index: number) => {
          const choiceIndex = index + 1;
          const value = state.weightedChoices.get(choiceIndex) || 0;

          const handleSliderChange = createSliderChangeHandler(choiceIndex);

          return (
            <React.Fragment key={index}>
              <label
                htmlFor={`choice-${choiceIndex}`}
                className="cursor-pointer mr-2"
              >
                {choice}
              </label>
              <Slider
                id={`choice-${choiceIndex}`}
                value={value}
                onChange={handleSliderChange}
                min={0}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                size="small"
              />
            </React.Fragment>
          );
        })}
      </div>
      <Button
        variant="primary"
        className="w-full rounded-full bg-transparent border-2 border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white m-1"
        onClick={handleSubmit}
      >
        Submit Weighted Vote
      </Button>
    </>
  );
});

// --- RankedChoiceVotingUI ---
export const RankedChoiceVotingUI: React.FC<
  StatefulVotingUIProps<RankedChoiceVotingState>
> = memo(({ proposal, state, dispatch, handleVote }) => {
  const handleSubmit = useCallback(() => {
    handleVote(
      Object.fromEntries(state.rankedChoices.entries()),
      "Ranked choice vote"
    );
  }, [state.rankedChoices, handleVote]);

  const createSliderChangeHandler = useCallback(
    (choiceIndex: number) => {
      return (e: Event, newValue: number | number[]) => {
        dispatch({
          type: "setRankedChoice",
          index: choiceIndex,
          rank: newValue as number,
        });
      };
    },
    [dispatch]
  );

  return (
    <div>
      {proposal.choices.map((choice: string, index: number) => {
        const choiceIndex = index + 1;
        const value = state.rankedChoices.get(choiceIndex) || 0;

        const handleSliderChange = createSliderChangeHandler(choiceIndex);

        return (
          <div key={index} className="flex items-center mb-2">
            <label
              htmlFor={`choice-${choiceIndex}`}
              className="cursor-pointer mr-2"
            >
              {choice}
            </label>
            <Slider
              id={`choice-${choiceIndex}`}
              value={value}
              onChange={handleSliderChange}
              className="flex-grow"
              min={0}
              max={10}
              step={1}
              valueLabelDisplay="auto"
            />
          </div>
        );
      })}
      <Button
        variant="primary"
        className="w-full rounded-full bg-transparent border-2 border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white m-1"
        onClick={handleSubmit}
      >
        Submit Ranked Vote
      </Button>
    </div>
  );
});

// Set display names for better debugging
SingleChoiceVotingUI.displayName = "SingleChoiceVotingUI";
ApprovalVotingUI.displayName = "ApprovalVotingUI";
WeightedVotingUI.displayName = "WeightedVotingUI";
RankedChoiceVotingUI.displayName = "RankedChoiceVotingUI";

// Legacy exports for backward compatibility
export const renderSingleChoiceVotingUI = (
  proposal: Proposal,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string
  ) => void
) => <SingleChoiceVotingUI proposal={proposal} handleVote={handleVote} />;

export const renderApprovalVotingUI = (
  proposal: Proposal,
  state: ApprovalVotingState,
  dispatch: React.Dispatch<VotingAction>,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string
  ) => void
) => (
  <ApprovalVotingUI
    proposal={proposal}
    state={state}
    dispatch={dispatch}
    handleVote={handleVote}
  />
);

export const renderWeightedVotingUI = (
  proposal: Proposal,
  state: WeightedVotingState,
  dispatch: React.Dispatch<VotingAction>,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string
  ) => void
) => (
  <WeightedVotingUI
    proposal={proposal}
    state={state}
    dispatch={dispatch}
    handleVote={handleVote}
  />
);

export const renderRankedChoiceVotingUI = (
  proposal: Proposal,
  state: RankedChoiceVotingState,
  dispatch: React.Dispatch<VotingAction>,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string
  ) => void
) => (
  <RankedChoiceVotingUI
    proposal={proposal}
    state={state}
    dispatch={dispatch}
    handleVote={handleVote}
  />
);
