import { SetterFunction, StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { SpaceConfig } from "@/common/components/templates/Space";
import { isNil, isUndefined, mapValues, pickBy } from "lodash";

interface CurrentSpaceStoreState {
  currentSpaceId: string | null;
  currentTabName: string | null;
}

interface CurrentSpaceStoreActions {
  setCurrentSpaceId: SetterFunction<string | null>;
  setCurrentTabName: SetterFunction<string | null>;
  getCurrentTabName: () => string | null;
  getCurrentSpaceConfig: () =>
    | {
        tabs: {
          [tabName: string]: Omit<SpaceConfig, "isEditable">;
        };
      }
    | undefined;
}

const HOMEBASE_ID = "homebase";

export type CurrentSpaceStore = CurrentSpaceStoreState &
  CurrentSpaceStoreActions;

export const currentSpaceStoreDefaults: CurrentSpaceStoreState = {
  currentSpaceId: HOMEBASE_ID,
  currentTabName: "",
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
  getCurrentTabName: () => {
    return get().currentSpace.currentTabName;
  },
  setCurrentTabName(name) {
    set((draft) => {
      draft.currentSpace.currentTabName = name;
    }, "setCurrentTabName");
  },
  getCurrentSpaceConfig: () => {
    const currentSpaceId = get().currentSpace.currentSpaceId;
    if (currentSpaceId === HOMEBASE_ID) return undefined;
    if (isNil(currentSpaceId)) return undefined;
    const currentSpaceUpdatableConfig = get().space.localSpaces[currentSpaceId];
    if (currentSpaceUpdatableConfig) {
      const tabsWithDatumsImproved = pickBy(
        mapValues(currentSpaceUpdatableConfig.tabs, (tabInfo) =>
          tabInfo
            ? {
                ...tabInfo,
                fidgetInstanceDatums: mapValues(
                  tabInfo.fidgetInstanceDatums,
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
            : undefined,
        ),
        (i) => !isUndefined(i),
      );
      return {
        ...currentSpaceUpdatableConfig,
        tabs: tabsWithDatumsImproved,
      };
    }
    return undefined;
  },
});
