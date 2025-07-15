"use client";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import { FidgetInstanceData, LayoutFidgetConfig } from "@/common/fidgets";
import { ThemeSettings, UserTheme } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import { isNil, isUndefined } from "lodash";
import PhoneFrame from "@/common/components/atoms/PhoneFrame";
import { usePathname } from "next/navigation";
import React, { ReactNode, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";
import MobileViewSimplified from "./MobileViewSimplified";
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
  const pathname = usePathname();
  const isHomebasePath = pathname?.startsWith('/homebase');

  const layoutFidgetIds = useMemo(() => {
    return Object.keys(fidgetInstanceDatums || {}).sort((a, b) => {
      const aOrder = fidgetInstanceDatums[a]?.config?.settings?.mobileOrder || 0;
      const bOrder = fidgetInstanceDatums[b]?.config?.settings?.mobileOrder || 0;
      return aOrder - bOrder;
    });
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

      <div 
        className="w-full h-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: "url('/images/space-background.png')" }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="relative w-[344px] h-[744px]">
            <div className="absolute top-[10px] left-[16px] z-0">
              <div
                className="w-[312px] h-[675px] relative overflow-hidden rounded-[32px] shadow-lg"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: theme?.properties.background || 'white',
                  transform: 'scale(1.0)',
                  transformOrigin: 'top left'
                }}
              >
                <CustomHTMLBackground
                  html={theme?.properties.backgroundHTML}
                  className="absolute inset-0 pointer-events-none w-full h-full"
                />
                <div className="flex-1 w-full overflow-auto">
                  <div className="relative w-full h-full flex flex-col">
                    <div className="w-full bg-white">
                      {!isUndefined(profile) ? (
                        <div className="w-full max-h-fit">
                          <div className="rounded-md shadow-sm overflow-hidden">
                            {profile}
                          </div>
                        </div>
                      ) : null}

                      <div className="border-b relative">
                        <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                          {tabBar}
                        </div>
                      </div>
                    </div>

                    <Suspense fallback={
                      <SpaceLoading
                        hasProfile={!isNil(profile)}
                        hasFeed={!isNil(feed)}
                      />
                    }>
                      <MobileViewSimplified
                        theme={theme}
                        fidgetInstanceDatums={fidgetInstanceDatums}
                        fidgetTrayContents={fidgetTrayContents}
                        saveConfig={saveConfig}
                        inEditMode={false}
                        saveExitEditMode={saveExitEditMode}
                        cancelExitEditMode={cancelExitEditMode}
                        portalRef={portalRef}
                        hasProfile={!isNil(profile)}
                        hasFeed={!isNil(feed)}
                        feed={feed}
                        tabNames={tabNames}
                        fid={fid}
                        layoutFidgetIds={layoutFidgetIds}
                        isHomebasePath={isHomebasePath}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
            <PhoneFrame className="pointer-events-none select-none absolute " />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePreview; 