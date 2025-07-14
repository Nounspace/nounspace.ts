import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/app/(spaces)/Space";
import { FidgetConfig, FidgetInstanceData } from "@/common/fidgets";
import { SignedFile, signSignable } from "@/common/lib/signedFiles";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import createIntialPersonSpaceConfigForFid, {
  INITIAL_SPACE_CONFIG_EMPTY,
} from "@/constants/initialPersonSpace";
import {
  ModifiableSpacesResponse,
  RegisterNewSpaceResponse,
  SpaceRegistrationContract,
  SpaceRegistrationFid,
  SpaceRegistrationProposer,
} from "@/pages/api/space/registry";
import {
  UnsignedUpdateTabOrderRequest,
  UpdateTabOrderRequest,
} from "@/pages/api/space/registry/[spaceId]";
import {
  RegisterNewSpaceTabResponse,
  UnsignedSpaceTabRegistration,
} from "@/pages/api/space/registry/[spaceId]/tabs";
import { UnsignedDeleteSpaceTabRequest } from "@/pages/api/space/registry/[spaceId]/tabs/[tabId]";
import axios from "axios";
import stringify from "fast-json-stable-stringify";
import {
  cloneDeep,
  debounce,
  filter,
  fromPairs,
  includes,
  isArray,
  isNil,
  isUndefined,
  map,
  mergeWith
} from "lodash";
import moment from "moment";
import { AppStore } from "..";
import axiosBackend from "../../../api/backend";
import { createClient } from "../../../database/supabase/clients/component";
import { StoreGet, StoreSet } from "../../createStore";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";
import { analytics } from "@/common/providers/AnalyticsProvider";
type SpaceId = string;

// SpaceConfig includes all of the Fidget Config
// But a space that is saved in the DB doesn't store
// Fidget data or editability
// So we rebuild the details, but without those fields
export type DatabaseWritableSpaceConfig = Omit<
  SpaceConfig,
  "fidgetInstanceDatums" | "isEditable"
> & {
  fidgetInstanceDatums: {
    [key: string]: Omit<FidgetInstanceData, "config"> & {
      config: Omit<FidgetConfig, "data">;
    };
  };
};

export type DatabaseWritableSpaceSaveConfig = Partial<
  Omit<SpaceConfigSaveDetails, "fidgetInstanceDatums" | "isEditable">
> & {
  fidgetInstanceDatums?: {
    [key: string]: Omit<FidgetInstanceData, "config"> & {
      config: Omit<FidgetConfig, "data">;
    };
  };
};

export type UpdatableDatabaseWritableSpaceSaveConfig =
  DatabaseWritableSpaceSaveConfig & {
    isPrivate?: boolean;
  };

export type UpdatableSpaceConfig = DatabaseWritableSpaceConfig & {
  isPrivate: boolean;
};

interface CachedSpace {
  // Machine generated ID, immutable
  id: SpaceId;
  updatedAt: string;
  tabs: {
    [tabName: string]: UpdatableSpaceConfig;
  };
  order: string[];
  orderUpdatedAt?: string;
  contractAddress?: string | null;
  network?: string | null;
  proposalId?: string | null;
}

interface LocalSpace extends CachedSpace {
  changedNames: {
    [newName: string]: string;
  };
  fid?: number | null;
  proposalId?: string | null;
}

interface SpaceState {
  remoteSpaces: Record<string, CachedSpace>;
  editableSpaces: Record<SpaceId, string>;
  localSpaces: Record<string, LocalSpace>;
}

export interface SpaceLookupInfo {
  spaceId: string;
  name: string;
}

