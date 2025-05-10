import React from 'react';
import dynamic from 'next/dynamic';
import { LayoutFidgetProps, LayoutFidgetConfig } from '@/common/fidgets';

type DesktopViewProps = LayoutFidgetProps<LayoutFidgetConfig<any>>;

// Import the grid layout dynamically to avoid circular dependencies
const GridLayout = dynamic(() => import('@/fidgets/layout/Grid'), {
  ssr: true,
});

/**
 * DesktopView component that handles desktop layout for Space
 * Acts as a wrapper for the Grid layout component
 */
const DesktopView: React.FC<DesktopViewProps> = (props) => {
  return <GridLayout {...props} />;
};

export default DesktopView;
