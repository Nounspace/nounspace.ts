'use client';


import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import React, { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY} chain={base}>
      {children}
    </MiniKitProvider>
  );
}