interface SpaceActions {
  addProposalEditableSpaces: (
    spaceId: string | null | undefined,
    identities: string[],
  ) => void;
  addContractEditableSpaces: (
    spaceId: string | null | undefined,
    identities: string[],
  ) => void;
  commitSpaceTabToDatabase: (
    spaceId: string,
    tabName: string,
    network?: string,
    isInitialCommit?: boolean,
  ) => Promise<void> | undefined;
  saveLocalSpaceTab: (
    spaceId: string,
    tabName: string,
    config: UpdatableDatabaseWritableSpaceSaveConfig,
    newName?: string,
  ) => Promise<void>;
  loadEditableSpaces: () => Promise<Record<SpaceId, string>>;
  loadSpaceTabOrder: (spaceId: string) => Promise<void>;
  loadSpaceTab: (
    spaceId: string,
    tabName: string,
    fid?: number,
  ) => Promise<void>;
  deleteSpaceTab: (
    spaceId: string,
    tabName: string,
    network?: EtherScanChainName,
  ) => Promise<void> | undefined;
  createSpaceTab: (
    spaceId: string,
    tabName: string,
    initialConfig?: Omit<SpaceConfig, "isEditable">,
    network?: EtherScanChainName,
  ) => Promise<{ tabName: string }> | undefined;
  updateLocalSpaceOrder: (
    spaceId: string,
    newOrder: string[],
    network?: string,
  ) => Promise<void>;
  commitSpaceOrderToDatabase: (
    spaceId: string,
    network?: EtherScanChainName,
  ) => Promise<void> | undefined;
  registerSpaceFid: (
    fid: number,
    name: string,
    path: string,
  ) => Promise<string | undefined>;
  registerSpaceContract: (
    address: string,
    name: string,
    fid: number,
    initialConfig: Omit<SpaceConfig, "isEditable">,
    network: EtherScanChainName,
  ) => Promise<string | undefined>;
  registerProposalSpace: (
    proposalId: string,
    initialConfig: Omit<SpaceConfig, "isEditable">,
  ) => Promise<string | undefined>;
  clear: () => void;
}

export type SpaceStore = SpaceState & SpaceActions;

export const spaceStoreprofiles: SpaceState = {
  remoteSpaces: {},
  editableSpaces: {},
  localSpaces: {},
};

// Function to show tooltip using React components
const showTooltipError = (title: string, description: string) => {
  // Only run in browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  // Create a simple error message element instead of using the tooltip components
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '20px';
  errorContainer.style.right = '20px';
  errorContainer.style.zIndex = '9999';
  errorContainer.style.backgroundColor = '#ef4444'; // red-500
  errorContainer.style.color = 'white';
  errorContainer.style.padding = '16px';
  errorContainer.style.borderRadius = '6px';
  errorContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  errorContainer.style.maxWidth = '400px';

  const titleElement = document.createElement('h3');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '4px';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = description;

  errorContainer.appendChild(titleElement);
  errorContainer.appendChild(descriptionElement);
  document.body.appendChild(errorContainer);

  // Remove after timeout
  setTimeout(() => {
    document.body.removeChild(errorContainer);
  }, 4000);
};

// Add validation function
const validateTabName = (tabName: string): string | null => {
  if (/[^a-zA-Z0-9-_ ]/.test(tabName)) {
    return "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed.";
  }
  return null;
};

