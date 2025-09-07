"use client";
import React from "react";
import { FaPlus, FaPaintbrush } from "react-icons/fa6";
import { debounce, map } from "lodash";
import { Reorder } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import { Address } from "viem";
import { useAppStore } from "@/common/data/stores/app";
import { TooltipProvider } from "../atoms/tooltip";
import TokenDataHeader from "./TokenDataHeader";
import ClaimButtonWithModal from "../molecules/ClaimButtonWithModal";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { SpacePageType } from "@/app/(spaces)/PublicSpace";
import { useSidebarContext } from "./Sidebar";
import { Button } from "../atoms/button";
import { toast } from "sonner";

interface TabBarProps {
  inHome?: boolean;
  inHomebase: boolean;
  inEditMode: boolean;
  currentTab: string;
  tabList: string[];
  updateTabOrder: (newOrder: string[]) => void;
  commitTabOrder: () => void;
  switchTabTo: (tabName: string, shouldSave?: boolean) => void;
  deleteTab: (tabName: string) => void;
  createTab: (tabName: string) => Promise<{ tabName: string } | undefined>;
  renameTab: (tabName: string, newName: string) => void;
  commitTab: (tabName: string) => void;
  getSpacePageUrl: (tabName: string) => string;
  isTokenPage?: boolean;
  contractAddress?: Address;
  pageType?: SpacePageType | undefined;
  isEditable?: boolean;
}

const PERMANENT_TABS = ["Feed", "Profile"];
const isEditableTab = (tabName: string) => !PERMANENT_TABS.includes(tabName);

// Add validation function
const validateTabName = (tabName: string): string | null => {
  if (/[^a-zA-Z0-9-_ ]/.test(tabName)) {
    return "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed.";
  }
  return null;
};

