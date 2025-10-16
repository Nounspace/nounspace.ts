import React from "react";
import { Button } from "@/common/components/atoms/button";
import { FaFloppyDisk } from "react-icons/fa6";
import {BackgroundGenerator} from "../BackgroundGenerator";

interface CodeTabContentProps {
  backgroundHTML: string;
  onPropertyChange: (property: string) => (value: string) => void;
  onExportConfig?: () => void;
}

export const CodeTabContent: React.FC<CodeTabContentProps> = ({
  backgroundHTML,
  onPropertyChange,
  onExportConfig,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <BackgroundGenerator
        backgroundHTML={backgroundHTML}
        onChange={onPropertyChange("backgroundHTML")}
      />
      {onExportConfig && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Export Configuration</h4>
            <p className="text-xs text-gray-500">
              Download your current space configuration as a JSON file.
            </p>
            <Button
              onClick={onExportConfig}
              variant="secondary"
              width="auto"
              withIcon
              className="w-full"
            >
              <FaFloppyDisk aria-hidden="true" />
              <span>Export Config</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeTabContent;
