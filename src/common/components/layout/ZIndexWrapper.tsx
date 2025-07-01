import React from 'react';
import { useZIndex } from '@/common/lib/hooks/useZIndex';
import { type ZIndexLevel } from '@/common/constants/zIndex';
import { mergeClasses } from '@/common/lib/utils/mergeClasses';

interface ZIndexWrapperProps {
  /** Z-index level to be applied */
  level: ZIndexLevel;
  /** HTML element to be rendered (default: 'div') */
  as?: keyof JSX.IntrinsicElements;
  /** Additional CSS classes */
  className?: string;
  /** Component children */
  children: React.ReactNode;
  /** Additional props passed to the element */
  [key: string]: any;
}

/**
 * 
 * @example
 * // Side navigation
 * <ZIndexWrapper level="INTERFACE" className="sidebar">
 *   <Navigation />
 * </ZIndexWrapper>
 * 
 * @example
 * // Modal
 * <ZIndexWrapper level="OVERLAY" className="modal">
 *   <Modal />
 * </ZIndexWrapper>
 * 
 * @example  
 * // Tooltip
 * <ZIndexWrapper level="TOP" as="span" className="tooltip">
 *   Tooltip content
 * </ZIndexWrapper>
 */
export function ZIndexWrapper({ 
  level, 
  as: Component = 'div', 
  className = '', 
  children, 
  ...props 
}: ZIndexWrapperProps) {
  const zIndex = useZIndex(level);
  
  return React.createElement(
    Component,
    {
      ...props,
      className: mergeClasses(zIndex.className, className),
    },
    children
  );
}

/** Wrapper for backgrounds and base elements */
export const BaseLayer = ({ children, ...props }: Omit<ZIndexWrapperProps, 'level'>) => (
  <ZIndexWrapper level="BASE" {...props}>{children}</ZIndexWrapper>
);

/** Wrapper for main content */
export const ContentLayer = ({ children, ...props }: Omit<ZIndexWrapperProps, 'level'>) => (
  <ZIndexWrapper level="CONTENT" {...props}>{children}</ZIndexWrapper>
);

/** Wrapper for interface elements (navigation, headers, etc.) */
export const InterfaceLayer = ({ children, ...props }: Omit<ZIndexWrapperProps, 'level'>) => (
  <ZIndexWrapper level="INTERFACE" {...props}>{children}</ZIndexWrapper>
);

/** Wrapper for modals, dropdowns, popovers */
export const OverlayLayer = ({ children, ...props }: Omit<ZIndexWrapperProps, 'level'>) => (
  <ZIndexWrapper level="OVERLAY" {...props}>{children}</ZIndexWrapper>
);

/** Wrapper for elements that should always be on top */
export const TopLayer = ({ children, ...props }: Omit<ZIndexWrapperProps, 'level'>) => (
  <ZIndexWrapper level="TOP" {...props}>{children}</ZIndexWrapper>
);
