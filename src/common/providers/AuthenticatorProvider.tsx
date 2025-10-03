"use client";
import React, { useEffect } from "react";

import { useAppStore } from "../data/stores/app";
import { AuthenticatorManagerProvider } from "@/authenticators/AuthenticatorManager";
import { usePrivy } from "@privy-io/react-auth";

const AuthenticatorProvider = ({ children }: { children: React.ReactNode }) => {
  const { authenticatorConfig, saveAuthenticatorConfig, identityPublicKey, setPrivyUser } =
    useAppStore((state) => ({
      authenticatorConfig: state.account.authenticatorConfig,
      saveAuthenticatorConfig: state.account.saveAuthenticatorConfig,
      identityPublicKey: state.account.currentSpaceIdentityPublicKey,
      setPrivyUser: state.account.setPrivyUser,
    }));
  const { user, ready } = usePrivy();

  // Ensure Zustand always syncs the authenticated Privy user
  useEffect(() => {
    if (!ready) return;
    // Sync on login and clear on logout
    setPrivyUser(user ?? null);
  }, [ready, user, setPrivyUser]);

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
