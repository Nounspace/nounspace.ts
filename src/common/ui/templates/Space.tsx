import { FidgetConfig, FidgetSettings, LayoutFidgetConfig, LayoutFidgetDetails } from '@/common/fidgets';
import React from 'react';
import { CompleteFidgets, LayoutFidgets } from '@/fidgets';
import { mapValues } from 'lodash';
import { FidgetWrapper } from '@/common/fidgets/FidgetWrapper';

export type SpaceConfig = {
  fidgetConfigs: {
    [key: string]: {
      instanceConfig: FidgetConfig<FidgetSettings>;
      fidgetName: string;
      id: string;
    };
  }
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
}

type SpaceArgs = {
  config: SpaceConfig;
  isEditable: boolean;
  saveConfig: (config: SpaceConfig) => Promise<boolean>;
}

export default function Space({ config, isEditable, saveConfig }: SpaceArgs){
  const LayoutFidget = LayoutFidgets[config.layoutDetails.layoutFidget];
  const fidgets = mapValues(config.fidgetConfigs, (details, key) => FidgetWrapper({
    fidget: CompleteFidgets[details.fidgetName].fidget,
    config: {
      id: details.id,
      instanceConfig: {
        editable: isEditable,
        settings: details.instanceConfig.settings,
      },
      editConfig: CompleteFidgets[details.fidgetName].editConfig,
    },
    saveConfig: async (newInstanceConfig: FidgetConfig<FidgetSettings>) => {
      return await saveConfig({
        layoutID: config.layoutID,
        layoutDetails: config.layoutDetails,
        fidgetConfigs: {
          ...config.fidgetConfigs,
          [key]: {
            instanceConfig: newInstanceConfig,
            id: details.id,
            fidgetName: details.fidgetName,
          },
        },
      })
    },
  }));

  function saveLayout(layout: LayoutFidgetConfig) {
    return saveConfig({
      layoutID: config.layoutID,
      fidgetConfigs: config.fidgetConfigs,
      layoutDetails: {
        ...config.layoutDetails,
        layoutConfig: {
          ...config.layoutDetails.layoutConfig,
          layout: layout,
        },
      },
    });
  }

  return (
    <LayoutFidget
      layoutConfig={{
        ...config.layoutDetails.layoutConfig,
        onLayoutChange: saveLayout,
      }}
      fidgets={fidgets}
      isEditable={isEditable}
    />
  );
}