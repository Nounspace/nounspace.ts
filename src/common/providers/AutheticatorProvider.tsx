import React from "react";

import { useAppStore } from "../data/stores";
import { AuthenticatorManagerProvider } from "@/authenticators/AuthenticatorManager";

const AuthenticatorProvider = ({ children }: { children: React.ReactNode }) => {
  const { authenticatorConfig, saveAuthenticatorConfig } = useAppStore(
    (state) => ({
      authenticatorConfig: state.account.authenticatorConfig,
      saveAuthenticatorConfig: state.account.saveAuthenticatorConfig,
    }),
  );

  return (
    <AuthenticatorManagerProvider
      authenticatorConfig={authenticatorConfig}
      saveAuthenticatorConfig={saveAuthenticatorConfig}
    >
      {children}
    </AuthenticatorManagerProvider>
  );
};

export default AuthenticatorProvider;
