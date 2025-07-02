"use client";
import React, { ReactNode, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import { UserTheme, ThemeSettings } from "@/common/lib/theme";
import { FidgetInstanceData, LayoutFidgetConfig } from "@/common/fidgets";
import { LayoutFidgets } from "@/fidgets";
import { isNil, isUndefined } from "lodash";
import SpaceLoading from "./SpaceLoading";

interface MobilePreviewProps {
  theme: UserTheme;
  editMode: boolean;
  portalRef: React.RefObject<HTMLDivElement>;
  profile?: ReactNode;
  tabBar: ReactNode;
  feed?: ReactNode;
  saveTheme: (newTheme: ThemeSettings) => void;
  saveExitEditMode: () => void;
  cancelExitEditMode: () => void;
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  saveFidgetInstanceDatums: (datums: { [key: string]: FidgetInstanceData }) => Promise<void>;
  
  // LayoutFidget props
  layoutConfig: LayoutFidgetConfig<any>;
  fidgetTrayContents: FidgetInstanceData[];
  saveConfig: (config: any) => Promise<void>;
  tabNames?: string[];
  fid?: number;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({
  theme,
  editMode,
  portalRef,
  profile,
  tabBar,
  feed,
  saveTheme,
  saveExitEditMode,
  cancelExitEditMode,
  fidgetInstanceDatums,
  saveFidgetInstanceDatums,
  layoutConfig,
  fidgetTrayContents,
  saveConfig,
  tabNames,
  fid,
}) => {
  // Always use tabFullScreen for mobile preview
  const LayoutFidget = useMemo(() => LayoutFidgets["tabFullScreen"], []);



  // Transform layout config for mobile (simple array of fidget IDs)
  const mobileLayoutConfig = useMemo(() => {
    const fidgetIds = Object.keys(fidgetInstanceDatums || {});
    return {
      layout: fidgetIds,
      layoutFidget: "tabFullScreen",
    };
  }, [fidgetInstanceDatums]);

  return (
    <>
      {/* Theme Editor Portal */}
      {editMode && portalRef.current
        ? createPortal(
          <aside
            id="logo-sidebar"
            className="h-screen flex-row flex bg-white"
            aria-label="Sidebar"
          >
            <div className="flex-1 w-[270px] h-full max-h-screen pt-12 flex-col flex px-4 py-4 overflow-y-auto border-r">
              <ThemeSettingsEditor
                theme={theme}
                saveTheme={saveTheme}
                saveExitEditMode={saveExitEditMode}
                cancelExitEditMode={cancelExitEditMode}
                fidgetInstanceDatums={fidgetInstanceDatums}
                saveFidgetInstanceDatums={saveFidgetInstanceDatums}
              />
            </div>
          </aside>,
          portalRef.current,
        )
        : null}

      {/* Mobile Preview Container - Full height background */}
      <div 
        className="w-full h-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: "url('https://i.ibb.co/pjYr9zFr/Chat-GPT-Image-May-29-2025-01-35-55-PM.png')" }}
      >
        {/* Phone Frame Container - scaled to fit better */}
        <div className="relative flex items-center justify-center scale-90">
          {/* Phone Frame Overlay */}
          <Image
            src="https://i.ibb.co/nsLJDmpT/Smartphone-mock-3.png"
            alt="Phone mockup"
            width={344}
            height={744}
            className="pointer-events-none select-none relative z-20"
          />
          
          {/* Phone Content Area - positioned to match actual screen area within frame */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div 
              className="w-[320px] h-[680px] overflow-hidden rounded-[28px] flex flex-col"
            >
              <CustomHTMLBackground
                html={theme?.properties.backgroundHTML}
                className="absolute inset-0 pointer-events-none w-full h-full rounded-[28px] px-2"
              />
              
              {/* Content Container - with proper constraints */}
              <div className={`flex-1 flex flex-col h-full w-full relative z-10 overflow-hidden ${isUndefined(theme?.properties.background) &&  "bg-white"}`}>
                {/* Header Content */}
                <div className="flex-shrink-0 w-full bg-white">

                  {/* Tab Bar */}
                  <div className="border-b relative">
                    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                      {tabBar}
                    </div>
                  </div>
                </div>
                
                {/* Profile Section */}
                {!isUndefined(profile) ? (
                    <div className="w-full">
                      <div className="overflow-hidden">
                        {profile}
                      </div>
                    </div>
                  ) : null}

                {/* Main Content - LayoutFidget with proper constraints */}
                {/* Feed (if not mobile) */}
                <div className="flex-1 overflow-hidden">
                  <Suspense
                    fallback={
                      <SpaceLoading
                        hasProfile={!isNil(profile)}
                        hasFeed={!isNil(feed)}
                      />
                    }
                  >
                    {!isUndefined(feed) ? 
                    (
                      <>
                        {feed}
                      </>
                    )
                                         : LayoutFidget ? (
                        <LayoutFidget
                            layoutConfig={mobileLayoutConfig}
                            theme={theme}
                            fidgetInstanceDatums={fidgetInstanceDatums}
                            fidgetTrayContents={fidgetTrayContents}
                            saveExitEditMode={saveExitEditMode}
                            cancelExitEditMode={cancelExitEditMode}
                            portalRef={portalRef}
                            saveConfig={saveConfig}
                            hasProfile={!isNil(profile)}
                            hasFeed={!isNil(feed)}
                            feed={feed}
                            tabNames={tabNames}
                            fid={fid}
                            inEditMode={false}
                        />
                        ) : (
                        <SpaceLoading
                            hasProfile={!isNil(profile)}
                            hasFeed={!isNil(feed)}
                        />
                        )
                    }
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePreview; 