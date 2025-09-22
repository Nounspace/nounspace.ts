// Mock implementation for vaul
import React from 'react';

export const Drawer = ({ children, ...props }: any) => React.createElement('div', props, children);
export const DrawerContent = ({ children, ...props }: any) => React.createElement('div', props, children);
export const DrawerHeader = ({ children, ...props }: any) => React.createElement('div', props, children);
export const DrawerTitle = ({ children, ...props }: any) => React.createElement('h2', props, children);
export const DrawerDescription = ({ children, ...props }: any) => React.createElement('p', props, children);
export const DrawerFooter = ({ children, ...props }: any) => React.createElement('div', props, children);
export const DrawerClose = ({ children, ...props }: any) => React.createElement('button', props, children);
export const DrawerTrigger = ({ children, ...props }: any) => React.createElement('button', props, children);
export const DrawerPortal = ({ children, ...props }: any) => children;
export const DrawerOverlay = ({ children, ...props }: any) => React.createElement('div', props, children);
