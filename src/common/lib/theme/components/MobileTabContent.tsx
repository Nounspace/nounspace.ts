import { MiniApp } from "@/common/components/molecules/MiniAppSettings";
import MobileSettings from "@/common/components/organisms/MobileSettings";
import React from "react";

interface MobileTabContentProps {
  miniApps: MiniApp[];
  onUpdateMiniApp: (app: MiniApp) => void;
  onReorderMiniApps: (apps: MiniApp[]) => void;
}

export const MobileTabContent: React.FC<MobileTabContentProps> = ({
  miniApps,
  onUpdateMiniApp,
  onReorderMiniApps,
}) => {
  const filteredMiniApps = miniApps;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <MobileSettings
          miniApps={filteredMiniApps}
          onUpdateMiniApp={onUpdateMiniApp}
          onReorderMiniApps={onReorderMiniApps}
        />
      </div>
    </div>
  );
};

export default MobileTabContent;
