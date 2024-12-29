"use client";
import React from "react";

import { useAppStore } from "../data/stores/app";
import { AuthenticatorManagerProvider } from "@/authenticators/AuthenticatorManager";
import { usePrivy } from "@privy-io/react-auth";

const AuthenticatorProvider = ({ children }: { children: React.ReactNode }) => {
  const { authenticatorConfig, saveAuthenticatorConfig, identityPublicKey } =
    useAppStore((state) => ({
      authenticatorConfig: state.account.authenticatorConfig,
      saveAuthenticatorConfig: state.account.saveAuthenticatorConfig,
      identityPublicKey: state.account.currentSpaceIdentityPublicKey,
    }));
  const { user, ready } = usePrivy();

  return (
    <AuthenticatorManagerProvider
      authenticatorConfig={authenticatorConfig}
      saveAuthenticatorConfig={saveAuthenticatorConfig}
      identityPublicKey={identityPublicKey}
      walletAddress={ready ? user?.wallet?.address : undefined}
    >
      {children}
    </AuthenticatorManagerProvider>
  );
};

export default AuthenticatorProvider;
