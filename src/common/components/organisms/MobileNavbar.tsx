import React, { useRef, useState, useEffect, useCallback } from "react";
import { TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import { UserTheme } from "@/common/lib/theme";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface MobileNavbarProps {
  tabs: TabItem[];
  selected: string;
  onSelect: (id: string) => void;
  theme: UserTheme;
  className?: string;
}

/**
 * A responsive mobile navigation bar that displays as a fixed bar at the bottom of the screen
 * with scrollable tabs. Features accessibility support and theme integration.
 */
const MobileNavbar: React.FC<MobileNavbarProps> = ({
  tabs,
  selected,
  onSelect,
  theme,
  className,
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

  // Get theme colors for active tab indicators
  const activeColor = theme.properties.headingsFontColor || "#000000";
  const inactiveColor = "rgba(107, 114, 128, 0.7)"; // text-gray-500 with some opacity

  return (
    <div 
      className={mergeClasses(
        "fixed bottom-0 left-0 right-0 w-full h-[72px] bg-white border-t border-gray-200 z-50",
        className
      )}
    >
      <div className="relative w-full h-full">
        {/* Main tab list - scrollable horizontally */}
        <TabsList 
          ref={tabsListRef}
          className={mergeClasses(
            "w-full h-full",
            "overflow-x-auto scrollbar-none",
            "flex items-center whitespace-nowrap",
            "gap-4 px-4",
            tabs.length <= 4 ? "justify-evenly" : "justify-start",
            "rounded-none"
          )}
          aria-label="Navigation tabs"
        >
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              onClick={() => onSelect(tab.id)}
              className={mergeClasses(
                "flex flex-col items-center justify-center",
                "min-w-[72px] h-full py-2 px-0",
                "font-medium text-xs",
                "data-[state=active]:shadow-none",
                "data-[state=active]:bg-transparent",
                "transition-all duration-200",
                "rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                selected === tab.id 
                  ? "data-[state=active]:text-primary opacity-100" 
                  : "data-[state=inactive]:opacity-70 hover:opacity-90"
              )}
              style={{
                "--tw-text-opacity": 1,
                color: selected === tab.id ? activeColor : inactiveColor
              } as React.CSSProperties}
              aria-selected={selected === tab.id}
              role="tab"
            >
              {/* Icon (active or inactive based on selection state) */}
              <div className="text-xl mb-1">
                {selected === tab.id && tab.activeIcon ? tab.activeIcon : tab.icon}
              </div>
              
              {/* Label with truncation for long text */}
              <span className="truncate max-w-[80px] line-clamp-1">
                {tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Left gradient overlay (shown when scrolled) */}
        {tabs.length > 4 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none transition-opacity duration-100"
            style={{
              background: 'linear-gradient(270deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 1) 100%)',
              opacity: scrollState.leftGradientOpacity
            }}
            aria-hidden="true"
          />
        )}
        
        {/* Right gradient overlay (hidden at end of scroll) */}
        {tabs.length > 4 && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none transition-opacity duration-100"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 1) 100%)',
              opacity: scrollState.rightGradientOpacity
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default MobileNavbar;
