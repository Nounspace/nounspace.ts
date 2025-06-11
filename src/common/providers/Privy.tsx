"use client";
import React from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";

const privyConfig: PrivyClientConfig = {
  // Customize Privy's appearance in your app
  appearance: {
    theme: "light",
    accentColor: "#676FFF",
  },
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
};

export default function Privy({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_API_KEY;
  
  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_API_KEY is not set");
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  );
}
