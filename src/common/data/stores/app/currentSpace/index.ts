import { SetterFunction, StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { SpaceConfig } from "@/app/(spaces)/Space";
import { isNil, isUndefined, mapValues, pickBy } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";

interface CurrentSpaceStoreState {
  currentSpaceId: string | null;
  currentTabName: string | null;
}

interface CurrentSpaceStoreActions {
  setCurrentSpaceId: SetterFunction<string | null>;
  getCurrentSpaceId: () => string | null;
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

export const HOMEBASE_ID = "homebase";

export type CurrentSpaceStore = CurrentSpaceStoreState &
  CurrentSpaceStoreActions;

export const currentSpaceStoreDefaults: CurrentSpaceStoreState = {
  currentSpaceId: null,
  currentTabName: "",
};

export const createCurrentSpaceStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): CurrentSpaceStore => ({
  ...currentSpaceStoreDefaults,
  getCurrentSpaceId: () => {
    return get().currentSpace.currentSpaceId;
  },
  setCurrentSpaceId(id) {
    set((draft) => {
      draft.currentSpace.currentSpaceId = id;
    }, "setCurrentSpaceId");
  },
  getCurrentTabName: () => {
    return get().currentSpace.currentTabName ?? "Profile";
  },
  setCurrentTabName(name) {
    set((draft) => {
      draft.currentSpace.currentTabName = name;
    }, "setCurrentTabName");
  },
  getCurrentSpaceConfig: () => {
    const currentSpaceId = get().currentSpace.currentSpaceId;
    if (currentSpaceId === HOMEBASE_ID) return { tabs: { Profile: { ...INITIAL_SPACE_CONFIG_EMPTY } } };
    if (isNil(currentSpaceId)) return { tabs: { Profile: { ...INITIAL_SPACE_CONFIG_EMPTY } } };
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
    // Fallback: return a default config if not found
    return { tabs: { Profile: { ...INITIAL_SPACE_CONFIG_EMPTY } } };
  },
});
