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
  const filteredMiniApps = miniApps.filter(
    (app) => app.mobileDisplayName && app.mobileDisplayName.trim() !== ""
  );

  return (
    <div className="flex flex-col gap-4">
      <MobileSettings
        miniApps={filteredMiniApps}
        onUpdateMiniApp={onUpdateMiniApp}
        onReorderMiniApps={onReorderMiniApps}
      />
    </div>
  );
};

export default MobileTabContent;
