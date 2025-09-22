// Mock implementation for connectkit
import React from 'react';

export const ConnectKitProvider = ({ children }: { children: React.ReactNode }) => children;
export const ConnectKitButton = ({ children, ...props }: any) => React.createElement('button', props, children);
export const useModal = () => ({
  open: () => {},
  close: () => {},
});
export const Types = {
  CustomAvatarProps: {} as any,
};

export const getDefaultConfig = (config: any) => config;

export const ConnectKit = { ConnectKitProvider, ConnectKitButton, useModal, Types, getDefaultConfig };
export default ConnectKit;