function TabBar({
  inHome,
  inHomebase,
  inEditMode,
  currentTab,
  tabList = ["Profile"],
  switchTabTo,
  updateTabOrder,
  commitTabOrder,
  deleteTab,
  createTab,
  renameTab,
  commitTab,
  getSpacePageUrl,
  isTokenPage,
  contractAddress,
  pageType,
  isEditable
}: TabBarProps) {
  const isMobile = useIsMobile();
  const { setEditMode } = useSidebarContext();

  const { getIsLoggedIn, getIsInitializing, homebaseLoadTab } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    homebaseLoadTab: state.homebase.loadHomebaseTab,
  }));

  const [isOperating, setIsOperating] = React.useState(false);

  /// State to control post-delete navigation
  const [pendingTabSwitch, setPendingTabSwitch] = React.useState<string | null>(null);

  // Function to calculate next tab after deletion
  const nextClosestTab = React.useCallback((tabName: string) => {
    const index = tabList.indexOf(tabName);
    const futureTabList = tabList.filter(tab => tab !== tabName);
    
    if (futureTabList.length === 0) {
      return inHomebase ? "Feed" : "Profile";
    }
    
    if (index === tabList.length - 1 && index > 0) {
      return futureTabList[futureTabList.length - 1];
    }
    else if (index >= 0 && index < futureTabList.length) {
      return futureTabList[index];
    }
    else if (futureTabList.length > 0) {
      return futureTabList[futureTabList.length - 1];
    }
    else {
      return inHomebase ? "Feed" : "Profile";
    }
  }, [tabList, inHomebase]);

  // Simple debounced functions without complex optimizations
  const debouncedCreateTab = React.useCallback(
    debounce(async (tabName: string) => {
      if (isOperating) {
        console.log("Operation already in progress, skipping");
        return;
      }
      
      console.log("Creating tab with name:", tabName);
      setIsOperating(true);
      
      try {
        if (!tabName || typeof tabName !== 'string' || tabName.trim() === '') {
          console.error("Invalid tab name provided:", tabName);
          return;
        }
        
        const cleanTabName = tabName.trim();
        
        // If tab already exists, just switch to it
        if (tabList.includes(cleanTabName)) {
          console.log("Tab already exists, switching to it");
          return;
        }

        console.log("Calling createTab function...");
        const result = await createTab(cleanTabName);
        console.log("CreateTab result:", result);
        
        const finalTabName = result?.tabName || cleanTabName;
        console.log("Final tab name:", finalTabName);
        
        // Only commit, don't auto-switch to avoid race conditions
        console.log("Committing tab order...");
        commitTabOrder();
        
        console.log("Tab creation completed successfully");
        
      } catch (error) {
        console.error("Error in createTab:", error);
      } finally {
        setIsOperating(false);
      }
    }, 300),
    [isOperating, tabList, createTab, commitTabOrder]
  );

  const debouncedDeleteTab = React.useCallback(
    debounce(async (tabName: string) => {
      if (isOperating) return;
      setIsOperating(true);
      try {
        if (!isEditableTab(tabName)) {
          toast.error("Cannot delete this tab.");
          return;
        }
        
        if (tabList.length <= 1) {
          toast.error("You must have at least one tab.");
          return;
        }
        
        // Only set pending switch if we're deleting the current tab
        if (currentTab === tabName) {
          const nextTab = nextClosestTab(tabName);
          setPendingTabSwitch(nextTab);
        }
        
        await deleteTab(tabName);
        
        toast.success("Tab deleted successfully!");
      } catch (error) {
        console.error("Error deleting tab:", error);
        toast.error("Error deleting tab. Please try again.");
      } finally {
        setIsOperating(false);
      }
    }, 300),
    [isOperating, tabList, deleteTab, currentTab, nextClosestTab]
  );

  const debouncedRenameTab = React.useCallback(
    debounce(async (tabName: string, newName: string) => {
      if (isOperating) return;
      setIsOperating(true);
      try {
        if (!newName || typeof newName !== 'string') {
          return;
        }

        const sanitizedName = newName.trim();
        if (!sanitizedName || sanitizedName === tabName) {
          return;
        }

        const validationError = validateTabName(sanitizedName);
        if (validationError) {
          console.error("Tab name validation failed:", validationError);
          return;
        }

        const uniqueName = generateUniqueTabName(sanitizedName);
        if (!uniqueName || uniqueName === tabName) {
          return;
        }
        
        renameTab(tabName, uniqueName);
        const newOrder = tabList.map((name) => (name === tabName ? uniqueName : name));
        updateTabOrder(newOrder);
        switchTabTo(uniqueName);
        commitTab(uniqueName);
        commitTabOrder();
        
      } catch (error) {
        console.error("Error in handleRenameTab:", error);
      } finally {
        setIsOperating(false);
      }
    }, 300),
    [isOperating, renameTab, updateTabOrder, switchTabTo, commitTab, commitTabOrder, tabList]
  );

  function generateNewTabName(): string {
    try {
      // Use the list length to determine the next tab number
      const nextNumber = tabList.length + 1;
      const baseName = `Tab ${nextNumber}`;
      
      // If this name is available, use it
      if (!tabList.includes(baseName)) {
        return baseName;
      }
      
      // If somehow that number is taken, find the next available
      let counter = nextNumber + 1;
      let newName = `Tab ${counter}`;
      
      while (tabList.includes(newName) && counter < 200) {
        counter++;
        newName = `Tab ${counter}`;
      }
      
      return newName;
    } catch (error) {
      console.error("Error generating tab name:", error);
      return `Tab ${Date.now()}`;
    }
  }

  function generateUniqueTabName(tabName: string) {
    try {
      // First validate the base name
      const validationError = validateTabName(tabName);
      if (validationError) {
        console.error("Invalid base tab name:", tabName, validationError);
        return null;
      }

      let iter = 1;
      let uniqueName = tabName;
      
      // Safety limit to prevent infinite loops
      const maxIterations = 100;
      
      while (tabList.includes(uniqueName) && iter <= maxIterations) {
        uniqueName = `${tabName} - ${iter}`;
        // Validate each generated name
        const validationError = validateTabName(uniqueName);
        if (validationError) {
          console.error("Could not generate unique name:", uniqueName, validationError);
          return null;
        }
        iter += 1;
      }
      
      if (iter > maxIterations) {
        console.error("Max iterations reached for unique name generation");
        return null;
      }
      
      return uniqueName;
    } catch (error) {
      console.error("Error in generateUniqueTabName:", error);
      return null;
    }
  }

  // Effect to navigate safely after tab deletion
  React.useEffect(() => {
    if (!pendingTabSwitch || !tabList.includes(pendingTabSwitch)) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      try {
        // Update URL when navigating after tab deletion
        try {
          if (typeof getSpacePageUrl === 'function') {
            const url = getSpacePageUrl(encodeURIComponent(pendingTabSwitch));
            if (url && typeof url === 'string') {
              window.history.pushState({}, '', url);
            }
          }
        } catch (urlError) {
          // Continue with navigation even if URL update fails
        }
        
        switchTabTo(pendingTabSwitch);
        setPendingTabSwitch(null);
      } catch (error) {
        // Silent fallback - just clear the pending switch
        setPendingTabSwitch(null);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [tabList, pendingTabSwitch, switchTabTo, getSpacePageUrl]);

  // Releases the ref whenever the tab actually changes
  React.useEffect(() => {
    // No longer needed, but keeping for potential future use
  }, [currentTab]);

  const handleTabClick = React.useCallback((tabName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Does nothing if it's already the current tab
    if (currentTab === tabName) {
      return;
    }
    
    // Update URL immediately on click for instant visual feedback
    try {
      if (typeof getSpacePageUrl === 'function') {
        const url = getSpacePageUrl(encodeURIComponent(tabName));
        window.history.pushState({}, '', url);
      }
    } catch (error) {
      console.error("Error updating URL:", error);
    }
    
    // Direct call to switchTabTo
    switchTabTo(tabName, true);
  }, [currentTab, getSpacePageUrl, switchTabTo]);

  // Function to preload tab data (only for homebase tabs)
  const preloadTabData = React.useCallback((tabName: string) => {
    if (inHomebase && typeof homebaseLoadTab === 'function') {
      homebaseLoadTab(tabName);
    }
  }, [inHomebase, homebaseLoadTab]);

  // Simple debounced reorder function
  const debouncedReorder = React.useCallback(
    debounce((newOrder) => {
      if (isOperating) return;
      setIsOperating(true);
      updateTabOrder(newOrder);
      setTimeout(() => {
        commitTabOrder();
        setIsOperating(false);
      }, 50);
    }, 300),
    [isOperating, updateTabOrder, commitTabOrder]
  );

  const isLoggedIn = getIsLoggedIn();

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row justify-start md:h-16 z-30 bg-white w-full"> 
        {isTokenPage && contractAddress && (
          <div className="flex flex-row justify-start h-16 w-full md:w-fit z-20 bg-white">
            <TokenDataHeader />
          </div>
        )}
        <div className="flex w-full h-16 bg-white items-center justify-between"> 
          {/* Tabs Section - grows until it hits buttons */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Reorder.Group
                as="ol"
                axis="x"
                onReorder={debouncedReorder}
                className="flex flex-nowrap gap-5 md:gap-4 items-start ml-2 my-4 mr-4 tabs"
                values={tabList}
              >
                {map(
                  inHomebase ? ["Feed", ...tabList] : tabList,
                  (tabName: string) => (
                    <Tab
                      key={`tab-${tabName}`}
                      getSpacePageUrl={getSpacePageUrl}
                      tabName={tabName}
                      inEditMode={inEditMode}
                      isSelected={currentTab === tabName}
                      onClick={() => handleTabClick(tabName)}
                      removeable={isEditableTab(tabName)}
                      draggable={inEditMode}
                      renameable={isEditableTab(tabName)}
                      onRemove={() => debouncedDeleteTab(tabName)}
                      renameTab={(tab, newName) => debouncedRenameTab(tab, newName)}
                      preloadTabData={preloadTabData}
                    />
                  )
                )}
              </Reorder.Group>
            </div>
          </div>

          {/* Action Buttons - pushed to right side */}
          {(isEditable) && (
            <div className="flex items-center gap-2 px-2 flex-shrink-0">
              {!inEditMode && (
                <Button
                  onClick={() => setEditMode(true)}
                  className="flex items-center rounded-xl p-2 bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold shadow-md"
                >
                  <FaPaintbrush />
                  {!isMobile && <span className="ml-2">Customize</span>}
                </Button>
              )}
              {(inEditMode) && (
                <Button
                  onClick={() => debouncedCreateTab(generateNewTabName())}
                  disabled={isOperating}
                  className="flex items-center rounded-xl p-2 bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold shadow-md"
                >
                  <FaPlus />
                  <span className="ml-1">Tab</span>
                </Button>
              )}
            </div>
          )}
        </div>
        {isTokenPage && !getIsInitializing() && !isLoggedIn && !isMobile && (
          <ClaimButtonWithModal contractAddress={contractAddress} />
        )}
      </div>
     {/* Visual operation feedback as a tooltip */}
      {isOperating && (
        <div className="fixed bottom-8 right-8 z-50">
          <TooltipProvider>
            <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 shadow-lg flex items-center">
              <span className="text-blue-600 font-bold">Processing operation...</span>
            </div>
          </TooltipProvider>
        </div>
      )}
    </TooltipProvider>
  );
}

export default TabBar;