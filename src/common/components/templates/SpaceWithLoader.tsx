import React from "react";
import { isUndefined } from "lodash";
import Space, { SpaceConfig } from "./Space";
import SpaceLoading from "./SpaceLoading";

type SpaceWithLoaderArgs = {
  config?: SpaceConfig;
  saveConfig?: (config: SpaceConfig) => Promise<void>;
};

export default function SpaceWithLoader({
  config,
  saveConfig,
}: SpaceWithLoaderArgs) {
  return (
    <>
      {isUndefined(config) || isUndefined(saveConfig) ? (
        <SpaceLoading />
      ) : (
        <Space config={config} saveConfig={saveConfig} />
      )}
    </>
  );
}
