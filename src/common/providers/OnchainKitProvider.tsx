import React, { ReactNode } from 'react';
import { OnchainKitProvider as BaseOnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';

interface OnchainKitProviderProps {
  children: ReactNode;
}

// Simple Base chain definition with minimum required properties
const baseChain = {
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
};

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
      chain={baseChain}
    >
      {children}
    </BaseOnchainKitProvider>
  );
};
