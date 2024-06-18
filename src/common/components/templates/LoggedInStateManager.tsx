import { AuthenticatorManagerProvider } from "@/authenticators/AuthenticatorManager";
import React, { useEffect } from "react";
import { useAppStore } from "../../data/stores";
import { useRouter } from "next/router";
import { isUndefined } from "lodash";
import SetupCompletionManager from "./SetupCompletionManager";

type LoggedInLayoutProps = {
  children: React.ReactNode;
};

const LoggedInStateManager: React.FC<LoggedInLayoutProps> = ({ children }) => {
  const {
    currentSpaceIdentityPublicKey,
    authenticatorConfig,
    saveAuthenticatorConfig,
  } = useAppStore((state) => ({
    currentSpaceIdentityPublicKey: state.account.currentSpaceIdentityPublicKey,
    authenticatorConfig: state.account.authenticatorConfig,
    saveAuthenticatorConfig: state.account.saveAuthenticatorConfig,
  }));
  const router = useRouter();

  useEffect(() => {
    if (isUndefined(currentSpaceIdentityPublicKey)) router.replace("/login");
  });

  return (
    <AuthenticatorManagerProvider
      authenticatorConfig={authenticatorConfig}
      saveAuthenticatorConfig={saveAuthenticatorConfig}
    >
      <SetupCompletionManager>{children}</SetupCompletionManager>
    </AuthenticatorManagerProvider>
  );
};

export default LoggedInStateManager;
