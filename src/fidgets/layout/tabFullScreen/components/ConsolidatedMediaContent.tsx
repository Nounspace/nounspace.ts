import React from "react";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { FidgetBundle, FidgetConfig } from "@/common/fidgets";
import { ThemeSettings } from "@/common/lib/theme";
import { dummyFunctions } from "../utils";
import { CompleteFidgets } from "@/fidgets";

interface ConsolidatedMediaContentProps {
  mediaFidgetIds: string[];
  fidgetBundles: Record<string, FidgetBundle>;
  theme: ThemeSettings;
  saveFidgetConfig: (id: string) => (newConfig: FidgetConfig) => Promise<void>;
}

/**
 * Component for rendering consolidated media content (images, text, videos)
 * Displays multiple media fidgets in a column layout for mobile
 */
const ConsolidatedMediaContent: React.FC<ConsolidatedMediaContentProps> = ({
  mediaFidgetIds,
  fidgetBundles,
  theme,
  saveFidgetConfig
}) => {
  if (mediaFidgetIds.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pb-16">
      {mediaFidgetIds.map((fidgetId) => {
        const bundle = fidgetBundles[fidgetId];
        if (!bundle) return null;
        
        const aspectRatioClass = 
          bundle.properties.fidgetName === "Image" ? 
          "aspect-[4/3] w-full overflow-hidden" : 
          "aspect-square w-full overflow-hidden";
        
        return (
          <div 
            key={fidgetId} 
            className={`${aspectRatioClass} relative rounded-lg`}
          >
            <div className="absolute inset-0">
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
          </div>
        );
      })}
    </div>
  );
};

export default ConsolidatedMediaContent;