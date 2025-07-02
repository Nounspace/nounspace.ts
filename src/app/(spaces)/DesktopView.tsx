import React, { useMemo } from 'react';
import { LayoutFidgetProps, LayoutFidgetConfig } from '@/common/fidgets';
import { LayoutFidgets } from '@/fidgets';

type DesktopViewProps = LayoutFidgetProps<LayoutFidgetConfig<any>> & {
  layoutFidgetKey?: string;
};

/**
 * DesktopView component that handles desktop layout for Space
 * Dynamically selects the appropriate layout fidget based on configuration
 */
const DesktopView: React.FC<DesktopViewProps> = ({ 
  layoutFidgetKey, 
  ...layoutProps 
}) => {
  // Select the appropriate layout fidget component
  const LayoutFidget = useMemo(() => {
    const fidgetKey = layoutFidgetKey && LayoutFidgets[layoutFidgetKey] 
      ? layoutFidgetKey 
      : "grid";
    return LayoutFidgets[fidgetKey];
  }, [layoutFidgetKey]);

  return <LayoutFidget {...layoutProps} />;
};

export default DesktopView;
