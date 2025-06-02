import React from "react";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { FidgetBundle, FidgetConfig } from "@/common/fidgets";
import { ThemeSettings } from "@/common/lib/theme";
import { dummyFunctions } from "../utils";
import { CompleteFidgets } from "@/fidgets";

interface ConsolidatedPinnedContentProps {
  pinnedCastIds: string[];
  fidgetBundles: Record<string, FidgetBundle>;
  theme: ThemeSettings;
  saveFidgetConfig: (id: string) => (newConfig: FidgetConfig) => Promise<void>;
}

/**
 * Component for rendering consolidated pinned casts
 * Displays multiple pinned casts in a column layout for mobile
 */
const ConsolidatedPinnedContent: React.FC<ConsolidatedPinnedContentProps> = ({
  pinnedCastIds,
  fidgetBundles,
  theme,
  saveFidgetConfig
}) => {
  if (pinnedCastIds.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pb-16">
      {pinnedCastIds.map((fidgetId) => {
        const bundle = fidgetBundles[fidgetId];
        if (!bundle) return null;
        
        return (
          <div 
            key={fidgetId} 
            className="w-full h-fit"
          >
            <FidgetWrapper
              fidget={CompleteFidgets[bundle.fidgetType]?.fidget}
              bundle={bundle}
              saveConfig={saveFidgetConfig(fidgetId)}
              setCurrentFidgetSettings={dummyFunctions.setCurrentFidgetSettings}
              setSelectedFidgetID={dummyFunctions.setSelectedFidgetID}
              selectedFidgetID=""
              removeFidget={dummyFunctions.removeFidget}
              minimizeFidget={dummyFunctions.minimizeFidget}
              theme={theme}
              saveTheme={dummyFunctions.saveTheme}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ConsolidatedPinnedContent;