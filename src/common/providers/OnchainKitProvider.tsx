import React, { ReactNode } from 'react';
import { OnchainKitProvider as BaseOnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';

interface OnchainKitProviderProps {
  children: ReactNode;
}

/**
 * OnchainKit provider wrapper component for Nounspace
 * 
 * This provider integrates OnchainKit from Base/Coinbase alongside
 * our existing blockchain infrastructure, allowing us to use
 * OnchainKit components without replacing our current setup.
 */
export const OnchainKitProvider: React.FC<OnchainKitProviderProps> = ({ children }) => {
  // In production, this would come from environment variables
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';

  return (
    <BaseOnchainKitProvider 
      apiKey={apiKey}
      chain={base}
    >
      {children}
    </BaseOnchainKitProvider>
  );
};
