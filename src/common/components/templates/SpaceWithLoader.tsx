import React from "react";
import { isUndefined } from "lodash";
import Space, { SpaceConfig } from "./Space";
import SpaceLoading from "./SpaceLoading";

type SpaceWithLoaderArgs = {
  config?: SpaceConfig;
  saveConfig?: (config: SpaceConfig) => Promise<void>;
  commitConfig?: () => Promise<void>;
  resetConfig?: () => Promise<void>;
};

export default function SpaceWithLoader({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
}: SpaceWithLoaderArgs) {
  return (
    <>
      {isUndefined(config) ||
      isUndefined(saveConfig) ||
      isUndefined(commitConfig) ||
      isUndefined(resetConfig) ? (
        <SpaceLoading />
      ) : (
        <Space
          config={config}
          saveConfig={saveConfig}
          commitConfig={commitConfig}
          resetConfig={resetConfig}
        />
      )}
    </>
  );
}
