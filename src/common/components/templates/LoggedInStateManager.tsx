import React, { useEffect } from "react";
import { useRouter } from "next/router";
import SetupLoadingScreen from "../organisms/SetupLoadingScreen";
import { usePrivy } from "@privy-io/react-auth";
import { useAppStore } from "@/common/data/stores";
import { useSignMessage } from "@/common/data/stores/accounts/privyStore";
import { SetupStep } from "@/common/data/stores/setup";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { isUndefined } from "lodash";

type LoggedInLayoutProps = {
  children: React.ReactNode;
};

const LoggedInStateManager: React.FC<LoggedInLayoutProps> = ({ children }) => {
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout: privyLogout,
    createWallet,
  } = usePrivy();
  const {
    currentStep,
    setCurrentStep,
    storeLoadAuthenticators,
    loadIdentitiesForWallet,
    getIdentitiesForWallet,
    createIdentityForWallet,
    decryptIdentityKeys,
    setCurrentIdentity,
    storeLogout,
    getCurrentIdentity,
  } = useAppStore((state) => ({
    // Setup State Tracking
    currentStep: state.setup.currentStep,
    setCurrentStep: state.setup.setCurrentStep,
    // Identity Loading
    loadIdentitiesForWallet: state.account.loadIdentitiesForWallet,
    getIdentitiesForWallet: state.account.getIdentitiesForWallet,
    createIdentityForWallet: state.account.createIdentityForWallet,
    decryptIdentityKeys: state.account.decryptIdentityKeys,
    setCurrentIdentity: state.account.setCurrentIdentity,
    getCurrentIdentity: state.account.getCurrentIdentity,
    // Authenticator Loading
    storeLoadAuthenticators: state.account.loadAuthenitcators,
    // Logout
    storeLogout: state.account.logout,
  }));
  const { signMessage, ready: walletsReady } = useSignMessage();
  const authenticatorManager = useAuthenticatorManager();

  function logout() {
    if (authenticated) privyLogout();
    storeLogout();
    router.push("/login");
  }

  async function loadWallet() {
    if (walletsReady && ready && authenticated && user) {
      try {
        if (isUndefined(user.wallet)) await createWallet();
        setCurrentStep(SetupStep.WALLET_CONNECTED);
      } catch (e) {
        console.error(e);
        logout();
      }
    } else {
      logout();
    }
  }

  async function loadIdentity() {
    if (walletsReady && ready && authenticated && user) {
      if (isUndefined(getCurrentIdentity())) {
        const wallet = user.wallet!;
        await loadIdentitiesForWallet(wallet);
        const identities = getIdentitiesForWallet(wallet);
        try {
          if (identities.length > 0) {
            await decryptIdentityKeys(
              signMessage,
              wallet,
              identities[0].identityPublicKey,
            );
            setCurrentIdentity(identities[0].identityPublicKey);
          } else {
            const publicKey = await createIdentityForWallet(
              signMessage,
              wallet,
            );
            setCurrentIdentity(publicKey);
          }
        } catch (e) {
          console.error(e);
          logout();
          return;
        }
      }
      setCurrentStep(SetupStep.IDENTITY_LOADED);
    } else {
      logout();
    }
  }

  async function loadAuthenticators() {
    try {
      await storeLoadAuthenticators();
      setCurrentStep(SetupStep.AUTHENTICATORS_LOADED);
    } catch (e) {
      console.error(e);
      logout();
    }
  }

  async function installRequiredAuthenticators() {
    console.log(authenticatorManager.installedAuthenticators());
  }

  async function registerAccounts() {}

  useEffect(() => {
    if (ready) {
      if (!authenticated) logout();
      else if (walletsReady) {
        switch (currentStep) {
          case SetupStep.START:
            loadWallet();
            break;
          case SetupStep.WALLET_CONNECTED:
            loadIdentity();
            break;
          case SetupStep.IDENTITY_LOADED:
            loadAuthenticators();
            break;
          case SetupStep.AUTHENTICATORS_LOADED:
            installRequiredAuthenticators();
            break;
          case SetupStep.REQUIRED_AUTHENTICATORS_INSTALLED:
            registerAccounts();
            break;
          case SetupStep.ACCOUNTS_REGISTERED:
            setCurrentStep(SetupStep.DONE);
            break;
        }
      }
    }
  }, [currentStep, walletsReady, ready, authenticated]);

  return (
    <>
      {currentStep !== SetupStep.DONE ? (
        <SetupLoadingScreen currentStep={currentStep} />
      ) : (
        children
      )}
    </>
  );
};

export default LoggedInStateManager;
