import React, { useRef, useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import { UserTheme } from "@/common/lib/theme";
import { MdGridView } from "react-icons/md";
import { BsImage, BsImageFill, BsFillPinFill, BsPin } from "react-icons/bs";
import { CompleteFidgets } from "@/fidgets";
import { InstallInstructionsModal } from "@/common/components/organisms/InstallInstructionsModal";
import { useMiniApp } from "@/common/utils/useMiniApp";

// Debug flag for PWA logging - only enabled in development
const DEBUG_PWA = process.env.NODE_ENV === 'development';

// Type definition for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
  fidgetType?: string; // Type of fidget for determining icons
}

interface MobileNavbarProps {
  tabs: TabItem[];
  selected: string;
  onSelect: (id: string) => void;
  theme: UserTheme;
  className?: string;
  fidgetInstanceDatums?: { [key: string]: any }; // Optional fidget data for advanced styling
  tabNames?: string[]; // Custom tab names from SpaceConfig.tabNames
  showInstallButton?: boolean; // Optional prop to show/hide install button
}

/**
 * Memoized tab item component for better performance
 */
const TabItem = React.memo(({
  tab,
  index,
  isSelected,
  activeColor,
  inactiveColor,
  onSelect,
  getTabIcon,
  getTabLabel
}: {
  tab: TabItem;
  index: number;
  isSelected: boolean;
  activeColor: string;
  inactiveColor: string;
  onSelect: (id: string) => void;
  getTabIcon: (tab: TabItem) => React.ReactNode;
  getTabLabel: (tab: TabItem, index: number) => string;
}) => {
  return (
    <TabsTrigger
      key={tab.id}
      value={tab.id}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        // If you click on the same tab, force it to reload
        if (isSelected) {
          setTimeout(() => onSelect(tab.id), 0);
        } else {
          onSelect(tab.id);
        }
      }}
      className={mergeClasses(
        "flex flex-col items-center justify-center",
        "min-w-[72px] h-full py-2 px-0",
        "font-medium text-xs",
        "data-[state=active]:shadow-none",
        "data-[state=active]:bg-transparent",
        "transition-all duration-200",
        "focus:outline-none focus-visible:outline-none",
        "active:outline-none active:ring-0",
        "select-none touch-manipulation",
        "-webkit-tap-highlight-color: transparent",
        isSelected
          ? "data-[state=active]:text-primary opacity-100"
          : "data-[state=inactive]:opacity-70 hover:opacity-90"
      )}
      style={{
        "--tw-text-opacity": 1,
        color: isSelected ? activeColor : inactiveColor,
        WebkitTapHighlightColor: "transparent",
        outline: "none",
        border: "none"
      } as React.CSSProperties}
      aria-selected={isSelected}
      role="tab"
    >
      {/* Icon (active or inactive based on selection state) */}
      <div className="text-xl mb-1">
        {getTabIcon(tab)}
      </div>

      {/* Label with truncation for long text */}
      <span className="truncate max-w-[80px] line-clamp-1">
        {getTabLabel(tab, index)}
      </span>
    </TabsTrigger>
  );
});

TabItem.displayName = 'TabItem';

/**
 * A responsive mobile navigation bar that displays as a fixed bar at the bottom of the screen
 * with scrollable tabs. Features accessibility support, theme integration, and PWA install functionality.
 * 
 * The install button is automatically hidden when:
 * - The app is already installed (standalone mode)
 * - Running in a Farcaster Mini App context (detected via @farcaster/miniapp-sdk)
 * - The app doesn't meet PWA criteria and it's not iOS
 * 
 * @param props.tabs - Array of tab items to render
 * @param props.selected - ID of the currently selected tab
 * @param props.onSelect - Callback for handling tab selection
 * @param props.theme - Theme configuration for styling
 * @param props.className - Optional additional CSS classes
 * @param props.fidgetInstanceDatums - Optional fidget data for advanced styling
 * @param props.tabNames - Optional custom tab names from SpaceConfig.tabNames
 * @param props.showInstallButton - Optional prop to show/hide install button (default: true)
 */
