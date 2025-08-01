import { StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { cloneDeep } from "lodash";

export interface SpaceCheckpoint {
  id: string;
  name: string;
  timestamp: Date;
  spaceConfig: any; // Complete space configuration including theme
  description?: string;
  source: 'theme-editor' | 'ai-chat' | 'manual'; // Where the checkpoint was created
}

interface CheckpointStoreState {
  checkpoints: SpaceCheckpoint[];
  maxCheckpoints: number;
  isRestoring: boolean;
}

interface CheckpointStoreActions {
  createCheckpoint: (
    description?: string,
    source?: SpaceCheckpoint['source'],
    spaceConfig?: any
  ) => SpaceCheckpoint;
  createCheckpointFromContext: (
    getCurrentSpaceConfig: () => any,
    description?: string,
    source?: SpaceCheckpoint['source']
  ) => SpaceCheckpoint;
  restoreCheckpoint: (
    checkpointId: string,
    onApplySpaceConfig: (config: any) => Promise<void>
  ) => Promise<boolean>;
  deleteCheckpoint: (checkpointId: string) => void;
  clearCheckpoints: () => void;
  getCheckpoint: (checkpointId: string) => SpaceCheckpoint | undefined;
  getRecentCheckpoints: (count?: number) => SpaceCheckpoint[];
  setIsRestoring: (isRestoring: boolean) => void;
}

export type CheckpointStore = CheckpointStoreState & CheckpointStoreActions;

export const checkpointStoreDefaults: CheckpointStoreState = {
  checkpoints: [],
  maxCheckpoints: 20, // Keep last 20 checkpoints to avoid memory bloat
  isRestoring: false,
};

export const createCheckpointStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): CheckpointStore => ({
  ...checkpointStoreDefaults,

  createCheckpoint: (
    description,
    source = 'manual',
    spaceConfig
  ) => {
    const timestamp = new Date();
    const checkpoints = get().checkpoints.checkpoints;

    const checkpoint: SpaceCheckpoint = {
      id: `checkpoint-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      name: description || `${source} checkpoint ${checkpoints.length + 1}`,
      timestamp,
      spaceConfig: spaceConfig ? cloneDeep(spaceConfig) : {},
      description: description || `Saved from ${source}`,
      source,
    };

    console.log("💾 Creating checkpoint:", {
      checkpointId: checkpoint.id,
      name: checkpoint.name,
      source: checkpoint.source,
      hasSpaceConfig: !!checkpoint.spaceConfig,
    });

    set((draft) => {
      // Add new checkpoint
      draft.checkpoints.checkpoints.push(checkpoint);

      // Trim to max checkpoints (keep most recent)
      const maxCheckpoints = draft.checkpoints.maxCheckpoints;
      if (draft.checkpoints.checkpoints.length > maxCheckpoints) {
        draft.checkpoints.checkpoints = draft.checkpoints.checkpoints.slice(-maxCheckpoints);
      }
    }, "createCheckpoint");

    return checkpoint;
  },

  createCheckpointFromContext: (
    getCurrentSpaceConfig,
    description,
    source = 'manual'
  ) => {
    try {
      const spaceConfig = getCurrentSpaceConfig();

      return get().checkpoints.createCheckpoint(
        description,
        source,
        spaceConfig
      );
    } catch (error) {
      console.error("❌ Failed to create checkpoint from context:", error);
      // Return a minimal checkpoint rather than failing
      return get().checkpoints.createCheckpoint(
        description || "Error creating checkpoint",
        source,
        {}
      );
    }
  },

  restoreCheckpoint: async (checkpointId, onApplySpaceConfig) => {
    const checkpoint = get().checkpoints.getCheckpoint(checkpointId);
    if (!checkpoint) {
      console.error("❌ Checkpoint not found:", checkpointId);
      return false;
    }

    console.log("🔄 Restoring checkpoint:", {
      checkpointId: checkpoint.id,
      name: checkpoint.name,
      source: checkpoint.source,
      timestamp: checkpoint.timestamp,
    });

    set((draft) => {
      draft.checkpoints.isRestoring = true;
    }, "restoreCheckpoint-start");

    try {
      // Apply the complete space configuration from checkpoint
      await onApplySpaceConfig(checkpoint.spaceConfig);

      console.log("✅ Successfully restored checkpoint:", checkpointId);
      return true;
    } catch (error) {
      console.error("❌ Failed to restore checkpoint:", error);
      return false;
    } finally {
      set((draft) => {
        draft.checkpoints.isRestoring = false;
      }, "restoreCheckpoint-end");
    }
  },

  deleteCheckpoint: (checkpointId) => {
    set((draft) => {
      draft.checkpoints.checkpoints = draft.checkpoints.checkpoints.filter(
        cp => cp.id !== checkpointId
      );
    }, "deleteCheckpoint");

    console.log("🗑️ Deleted checkpoint:", checkpointId);
  },

  clearCheckpoints: () => {
    set((draft) => {
      draft.checkpoints.checkpoints = [];
    }, "clearCheckpoints");

    console.log("🧹 Cleared all checkpoints");
  },

  getCheckpoint: (checkpointId) => {
    return get().checkpoints.checkpoints.find(cp => cp.id === checkpointId);
  },

  getRecentCheckpoints: (count = 3) => {
    const checkpoints = get().checkpoints.checkpoints;
    return checkpoints.slice(-count).reverse(); // Get last N checkpoints, most recent first
  },

  setIsRestoring: (isRestoring) => {
    set((draft) => {
      draft.checkpoints.isRestoring = isRestoring;
    }, "setIsRestoring");
  },
});

export function partializedCheckpointStore(state: AppStore) {
  return {
    checkpoints: state.checkpoints.checkpoints,
    isRestoring: state.checkpoints.isRestoring,
  };
} 