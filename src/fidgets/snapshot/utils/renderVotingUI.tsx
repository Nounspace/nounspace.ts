import React from "react";
import Slider from "@mui/material/Slider";
import { Button } from "@/common/components/atoms/button";

export const renderSingleChoiceVotingUI = (
  proposal: any,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string,
  ) => void,
) => {
  return (
    <div className="flex justify-center gap-4">
      {proposal.choices.map((choice: string, index: number) => (
        <Button
          key={index}
          variant="primary"
          onClick={() => handleVote(index + 1, choice)}
          className={`rounded-full ${choice === "For" ? "bg-green-500" : choice === "Against" ? "bg-red-500" : "bg-gray-500"}`}
        >
          {choice}
        </Button>
      ))}
    </div>
  );
};

export const renderApprovalVotingUI = (
  proposal: any,
  state: any,
  dispatch: React.Dispatch<any>,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string,
  ) => void,
) => {
  return (
    <div>
      {proposal.choices.map((choice: string, index: number) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`choice-${index}`}
            checked={state.selectedChoices.includes(index)}
            onChange={() => dispatch({ type: "toggleApprovalChoice", index })}
            className="mr-2"
          />
          <label htmlFor={`choice-${index}`} className="cursor-pointer">
            {choice}
          </label>
        </div>
      ))}
      <button
        className="bg-green-500 text-white py-2 px-4 rounded mt-2"
        onClick={() => handleVote(state.selectedChoices, "Approval vote")}
      >
        Submit Approval Vote
      </button>
    </div>
  );
};

export const renderWeightedVotingUI = (
  proposal: any,
  state: any,
  dispatch: React.Dispatch<any>,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string,
  ) => void,
) => {
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        {proposal.choices.map((choice: string, index: number) => (
          <>
            <label htmlFor={`choice-${index}`} className="cursor-pointer mr-2">
              {choice}
            </label>
            <Slider
              id={`choice-${index}`}
              value={state.weightedChoices.get(index) || 0}
              onChange={(e, newValue) =>
                dispatch({
                  type: "setWeightedChoice",
                  index,
                  weight: newValue as number,
                })
              }
              min={0}
              max={10}
              step={1}
              valueLabelDisplay="auto"
              size="small"
            />
          </>
        ))}
      </div>
      <Button
        variant="primary"
        className="rounded-full mt-4"
        onClick={() =>
          handleVote(
            Object.fromEntries(state.weightedChoices.entries()),
            "Weighted vote",
          )
        }
      >
        Submit Weighted Vote
      </Button>
    </>
  );
};

export const renderRankedChoiceVotingUI = (
  proposal: any,
  state: any,
  dispatch: React.Dispatch<any>,
  handleVote: (
    choiceId: number | number[] | { [key: string]: number },
    reason: string,
  ) => void,
) => {
  return (
    <div>
      {proposal.choices.map((choice: string, index: number) => (
        <div key={index} className="flex items-center mb-2">
          <label htmlFor={`choice-${index}`} className="cursor-pointer mr-2">
            {choice}
          </label>
          <Slider
            id={`choice-${index}`}
            value={state.rankedChoices.get(index) || 0}
            onChange={(e, newValue) =>
              dispatch({
                type: "setRankedChoice",
                index,
                rank: newValue as number,
              })
            }
            className="flex-grow"
            min={0}
            max={10}
            step={1}
            valueLabelDisplay="auto"
          />
        </div>
      ))}
      <button
        className="w-full bg-green-500 text-white py-2 px-4 rounded mt-2"
        onClick={() => handleVote(state.rankedChoices, "Ranked choice vote")}
      >
        Submit Ranked Vote
      </button>
    </div>
  );
};