const MobileNavbar: React.FC<MobileNavbarProps> = ({
  tabs,
  selected,
  onSelect,
  theme,
  className,
  fidgetInstanceDatums = {},
  tabNames,
  showInstallButton = true, // Default to true to show install button
}) => {
  // Ref for the tab list container to manage scroll
  const tabsListRef = useRef<HTMLDivElement>(null);

  // State to track scroll position and gradient overlay opacity
  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false,
    leftGradientOpacity: 0,
    rightGradientOpacity: 1,
  });

  // Early return if there are no tabs
  if (!tabs || tabs.length === 0) return null;

  /**
   * Gets the appropriate display name for a tab, using custom tab names if available
   */
  const getTabLabel = useCallback((tab: TabItem, index: number): string => {
    // If tab already has a label, use it
    if (tab.label) return tab.label;

    // Special consolidated views
    if (tab.id === 'consolidated-media') return "Media";
    if (tab.id === 'consolidated-pinned') return "Pinned";

    // Use custom tab name from SpaceConfig if available
    if (tabNames && tabNames[index]) return tabNames[index];

    // If we have fidget instance data, try to get a name from there
    if (fidgetInstanceDatums && fidgetInstanceDatums[tab.id]) {
      const fidgetData = fidgetInstanceDatums[tab.id];

      // Check for custom mobile display name in settings
      if (fidgetData.config?.settings?.customMobileDisplayName) {
        return fidgetData.config.settings.customMobileDisplayName;
      }

      // Use fidget module properties
      if (fidgetData.fidgetType) {
        const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
        if (fidgetModule) {
          // Prefer mobile name if available
          return fidgetModule.properties.mobileFidgetName ||
            fidgetModule.properties.fidgetName ||
            "Tab";
        }
      }
    }

    // Default fallback
    return `Tab ${index + 1}`;
  }, [tabNames, fidgetInstanceDatums]);

  /**
   * Gets appropriate icon for a tab based on its type and selection state
   */
  const getTabIcon = useCallback((tab: TabItem): React.ReactNode => {
    // If tab already has icons defined, use them
    if (selected === tab.id && tab.activeIcon) return tab.activeIcon;
    if (tab.icon) return tab.icon;

    // Special consolidated views
    if (tab.id === 'consolidated-media') {
      return selected === tab.id ?
        <BsImageFill className="text-xl" /> :
        <BsImage className="text-xl" />;
    }

    if (tab.id === 'consolidated-pinned') {
      return selected === tab.id ?
        <BsFillPinFill size={22} /> :
        <BsPin size={22} />;
    }

    // If we have fidget instance data, try to get icon from fidget module
    if (fidgetInstanceDatums && fidgetInstanceDatums[tab.id]) {
      const fidgetData = fidgetInstanceDatums[tab.id];
      if (fidgetData.fidgetType) {
        const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
        if (fidgetModule) {
          // Use mobile-specific icons first if available
          const isSelected = selected === tab.id;
          if (isSelected && fidgetModule.properties.mobileIconSelected) {
            return fidgetModule.properties.mobileIconSelected;
          } else if (fidgetModule.properties.mobileIcon) {
            return fidgetModule.properties.mobileIcon;
          }

          // Fallback to emoji icon if available
          if (fidgetModule.properties.icon) {
            return (
              <span
                className={`text-lg`}
                role="img"
                aria-label={fidgetModule.properties.fidgetName}
              >
                {String.fromCodePoint(fidgetModule.properties.icon)}
              </span>
            );
          }
        }
      }
    }

    // Default fallback icon
    return <MdGridView className="text-xl" />;
  }, [selected, fidgetInstanceDatums]);

  // Handle scroll events to update gradient overlays
  const handleScroll = useCallback(() => {
    if (!tabsListRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;

    // Calculate maximum possible scroll distance
    const maxScroll = scrollWidth - clientWidth;

    // Define transition zone (pixels) for gradient fade effect
    const transitionThreshold = 50;

    // Calculate gradient opacities based on scroll position
    const leftGradientOpacity = Math.min(scrollLeft / transitionThreshold, 1);
    const rightGradientOpacity = Math.min((maxScroll - scrollLeft) / transitionThreshold, 1);

    // Determine if we're at the start or end of scroll area
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = maxScroll - scrollLeft <= 10;

    setScrollState({
      isAtStart,
      isAtEnd,
      leftGradientOpacity,
      rightGradientOpacity
    });
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (tabsList) {
      tabsList.addEventListener('scroll', handleScroll);
      // Initialize scroll state
      handleScroll();
    }

    return () => {
      if (tabsList) {
        tabsList.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Add keyboard navigation for tabs
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!tabs || tabs.length === 0) return;

    const currentIndex = tabs.findIndex(tab => tab.id === selected);
    if (currentIndex === -1) return;

    // Handle left/right arrow keys for tab navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); // Prevent scrolling

      let nextIndex;
      if (e.key === 'ArrowLeft') {
        // Move to previous tab or wrap to the end
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        // Move to next tab or wrap to the beginning
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }

      onSelect(tabs[nextIndex].id);

      // Ensure the selected tab is visible by scrolling if needed
      const selectedElement = tabsListRef.current?.querySelector(`[value="${tabs[nextIndex].id}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [tabs, selected, onSelect]);

  // Install Button Component for PWA functionality
  const InstallButton = React.memo(({ theme, isFloating = false }: { theme: UserTheme; isFloating?: boolean }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Use the custom hook for mini app detection
    const { isInMiniApp, isLoading: isMiniAppLoading, error: miniAppError } = useMiniApp();

    useEffect(() => {
      // Log mini app detection results
      if (DEBUG_PWA && !isMiniAppLoading) {
        console.log('🔍 Mini App detection complete:', {
          isInMiniApp,
          error: miniAppError?.message
        });
      }
      // Detect iOS devices
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(iOS);

      // Check if app is already installed (standalone mode)
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);

      // Only add event listeners if beforeinstallprompt is supported
      if ('onbeforeinstallprompt' in window) {
        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
          // Prevent the mini-infobar from appearing on mobile
          e.preventDefault();
          // Store the event so it can be triggered later
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setIsInstallable(true);
          if (DEBUG_PWA) {
            console.log('📱 beforeinstallprompt event fired!', e);
            console.log('✅ Install prompt captured and stored');
          }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        const handleAppInstalled = () => {
          setDeferredPrompt(null);
          setIsInstallable(false);
          setIsStandalone(true);
          if (DEBUG_PWA) {
            console.log('🎉 App installed successfully!');
          }
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Development/testing fallback - show button after 3 seconds if no prompt fired
        const devFallbackTimer = setTimeout(() => {
          if (!deferredPrompt && !iOS && !standalone) {
            setIsInstallable(true);
            if (DEBUG_PWA) {
              console.log('⏰ Dev fallback: Showing install button for testing (no prompt received yet)');
            }
          }
        }, 3000);

        return () => {
          clearTimeout(devFallbackTimer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
        };
      } else if (iOS && !standalone) {
        // For iOS, show install button even without beforeinstallprompt
        setIsInstallable(true);
        if (DEBUG_PWA) {
          console.log('📱 iOS detected, showing manual install option');
        }
      }
    }, []);

    const handleInstallClick = async () => {
      if (isIOS) {
        // For iOS, show modal with instructions
        setShowModal(true);
        return;
      }

      if (!deferredPrompt) {
        // If no deferred prompt available, show fallback modal
        setShowModal(true);
        if (DEBUG_PWA) {
          console.log('⚠️ No install prompt available yet');
        }
        return;
      }

      try {
        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (DEBUG_PWA) {
          console.log(`User response to the install prompt: ${outcome}`);
        }

        // Reset the deferred prompt variable
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        if (DEBUG_PWA) {
          console.error('Error showing install prompt:', error);
        }
        // Show modal with error information
        setShowModal(true);
      }
    };

    // Don't show the button if app is already installed
    if (isStandalone) {
      if (DEBUG_PWA) {
        console.log('🚫 Install button hidden: App already installed (standalone mode)');
      }
      return null;
    }

    // Don't render while we're still checking mini app status
    if (isMiniAppLoading) {
      if (DEBUG_PWA) {
        console.log('⏳ Install button hidden: Still checking Mini App status');
      }
      return null;
    }

    // Don't show the button if we're in a Mini App context
    if (isInMiniApp === true) {
      if (DEBUG_PWA) {
        console.log('🚫 Install button hidden: Running in Mini App context');
      }
      return null;
    }

    // Additional check: if we're in an iframe or embedded context, likely a mini app
    if (typeof window !== 'undefined' && window.self !== window.top) {
      if (DEBUG_PWA) {
        console.log('🚫 Install button hidden: Running in iframe/embedded context');
      }
      return null;
    }

    // Don't show if not installable (except on iOS) and we've confirmed not in mini app
    if (!isInstallable && !isIOS && isInMiniApp === false) {
      if (DEBUG_PWA) {
        console.log('🚫 Install button hidden: Not installable and not iOS', {
          isInstallable,
          isIOS,
          deferredPrompt: !!deferredPrompt
        });
      }
      return null;
    }

    if (DEBUG_PWA) {
      console.log('✅ Install button showing:', {
        isFloating,
        isInstallable,
        isIOS,
        isStandalone,
        isInMiniApp,
        isMiniAppLoading,
        hasDeferredPrompt: !!deferredPrompt
      });
    }

    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={false} // Always enabled for better UX - handle cases in click handler
          data-testid="pwa-install-button"
          data-floating={isFloating}
          data-installable={isInstallable}
          data-ios={isIOS}
          data-standalone={isStandalone}
          data-in-miniapp={isInMiniApp}
          data-miniapp-loading={isMiniAppLoading}
          data-has-prompt={!!deferredPrompt}
          className={mergeClasses(
            "flex flex-col items-center justify-center",
            isFloating
              ? "w-16 h-16 rounded-full shadow-lg border border-gray-200"
              : "min-w-[94px] h-full py-2 px-1",
            "font-medium text-xs",
            "transition-all duration-200",
            "focus:outline-none focus-visible:outline-none",
            "active:outline-none active:ring-0",
            "select-none touch-manipulation",
            "-webkit-tap-highlight-color: transparent",
            deferredPrompt ? "opacity-90 hover:opacity-100" : "opacity-60 hover:opacity-80",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          style={{
            color: theme?.properties?.headingsFontColor || "#000000",
            backgroundColor: isFloating ? (theme?.properties?.background || "white") : "transparent",
            WebkitTapHighlightColor: "transparent",
          } as React.CSSProperties}
          aria-label={isIOS ? "Install App Instructions" : "Install App"}
          title={deferredPrompt ? "Install App" : "Install prompt not ready yet"}
        >
          {/* Install icon */}
          <div className={isFloating ? "text-lg" : "text-xl mb-1"}>
            <span role="img" aria-label="install">📱</span>
          </div>

          {/* Label - only show when not floating */}

          <span className="truncate max-w-[80px] line-clamp-1">
            Install
          </span>

        </button>

        {/* Install Instructions Modal */}
        <InstallInstructionsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          theme={theme}
          isIOS={isIOS}
        />
      </>
    );
  });

  InstallButton.displayName = 'InstallButton';

  // Get theme colors for active tab indicators
  const activeColor = theme?.properties?.headingsFontColor || "#000000";
  const inactiveColor = "rgba(107, 114, 128, 0.7)"; // text-gray-500 with some opacity

  // Debug logging for showInstallButton prop
  if (DEBUG_PWA) {
    console.log('🔧 MobileNavbar Debug:', {
      showInstallButton,
      tabsCount: tabs.length,
      selectedTab: selected
    });
  }

  return (
    <Tabs
      value={selected}
      onValueChange={onSelect}
      className={mergeClasses(
        "fixed bottom-0 left-0 right-0 w-full h-[72px] bg-white border-t border-gray-200 z-30",
        className
      )}
      style={{
        backgroundColor: theme?.properties?.background || "white",
        borderColor: theme?.properties?.fidgetBorderColor || "rgb(229 231 235)",
      }}
    >
      <div
        className="relative w-full h-full"
        onKeyDown={handleKeyDown} // Add keyboard navigation to the container
      >
        {/* Left gradient overlay for scroll indication */}
        <div
          className="absolute left-0 top-0 bottom-0 w-8 h-full z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${theme?.properties?.background || "white"}, transparent)`,
            opacity: scrollState.leftGradientOpacity,
            transition: 'opacity 0.3s ease'
          }}
        />

        <TabsList
          ref={tabsListRef}
          className={mergeClasses(
            "flex items-center justify-start w-full h-full overflow-x-auto no-scrollbar rounded-none",
            "px-2" // Add some padding for better spacing
          )}
          role="tablist" // Ensure ARIA role is set
          aria-label="Mobile Navigation Tabs"
        >
          {tabs.map((tab, index) => (
            <TabItem
              key={tab.id}
              tab={tab}
              index={index}
              isSelected={selected === tab.id}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              onSelect={onSelect}
              getTabIcon={getTabIcon}
              getTabLabel={getTabLabel}
            />
          ))}
        </TabsList>

        {/* Right gradient overlay for scroll indication */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 h-full z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${theme?.properties?.background || "white"}, transparent)`,
            opacity: scrollState.rightGradientOpacity,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Floating install button when there are many tabs - positioned to avoid gradient conflict */}
        {showInstallButton && (
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 z-20">
            <InstallButton theme={theme} isFloating={true} />
          </div>
        )}
      </div>
    </Tabs>
  );
};

export default MobileNavbar;