export const createSpaceStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): SpaceStore => ({
  ...spaceStoreprofiles,
  addProposalEditableSpaces: (spaceId, identities) => {
    const currentSpaceIdentityPrimaryKey =
      get().account.currentSpaceIdentityPublicKey;
    if (
      includes(identities, currentSpaceIdentityPrimaryKey) &&
      !isNil(spaceId)
    ) {
      set((draft) => {
        draft.space.editableSpaces[spaceId] = spaceId;
      }, "addProposalEditableSpaces");
    }
  },
  addContractEditableSpaces: (spaceId, identities) => {
    const currentSpaceIdentityPrimaryKey =
      get().account.currentSpaceIdentityPublicKey;
    if (
      includes(identities, currentSpaceIdentityPrimaryKey) &&
      !isNil(spaceId)
    ) {
      set((draft) => {
        draft.space.editableSpaces[spaceId] = spaceId;
      }, "addContractEditableSpaces");
    }
  },
  commitSpaceTabToDatabase: async (spaceId: string, tabName: string, network?: string, isInitialCommit = false) => {
    const localCopy = cloneDeep(
      get().space.localSpaces[spaceId].tabs[tabName],
    );
    const oldTabName =
      get().space.localSpaces[spaceId].changedNames[tabName] || tabName;
    
    if (localCopy) {
      const file = await get().account.createSignedFile(
        stringify(localCopy),
        "json",
        { fileName: tabName },
      );
      
      try {
        await axiosBackend.post(
          `/api/space/registry/${spaceId}/tabs/${oldTabName}`,
          { ...file, network },
        );
        
        set((draft) => {
          draft.space.remoteSpaces[spaceId].tabs[tabName] = localCopy;
          delete draft.space.remoteSpaces[spaceId].tabs[oldTabName];
          delete draft.space.localSpaces[spaceId].changedNames[tabName];
        }, "commitSpaceTabToDatabase");
      } catch (e) {
        console.error("Failed to commit space tab:", e);
        throw e;
      }
    }
  },
  saveLocalSpaceTab: async (spaceId, tabName, config, newName) => {
    // Check if the new name contains special characters
    if (newName && /[^a-zA-Z0-9-_ ]/.test(newName as string)) {
      // Show error
      showTooltipError(
        "Invalid Tab Name",
        "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed."
      );

      // Create an error and stop execution
      const error = new Error(
        "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed."
      );
      (error as any).status = 400;
      throw error; // Stops the execution of the function
    }

    console.log("NewConfig", config);
    let localCopy;
    const newTimestamp = moment().toISOString();

    // If the tab doesn't exist yet, use the new config directly
    if (!get().space.localSpaces[spaceId]?.tabs[tabName]) {
      localCopy = {
        ...cloneDeep(config),
        timestamp: newTimestamp,
      };
    } else {
      // Otherwise merge with existing config
      localCopy = cloneDeep(get().space.localSpaces[spaceId].tabs[tabName]);
      mergeWith(localCopy, config, (objValue, srcValue) => {
        if (isArray(srcValue)) return srcValue;
        if (typeof srcValue === 'object' && srcValue !== null) {
          // For objects, return the source value to replace the target completely
          return srcValue;
        }
      });
      localCopy.timestamp = newTimestamp;
      console.log("localCopy", localCopy);
    }

    set((draft) => {
      if (!isNil(newName) && newName.length > 0 && newName !== tabName) {
        draft.space.localSpaces[spaceId].changedNames[newName] = tabName;
        draft.space.localSpaces[spaceId].tabs[newName] = localCopy;
        delete draft.space.localSpaces[spaceId].tabs[tabName];
      } else {
        draft.space.localSpaces[spaceId].tabs[tabName] = localCopy;
      }
      const newSpaceTimestamp = moment().toISOString();
      draft.space.localSpaces[spaceId].updatedAt = newSpaceTimestamp;
    }, "saveLocalSpaceTab");
  },
  deleteSpaceTab: async (
    spaceId,
    tabName,
    network?: EtherScanChainName,
  ) => {
      // This deletes locally and remotely at the same time
      // We can separate these out, but I think deleting feels better as a single decisive action
      const unsignedDeleteTabRequest: UnsignedDeleteSpaceTabRequest = {
        publicKey: get().account.currentSpaceIdentityPublicKey!,
        timestamp: moment().toISOString(),
        spaceId,
        tabName,
        network,
      };
      const signedRequest = signSignable(
        unsignedDeleteTabRequest,
        get().account.getCurrentIdentity()!.rootKeys.privateKey,
      );
      try {
        await axiosBackend.delete(
          `/api/space/registry/${spaceId}/tabs/${tabName}`,
          { data: signedRequest },
        );
        set((draft) => {
          delete draft.space.localSpaces[spaceId].tabs[tabName];
          delete draft.space.remoteSpaces[spaceId].tabs[tabName];

          // Update order arrays with new arrays to ensure state updates
          draft.space.localSpaces[spaceId].order = filter(
            draft.space.localSpaces[spaceId].order,
            (x) => x !== tabName,
          );
          draft.space.remoteSpaces[spaceId].order = filter(
            draft.space.localSpaces[spaceId].order,
            (x) => x !== tabName,
          );
          
          // Update timestamps
          const timestamp = moment().toISOString();
          draft.space.localSpaces[spaceId].updatedAt = timestamp;
          draft.space.localSpaces[spaceId].orderUpdatedAt = timestamp;
          draft.space.remoteSpaces[spaceId].updatedAt = timestamp;
        }, "deleteSpaceTab");
        return get().space.commitSpaceOrderToDatabase(spaceId, network);
      } catch (e) {
        console.error(e);
      }
    },
  createSpaceTab: async (
    spaceId: string,
    tabName: string,
    initialConfig?: Omit<SpaceConfig, "isEditable">,
    network?: EtherScanChainName,
  ) => {
    // Validate the tab name before proceeding
    const validationError = validateTabName(tabName);
    if (validationError) {
      throw new Error(validationError);
    }

    if (isNil(initialConfig)) {
      initialConfig = INITIAL_SPACE_CONFIG_EMPTY;
    }

    set((draft) => {
      if (isUndefined(draft.space.localSpaces[spaceId])) {
        draft.space.localSpaces[spaceId] = {
          tabs: {},
          order: [],
          updatedAt: moment().toISOString(),
          changedNames: {},
          id: spaceId,
        };
      }

      draft.space.localSpaces[spaceId].tabs[tabName] = {
        ...cloneDeep(initialConfig!),
        theme: {
          ...cloneDeep(initialConfig!.theme),
          id: `${spaceId}-${tabName}-theme`,
          name: `${spaceId}-${tabName}-theme`,
        },
        isPrivate: false,
        timestamp: moment().toISOString(),
      };

      draft.space.localSpaces[spaceId].order.push(tabName);
      const timestampNow = moment().toISOString();
      draft.space.localSpaces[spaceId].orderUpdatedAt = timestampNow;
      draft.space.localSpaces[spaceId].updatedAt = timestampNow;
    }, "createSpaceTab");
    analytics.track(AnalyticsEvent.CREATE_NEW_TAB);

    // Return the tabName immediately so UI can switch to it
    const result = { tabName };

    // Then make the remote API call in the background
    const unsignedRequest: UnsignedSpaceTabRegistration = {
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
      timestamp: moment().toISOString(),
      spaceId,
      tabName,
      initialConfig,
      network,
    };
    const signedRequest = signSignable(
      unsignedRequest,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );

    try {
      await axiosBackend.post<RegisterNewSpaceTabResponse>(
        `/api/space/registry/${spaceId}/tabs`,
        signedRequest,
      );
      
      // Create a signed file for the initial configuration
      const localCopy = cloneDeep(get().space.localSpaces[spaceId].tabs[tabName]);
      const file = await get().account.createSignedFile(
        stringify(localCopy),
        "json",
        { fileName: tabName },
      );
      
      // Commit both the order and the tab content immediately
      await Promise.all([
        get().space.commitSpaceOrderToDatabase(spaceId, network),
        axiosBackend.post(
          `/api/space/registry/${spaceId}/tabs/${tabName}`,
          { ...file, network },
        )
      ]);
      
      return result;
    } catch (e) {
      console.error("Failed to create space tab:", {
        error: e,
        spaceId,
        tabName,
        network,
        request: {
          identityPublicKey: unsignedRequest.identityPublicKey,
          timestamp: unsignedRequest.timestamp,
          initialConfig: initialConfig,
          network: network
        },
        response: axios.isAxiosError(e) ? {
          status: e.response?.status,
          statusText: e.response?.statusText,
          data: e.response?.data,
          headers: e.response?.headers
        } : null,
        stack: e instanceof Error ? e.stack : undefined,
        localState: {
          tabs: get().space.localSpaces[spaceId]?.tabs,
          order: get().space.localSpaces[spaceId]?.order,
          changedNames: get().space.localSpaces[spaceId]?.changedNames
        }
      });
      
      // Check if it's a rate limit error
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        console.warn("Rate limit hit, attempting retry after delay", {
          spaceId,
          tabName,
          network,
          retryAfter: e.response?.headers?.['retry-after'],
          rateLimitRemaining: e.response?.headers?.['x-ratelimit-remaining']
        });
        
        // If it's a rate limit error, we'll retry after a delay
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        try {
          await axiosBackend.post<RegisterNewSpaceTabResponse>(
            `/api/space/registry/${spaceId}/tabs`,
            signedRequest,
          );
          await get().space.commitSpaceOrderToDatabase(spaceId, network);
          return result;
        } catch (retryError) {
          console.error("Failed to create space tab after retry:", {
            error: retryError,
            spaceId,
            tabName,
            network,
            originalError: e
          });
          // If retry fails, we'll keep the local state but show an error
          throw new Error("Failed to create tab due to rate limiting. Please try again in a few seconds.");
        }
      }
      
      // For other errors, roll back local changes
      console.error("Rolling back local changes due to error:", {
        error: e,
        spaceId,
        tabName,
        network,
        localState: {
          tabs: get().space.localSpaces[spaceId]?.tabs,
          order: get().space.localSpaces[spaceId]?.order
        }
      });
      
      throw e; // Re-throw to allow error handling in the UI
    }
  },
  updateLocalSpaceOrder: async (spaceId, newOrder) => {
    set((draft) => {
      draft.space.localSpaces[spaceId].order = newOrder;
      const timestampNow = moment().toISOString();
      draft.space.localSpaces[spaceId].orderUpdatedAt = timestampNow;
      draft.space.localSpaces[spaceId].updatedAt = timestampNow;
    });
  },
  commitSpaceOrderToDatabase: debounce(
    async (spaceId, network?: EtherScanChainName) => {
      console.debug("debug", "Commiting space order to database");
      const timestamp = moment().toISOString();

      const unsignedReq: UnsignedUpdateTabOrderRequest = {
        spaceId,
        tabOrder: get().space.localSpaces[spaceId].order,
        publicKey: get().account.currentSpaceIdentityPublicKey!,
        timestamp,
        network,
      };
      const signedRequest = signSignable(
        unsignedReq,
        get().account.getCurrentIdentity()!.rootKeys.privateKey,
      );
      try {
        await axiosBackend.post<RegisterNewSpaceTabResponse>(
          `/api/space/registry/${spaceId}`,
          signedRequest,
        );
        set((draft) => {
          if (isUndefined(draft.space.remoteSpaces[spaceId])) {
            draft.space.remoteSpaces[spaceId] = {
              tabs: {},
              order: [],
              updatedAt: moment(0).toISOString(),
              id: spaceId,
            };
          }

          draft.space.remoteSpaces[spaceId].order = cloneDeep(
            get().space.localSpaces[spaceId].order,
          );

          draft.space.remoteSpaces[spaceId].orderUpdatedAt = timestamp;
          draft.space.localSpaces[spaceId].orderUpdatedAt = timestamp;
        }, "commitSpaceOrderToDatabase");
        analytics.track(AnalyticsEvent.SAVE_SPACE_THEME);
      } catch (e) {
        console.error(e);
      }
    },
    1000,
  ),
  loadSpaceTab: async (spaceId, tabName, fid) => {
    const supabase = createClient();
    try {
      // Fetch the public URL for the space tab file
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("spaces")
        .getPublicUrl(`${spaceId}/tabs/${tabName}`);

      const t = Math.random().toString(36).substring(2);
      const urlWithParam = `${publicUrl}?t=${t}`;

      // Download the file content, ensuring no caching
      const { data } = await axios.get<Blob>(urlWithParam, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      // Parse the file data and decrypt it
      const fileData = JSON.parse(await data.text()) as SignedFile;
      const remoteSpaceConfig = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as DatabaseWritableSpaceConfig;

      // Prepare the remote space config for updating, including privacy status
      const remoteUpdatableSpaceConfig = {
        ...remoteSpaceConfig,
        isPrivate: fileData.isEncrypted,
      };

      set((draft) => {
        // Initialize local and remote spaces if they don't exist
        if (isUndefined(draft.space.localSpaces[spaceId])) {
          draft.space.localSpaces[spaceId] = {
            tabs: {},
            order: [],
            updatedAt: moment().toISOString(),
            changedNames: {},
            id: spaceId,
          };
        }
        if (isUndefined(draft.space.remoteSpaces[spaceId])) {
          draft.space.remoteSpaces[spaceId] = {
            tabs: {},
            order: [],
            updatedAt: moment().toISOString(),
            id: spaceId,
          };
        }

        const localTab = draft.space.localSpaces[spaceId].tabs[tabName];

        // Compare timestamps if local tab exists
        if (
          !isUndefined(localTab) &&
          localTab.timestamp &&
          remoteUpdatableSpaceConfig.timestamp
        ) {
          const localTimestamp = moment(localTab.timestamp);
          const remoteTimestamp = moment(remoteUpdatableSpaceConfig.timestamp);

          if (remoteTimestamp.isAfter(localTimestamp)) {
            // Remote is newer, update both local and remote
            draft.space.remoteSpaces[spaceId].tabs[tabName] =
              remoteUpdatableSpaceConfig;
            draft.space.localSpaces[spaceId].tabs[tabName] = cloneDeep(
              remoteUpdatableSpaceConfig,
            );
          } else {
            // Local is newer or same age, keep local data
            draft.space.remoteSpaces[spaceId].tabs[tabName] =
              cloneDeep(localTab);
          }
        } else {
          // No local tab, create it with remote data
          draft.space.remoteSpaces[spaceId].tabs[tabName] =
            remoteUpdatableSpaceConfig;
          draft.space.localSpaces[spaceId].tabs[tabName] = cloneDeep(
            remoteUpdatableSpaceConfig,
          );
        }

        // Update timestamps
        const newTimestamp = moment().toISOString();
        draft.space.remoteSpaces[spaceId].updatedAt = newTimestamp;
        draft.space.localSpaces[spaceId].updatedAt = newTimestamp;
      }, "loadSpaceTab");
    } catch (e) {
      console.error(`Error loading space tab ${spaceId}/${tabName}:`, e);
    }
  },
  loadSpaceTabOrder: async (spaceId: string) => {
    try {
      // Fetch the remote tab order data
      const supabase = createClient();
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("spaces")
        .getPublicUrl(`${spaceId}/tabOrder`);

      const t = Math.random().toString(36).substring(2);
      const urlWithParam = `${publicUrl}?t=${t}`;

      const { data } = await axios.get<Blob>(urlWithParam, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const tabOrderReq = JSON.parse(
        await data.text(),
      ) as UpdateTabOrderRequest;

      // Compare local and remote timestamps
      const localSpace = get().space.localSpaces[spaceId];
      const remoteTimestamp = moment(tabOrderReq.timestamp);
      const localTimestamp = localSpace?.orderUpdatedAt
        ? moment(localSpace.orderUpdatedAt)
        : moment(0);
      const remoteIsNew = remoteTimestamp.isAfter(localTimestamp);
      const diff = moment.duration(remoteTimestamp.diff(localTimestamp));
      console.debug("debug", {
        remoteIsNew,
        remote: remoteTimestamp.toISOString(),
        remoteTabs: tabOrderReq.tabOrder,
        local: localTimestamp.toISOString(),
        localTabs: localSpace?.order,
        diff: diff.asSeconds(),
      });

      if (remoteIsNew) {
        // Remote data is newer, update the store
        set((draft) => {
          // Initialize local space if it doesn't exist
          if (isUndefined(draft.space.localSpaces[spaceId])) {
            draft.space.localSpaces[spaceId] = {
              tabs: {},
              order: [],
              updatedAt: remoteTimestamp.toISOString(),
              changedNames: {},
              id: spaceId,
            };
          }
          // Initialize remote space if it doesn't exist
          if (isUndefined(draft.space.remoteSpaces[spaceId])) {
            draft.space.remoteSpaces[spaceId] = {
              tabs: {},
              order: [],
              updatedAt: remoteTimestamp.toISOString(),
              id: spaceId,
            };
          }

          // Update both local and remote spaces with new tab order
          draft.space.localSpaces[spaceId].order = tabOrderReq.tabOrder;
          draft.space.localSpaces[spaceId].updatedAt =
            remoteTimestamp.toISOString();
          draft.space.localSpaces[spaceId].orderUpdatedAt =
            remoteTimestamp.toISOString();

          draft.space.remoteSpaces[spaceId].order = tabOrderReq.tabOrder;
          draft.space.remoteSpaces[spaceId].updatedAt =
            remoteTimestamp.toISOString();
          draft.space.remoteSpaces[spaceId].orderUpdatedAt =
            remoteTimestamp.toISOString();
        }, "loadSpaceInfo");
      }
    } catch (e) {
      console.debug("Error loading space tab order:", e);
    }
  },
  registerSpaceFid: async (fid, name, path) => {
    // First check if a space already exists for this FID
    try {
      const { data: existingSpaces } = await axiosBackend.get<ModifiableSpacesResponse>(
        "/api/space/registry",
        {
          params: {
            identityPublicKey: get().account.currentSpaceIdentityPublicKey,
          },
        },
      );
      
      if (existingSpaces.value) {
        const existingSpace = existingSpaces.value.spaces.find(space => space.fid === fid);
        if (existingSpace) {
          return existingSpace.spaceId;
        }
      }
    } catch (e) {
      console.error("Error checking for existing space:", e);
    }

    const unsignedRegistration: Omit<SpaceRegistrationFid, "signature"> = {
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
      spaceName: name,
      timestamp: moment().toISOString(),
      fid,
    };
    const registration = signSignable(
      unsignedRegistration,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );

    try {
      const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
        "/api/space/registry",
        registration,
      );
      const newSpaceId = data.value!.spaceId;
      
      // Initialize the space with proper structure
      set((draft) => {
        draft.space.editableSpaces[newSpaceId] = name;
        draft.space.localSpaces[newSpaceId] = {
          id: newSpaceId,
          updatedAt: moment().toISOString(),
          tabs: {},
          order: [],
          changedNames: {},
          fid: fid
        };
      });

      // Create and commit the initial Profile tab
      await get().space.createSpaceTab(
        newSpaceId,
        "Profile",
        createIntialPersonSpaceConfigForFid(fid),
      );
      analytics.track(AnalyticsEvent.SPACE_REGISTERED, {
        type: "user",
        spaceId: newSpaceId,
        path: path,
      });

      return newSpaceId;
    } catch (e) {
      console.error("Failed to register space:", e);
      throw e;
    }
  },
  registerSpaceContract: async (
    address,
    name,
    tokenOwnerFid,
    initialConfig,
    network,
  ) => {
    try {
      // First check local spaces for matching contract
      const existingSpace = Object.values(get().space.localSpaces).find(
        space => space.contractAddress === address && space.network === network
      );
      
      if (existingSpace) {
        // console.log('Found existing space in local cache:', {
        //   spaceId,
        //   network,
        //   space: existingSpace,
        // });
        return existingSpace.id;
      }

      // Check if a space already exists for this contract
      const { data: existingSpaces } = await axiosBackend.get<ModifiableSpacesResponse>(
        "/api/space/registry",
        {
          params: {
            identityPublicKey: get().account.currentSpaceIdentityPublicKey,
            contractAddress: address,
            network: network,
          },
        },
      );
      
      if (existingSpaces.value) {
        const existingSpace = existingSpaces.value.spaces.find(
          space => space.contractAddress === address && space.network === network
        );
        if (existingSpace) {
          // console.log('Found existing space:', {
          //   spaceId,
          //   network,
          //   space: existingSpace,
          // });
          // Cache the space info in local state
          set((draft) => {
            draft.space.editableSpaces[existingSpace.spaceId] = name;
            draft.space.localSpaces[existingSpace.spaceId] = {
              id: existingSpace.spaceId,
              updatedAt: moment().toISOString(),
              tabs: {},
              order: [],
              changedNames: {},
              contractAddress: address,
              network: network
            };
          });
          return existingSpace.spaceId;
        }
      }

      // console.log('No existing space found, registering new space:', {
      //   spaceId,
      //   network,
      // });

      const unsignedRegistration: Omit<SpaceRegistrationContract, "signature"> = {
        identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
        spaceName: name,
        timestamp: moment().toISOString(),
        contractAddress: address,
        tokenOwnerFid,
        network: network as EtherScanChainName,
      };
      const registration = signSignable(
        unsignedRegistration,
        get().account.getCurrentIdentity()!.rootKeys.privateKey,
      );

      try {
        const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
          "/api/space/registry",
          registration,
        );
        const newSpaceId = data.value!.spaceId;
        
        // Initialize both local and remote spaces with proper structure
        set((draft) => {
          draft.space.editableSpaces[newSpaceId] = name;
          draft.space.localSpaces[newSpaceId] = {
            id: newSpaceId,
            updatedAt: moment().toISOString(),
            tabs: {},
            order: [],
            changedNames: {},
            contractAddress: address,
            network: network
          };
          draft.space.remoteSpaces[newSpaceId] = {
            id: newSpaceId,
            updatedAt: moment().toISOString(),
            tabs: {},
            order: [],
            contractAddress: address,
            network: network
          };
        }, "registerSpace");

        // Create and commit the initial Profile tab
        await get().space.createSpaceTab(
          newSpaceId,
          "Profile",
          initialConfig,
          network,
        );

        analytics.track(AnalyticsEvent.SPACE_REGISTERED, {
        type: "token",
        spaceId: newSpaceId,
        path: `/t/${network}/${address}/Profile`,
      });
      return newSpaceId;
      } catch (e) {
        console.error("Failed to register contract space:", e);
        throw e;
      }
    } catch (e) {
      console.error("Error in registerSpaceContract:", e);
      throw e;
    }
  },
  registerProposalSpace: async (proposalId, initialConfig) => {
    try {
      // Check if a space already exists for this proposal
      const { data: existingSpaces } = await axiosBackend.get<ModifiableSpacesResponse>(
        "/api/space/registry",
        {
          params: {
            identityPublicKey: get().account.currentSpaceIdentityPublicKey,
            proposalId,
          },
        },
      );

      if (existingSpaces.value) {
        const existingSpace = existingSpaces.value.spaces.find(
          (space) => space.proposalId === proposalId
        );
        if (existingSpace) {
          return existingSpace.spaceId;
        }
      }

      // Register a new space for the proposal
      const unsignedRegistration: Omit<SpaceRegistrationProposer, "signature"> = {
        identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
        spaceName: `Nouns-Prop-${proposalId}`,
        timestamp: moment().toISOString(),
        proposalId,
      };
      const registration = signSignable(
        unsignedRegistration,
        get().account.getCurrentIdentity()!.rootKeys.privateKey,
      );

      const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
        "/api/space/registry",
        registration,
      );
      const newSpaceId = data.value!.spaceId;

      // Initialize the space with proper structure
      set((draft) => {
        draft.space.editableSpaces[newSpaceId] = `Proposal-${proposalId}`;
        draft.space.localSpaces[newSpaceId] = {
          id: newSpaceId,
          updatedAt: moment().toISOString(),
          tabs: {},
          order: [],
          changedNames: {},
          proposalId,
        };
      });

      // Create and commit the initial "Overview" tab
      await get().space.createSpaceTab(
        newSpaceId,
        "Overview",
        initialConfig
      );


      // TODO: Install analytics again after proposal space is working 
      // analytics.track(AnalyticsEvent.SPACE_REGISTERED, {
      //   type: "proposal",
      //   spaceId: newSpaceId,
      //   proposalId,
      // });

      return newSpaceId;
    } catch (e) {
      console.error("Failed to register proposal space:", e);
      throw e;
    }
  },
  loadEditableSpaces: async () => {
    try {
      const { data } = await axiosBackend.get<ModifiableSpacesResponse>(
        "/api/space/registry",
        {
          params: {
            identityPublicKey: get().account.currentSpaceIdentityPublicKey,
          },
        },
      );
      if (data.value) {
        const editableSpaces = fromPairs(
          map(data.value.spaces, (si) => [si.spaceId, si.spaceName]),
        );
        set((draft) => {
          draft.space.editableSpaces = {
            ...draft.space.editableSpaces,
            ...editableSpaces,
          };
          
          // Also populate localSpaces with metadata for contract spaces
          if (data.value) {
            data.value.spaces.forEach((spaceInfo) => {
              // Only create entry if it doesn't exist or if it's missing contract metadata
              if (!draft.space.localSpaces[spaceInfo.spaceId] || 
                  (!draft.space.localSpaces[spaceInfo.spaceId].contractAddress && spaceInfo.contractAddress)) {
                draft.space.localSpaces[spaceInfo.spaceId] = {
                  id: spaceInfo.spaceId,
                  updatedAt: moment().toISOString(),
                  tabs: draft.space.localSpaces[spaceInfo.spaceId]?.tabs || {},
                  order: draft.space.localSpaces[spaceInfo.spaceId]?.order || [],
                  changedNames: draft.space.localSpaces[spaceInfo.spaceId]?.changedNames || {},
                  contractAddress: spaceInfo.contractAddress,
                  network: spaceInfo.network,
                  fid: spaceInfo.fid,
                  proposalId: (spaceInfo as any).proposalId,
                };
              }
            });
          }
        }, "loadEditableSpaces");
        return editableSpaces;
      }
      return {};
    } catch (e) {
      console.error(e);
      return {};
    }
  },
  clear: () => {
    set(
      (draft) => {
        draft.space.localSpaces = {};
        draft.space.editableSpaces = {};
        draft.space.remoteSpaces = {};
      },
      "clearSpaces",
      true,
    );
  },
});

export const partializedSpaceStore = (state: AppStore): SpaceState => ({
  remoteSpaces: state.space.remoteSpaces,
  editableSpaces: state.space.editableSpaces,
  localSpaces: state.space.localSpaces,
});