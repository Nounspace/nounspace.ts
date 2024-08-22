export interface State {
  selectedChoices: number[];
  weightedChoices: Map<number, number>;
  rankedChoices: Map<number, number>;
}

export const initialState: State = {
  selectedChoices: [],
  weightedChoices: new Map<number, number>(),
  rankedChoices: new Map<number, number>(),
};

export type Action =
  | { type: "toggleApprovalChoice"; index: number }
  | { type: "setWeightedChoice"; index: number; weight: number }
  | { type: "setRankedChoice"; index: number; rank: number };

export const reducer = (state: State, action: Action): State => {
  let selectedChoices, weightedChoices, rankedChoices;

  switch (action.type) {
    case "toggleApprovalChoice":
      selectedChoices = state.selectedChoices.includes(action.index)
        ? state.selectedChoices.filter((i) => i !== action.index)
        : [...state.selectedChoices, action.index];
      return { ...state, selectedChoices };

    case "setWeightedChoice":
      weightedChoices = new Map(state.weightedChoices);
      weightedChoices.set(action.index, action.weight);
      return { ...state, weightedChoices };

    case "setRankedChoice":
      rankedChoices = new Map(state.rankedChoices);
      rankedChoices.set(action.index, action.rank);
      return { ...state, rankedChoices };

    default:
      return state;
  }
};
