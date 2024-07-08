import { SetterFunction, StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { SpaceConfig } from "@/common/components/templates/Space";
import { isNil, mapValues } from "lodash";

interface CurrentSpaceStoreState {
  currentSpaceId: string | null;
}

interface CurrentSpaceStoreActions {
  setCurrentSpaceId: SetterFunction<string | null>;
  getCurrentSpaceConfig: () => Omit<SpaceConfig, "isEditable"> | undefined;
}

const HOMEBASE_ID = "homebase";

export type CurrentSpaceStore = CurrentSpaceStoreState &
  CurrentSpaceStoreActions;

export const currentSpaceStoreDefaults: CurrentSpaceStoreState = {
  currentSpaceId: null,
};

export const createCurrentSpaceStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): CurrentSpaceStore => ({
  ...currentSpaceStoreDefaults,
  setCurrentSpaceId(id) {
    set((draft) => {
      draft.currentSpace.currentSpaceId = id;
    }, "setCurrentSpaceId");
  },
  getCurrentSpaceConfig: () => {
    const currentSpaceId = get().currentSpace.currentSpaceId;
    if (currentSpaceId === HOMEBASE_ID) return get().homebase.homebaseConfig;
    if (isNil(currentSpaceId)) return undefined;
    const currentSpaceUpdatableConfig = get().space.localSpaces[currentSpaceId];
    return currentSpaceUpdatableConfig
      ? {
          ...currentSpaceUpdatableConfig,
          fidgetInstanceDatums: mapValues(
            currentSpaceUpdatableConfig.fidgetInstanceDatums,
            (datum) => ({
              ...datum,
              config: {
                settings: datum.config.settings,
                editable: datum.config.editable,
                data: {}, // TO DO: Inject fidget data here
              },
            }),
          ),
        }
      : undefined;
  },
});
