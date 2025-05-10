import React from 'react';
import { LayoutFidgetProps, LayoutFidgetConfig } from '@/common/fidgets';

type DesktopViewProps = LayoutFidgetProps<LayoutFidgetConfig<any>>;

/**
 * DesktopView component that handles desktop layout for Space
 * Acts as a wrapper for the Grid layout component
 */
const DesktopView: React.FC<DesktopViewProps> = (props) => {
  // Import the grid layout dynamically to avoid circular dependencies
  const GridLayout = require('@/fidgets/layout/grid').default;
  
  return <GridLayout {...props} />;
};

export default DesktopView;
