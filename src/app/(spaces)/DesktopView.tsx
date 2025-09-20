import { LayoutFidgetConfig, LayoutFidgetProps } from '@/common/fidgets';
import { LayoutFidgets } from '@/fidgets';
import React from 'react';

type DesktopViewProps = LayoutFidgetProps<LayoutFidgetConfig<any>> & {
  layoutFidgetKey?: string;
};

// Pick which layout component to use
const useLayoutFidgetSelector = (layoutFidgetKey?: string) => {
  // Use the specified layout, or fall back to grid
  const fidgetKey = layoutFidgetKey && LayoutFidgets[layoutFidgetKey] 
    ? layoutFidgetKey 
    : "grid";
  
  return LayoutFidgets[fidgetKey];
};

/**
 * DesktopView component that handles desktop layout for Space
 * Dynamically selects the appropriate layout fidget based on configuration
 */
const DesktopView: React.FC<DesktopViewProps> = ({ 
  layoutFidgetKey, 
  ...layoutProps 
}) => {

  // Get the right layout component
  const LayoutFidget = useLayoutFidgetSelector(layoutFidgetKey);


  return <LayoutFidget {...layoutProps} />;
};

export default DesktopView;
