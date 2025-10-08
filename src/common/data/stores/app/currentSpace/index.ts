import { SetterFunction, StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { SpaceConfig } from "@/app/(spaces)/Space";
import { sanitizeTabConfig } from "@/common/utils/sanitizeTabConfig";
import { isNil, isUndefined, mapValues, pickBy } from "lodash";

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
    if (currentSpaceId === HOMEBASE_ID) return undefined;
    if (isNil(currentSpaceId)) return undefined;
    const currentSpaceUpdatableConfig = get().space.localSpaces[currentSpaceId];
    if (currentSpaceUpdatableConfig) {
      const tabsWithDatumsImproved = pickBy(
        mapValues(currentSpaceUpdatableConfig.tabs, (tabInfo, tabName) => {
          if (!tabInfo) {
            return undefined;
          }

          const sanitized = sanitizeTabConfig(tabInfo, {
            tabName,
            requireIsPrivate: true,
            defaultIsPrivate: false,
            log: (message, ...details) =>
              console.warn(
                "Ignoring cached local tab config:",
                message,
                ...details,
              ),
          });

          if (!sanitized) {
            return undefined;
          }

          return {
            ...sanitized,
            fidgetInstanceDatums: mapValues(
              sanitized.fidgetInstanceDatums ?? {},
              (datum) => ({
                ...datum,
                config: {
                  settings: datum.config.settings,
                  editable: datum.config.editable,
                  data: {}, // TO DO: Inject fidget data here
                },
              }),
            ),
          };
        }),
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
