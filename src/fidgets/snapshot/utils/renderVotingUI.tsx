import React, { memo, useCallback } from "react";
import Slider from "@mui/material/Slider";
import { Button } from "@/common/components/atoms/button";

interface VotingUIProps {
  proposal: any;
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string,
  ) => void;
}

interface StatefulVotingUIProps extends VotingUIProps {
  state: any;
  dispatch: React.Dispatch<any>;
}

export const SingleChoiceVotingUI: React.FC<VotingUIProps> = memo(({ 
  proposal, 
  handleVote 
}) => (
  <div className="flex-col justify-center gap-4">
    {proposal.choices.map((choice: string, index: number) => {
      const handleChoiceClick = () => handleVote(index + 1, choice);
      
      return (
        <Button
          key={index}
          onClick={handleChoiceClick}
          className="w-full rounded-full bg-transparent border-2 border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white m-1"
        >
          {choice}
        </Button>
      );
    })}
  </div>
));

export const ApprovalVotingUI: React.FC<StatefulVotingUIProps> = memo(({ 
  proposal, 
  state, 
  dispatch, 
  handleVote 
}) => {
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
      <button
        className="bg-green-500 text-white py-2 px-4 rounded mt-2"
        onClick={handleSubmit}
      >
        Submit Approval Vote
      </button>
    </div>
  );
});

export const WeightedVotingUI: React.FC<StatefulVotingUIProps> = memo(({ 
  proposal, 
  state, 
  dispatch, 
  handleVote 
}) => {
  const handleSubmit = useCallback(() => {
    handleVote(
      Object.fromEntries(state.weightedChoices.entries()),
      "Weighted vote",
    );
  }, [state.weightedChoices, handleVote]);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        {proposal.choices.map((choice: string, index: number) => {
          const choiceIndex = index + 1;
          const value = state.weightedChoices.get(choiceIndex) || 0;
          
          const handleSliderChange = (e: Event, newValue: number | number[]) => {
            dispatch({
              type: "setWeightedChoice",
              index: choiceIndex,
              weight: newValue as number,
            });
          };

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

export const RankedChoiceVotingUI: React.FC<StatefulVotingUIProps> = memo(({ 
  proposal, 
  state, 
  dispatch, 
  handleVote 
}) => {
  const handleSubmit = useCallback(() => {
    handleVote(state.rankedChoices, "Ranked choice vote");
  }, [state.rankedChoices, handleVote]);

  return (
    <div>
      {proposal.choices.map((choice: string, index: number) => {
        const choiceIndex = index + 1;
        const value = state.rankedChoices.get(choiceIndex) || 0;
        
        const handleSliderChange = (e: Event, newValue: number | number[]) => {
          dispatch({
            type: "setRankedChoice",
            index: choiceIndex,
            rank: newValue as number,
          });
        };

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
      <button
        className="w-full bg-green-500 text-white py-2 px-4 rounded mt-2"
        onClick={handleSubmit}
      >
        Submit Ranked Vote
      </button>
    </div>
  );
});

// Set display names for better debugging
SingleChoiceVotingUI.displayName = 'SingleChoiceVotingUI';
ApprovalVotingUI.displayName = 'ApprovalVotingUI';
WeightedVotingUI.displayName = 'WeightedVotingUI';
RankedChoiceVotingUI.displayName = 'RankedChoiceVotingUI';

// Legacy exports for backward compatibility
export const renderSingleChoiceVotingUI = (
  proposal: any,
  handleVote: (choiceId: number | number[] | { [key: string]: number }, reason: string) => void,
) => <SingleChoiceVotingUI proposal={proposal} handleVote={handleVote} />;

export const renderApprovalVotingUI = (
  proposal: any,
  state: any,
  dispatch: React.Dispatch<any>,
  handleVote: (choiceId: number | number[] | { [key: string]: number }, reason: string) => void,
) => <ApprovalVotingUI proposal={proposal} state={state} dispatch={dispatch} handleVote={handleVote} />;

export const renderWeightedVotingUI = (
  proposal: any,
  state: any,
  dispatch: React.Dispatch<any>,
  handleVote: (choiceId: number | number[] | { [key: string]: number }, reason: string) => void,
) => <WeightedVotingUI proposal={proposal} state={state} dispatch={dispatch} handleVote={handleVote} />;

export const renderRankedChoiceVotingUI = (
  proposal: any,
  state: any,
  dispatch: React.Dispatch<any>,
  handleVote: (choiceId: number | number[] | { [key: string]: number }, reason: string) => void,
) => <RankedChoiceVotingUI proposal={proposal} state={state} dispatch={dispatch} handleVote={handleVote} />;
