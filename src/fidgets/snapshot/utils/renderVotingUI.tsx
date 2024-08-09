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
    <div className="flex-col justify-center gap-4">
      {proposal.choices.map((choice: string, index: number) => (
        <Button
          key={index}
          onClick={() => handleVote(index + 1, choice)}
          className={`w-full rounded-full bg-transparent border-2 border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white m-1`}
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
            id={`choice-${index + 1}`}
            checked={state.selectedChoices.includes(index + 1)}
            onChange={() =>
              dispatch({ type: "toggleApprovalChoice", index: index + 1 })
            }
            className="mr-2"
          />
          <label htmlFor={`choice-${index + 1}`} className="cursor-pointer">
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
          <React.Fragment key={index}>
            <label
              htmlFor={`choice-${index + 1}`}
              className="cursor-pointer mr-2"
            >
              {choice}
            </label>
            <Slider
              id={`choice-${index + 1}`}
              value={state.weightedChoices.get(index + 1) || 0}
              onChange={(e, newValue) =>
                dispatch({
                  type: "setWeightedChoice",
                  index: index + 1,
                  weight: newValue as number,
                })
              }
              min={0}
              max={10}
              step={1}
              valueLabelDisplay="auto"
              size="small"
            />
          </React.Fragment>
        ))}
      </div>
      <Button
        variant="primary"
        className="w-full rounded-full bg-transparent border-2 border-gray-500 text-gray-500 hover:bg-green-500 hover:text-white m-1"
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
          <label
            htmlFor={`choice-${index + 1}`}
            className="cursor-pointer mr-2"
          >
            {choice}
          </label>
          <Slider
            id={`choice-${index + 1}`}
            value={state.rankedChoices.get(index + 1) || 0}
            onChange={(e, newValue) =>
              dispatch({
                type: "setRankedChoice",
                index: index + 1,
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
