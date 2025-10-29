import { FidgetBundle, FidgetConfig } from "@/common/fidgets";
import { ThemeSettings } from "@/common/lib/theme";
import { CompleteFidgets } from "@/fidgets";
import React from "react";
import { dummyFunctions } from "../utils";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";

interface FidgetContentProps {
  fidgetId: string;
  fidgetBundle: FidgetBundle;
  theme: ThemeSettings;
  saveFidgetConfig: (id: string) => (newConfig: FidgetConfig) => Promise<void>;
  isMobile: boolean;
  mobilePadding: number;
}

/**
 * Component for rendering a single fidget content
 */
const FidgetContent: React.FC<FidgetContentProps> = ({
  fidgetId,
  fidgetBundle,
  theme,
  saveFidgetConfig,
  isMobile,
  mobilePadding
}) => {  
  return (
    <div
      className="h-full w-full"
      style={isMobile ? { 
        paddingInline: `${mobilePadding}px`, 
        paddingTop: `${mobilePadding - 16}px`,
      } : {}}
    >
      <FidgetWrapper
        fidget={CompleteFidgets[fidgetBundle.fidgetType]?.fidget}
        context={{ theme }}
        bundle={fidgetBundle}
        saveConfig={saveFidgetConfig(fidgetId)}
        setCurrentFidgetSettings={dummyFunctions.setCurrentFidgetSettings}
        setSelectedFidgetID={dummyFunctions.setSelectedFidgetID}
        selectedFidgetID=""
        removeFidget={dummyFunctions.removeFidget}
        minimizeFidget={dummyFunctions.minimizeFidget}
      />
    </div>
  );
};

export default FidgetContent;