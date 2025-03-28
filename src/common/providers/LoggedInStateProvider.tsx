"use client";
import React, { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAppStore, useLogout } from "@/common/data/stores/app";
import { useSignMessage } from "@/common/data/stores/app/accounts/privyStore";
import { SetupStep } from "@/common/data/stores/app/setup";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { isEqual, isUndefined } from "lodash";
import requiredAuthenticators from "@/constants/requiredAuthenticators";
import { bytesToHex } from "@noble/ciphers/utils";
import LoginModal from "../components/templates/LoginModal";
import { ALCHEMY_API } from "@/constants/urls";
import { AlchemyIsHolderOfContract } from "@/pages/api/signerRequests";
import axios from "axios";
import { NOGS_CONTRACT_ADDR } from "@/constants/nogs";
import useValueHistory from "@/common/lib/hooks/useValueHistory";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";

type LoggedInLayoutProps = { children: React.ReactNode };

const LoggedInStateProvider: React.FC<LoggedInLayoutProps> = ({ children }) => {
  const { ready, authenticated, user, createWallet } = usePrivy();
  const {
    currentStep,
    setCurrentStep,
    storeLoadAuthenticators,
    loadIdentitiesForWallet,
    getIdentitiesForWallet,
    createIdentityForWallet,
    decryptIdentityKeys,
    setCurrentIdentity,
    getCurrentIdentity,
    loadPreKeys,
    loadFidsForCurrentIdentity,
    registerFidForCurrentIdentity,
    modalOpen,
    setModalOpen,
    keepModalOpen,
    // nogs
    setHasNogs,
    // wallet signatures
    isRequestingWalletSignature,
    setIsRequestingWalletSignature,
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
    loadPreKeys: state.account.loadPreKeys,
    // Authenticator Loading
    storeLoadAuthenticators: state.account.loadAuthenitcators,
    // Register FIDs for account
    loadFidsForCurrentIdentity: state.account.getFidsForCurrentIdentity,
    registerFidForCurrentIdentity: state.account.registerFidForCurrentIdentity,
    // Logout
    modalOpen: state.setup.modalOpen,
    setModalOpen: state.setup.setModalOpen,
    keepModalOpen: state.setup.keepModalOpen,
    // nogs
    setHasNogs: state.account.setHasNogs,
    // wallet signatures
    isRequestingWalletSignature: state.setup.isRequestingWalletSignature,
    setIsRequestingWalletSignature: state.setup.setIsRequestingWalletSignature,
  }));
  const { signMessage, ready: walletsReady } = useSignMessage();
  const authenticatorManager = useAuthenticatorManager();
  const logout = useLogout();
  const previousSteps = useValueHistory<SetupStep>(currentStep, 4);

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

  useEffect(() => {
    if (
      previousSteps[1] === SetupStep.WALLET_CONNECTED &&
      previousSteps[2] === SetupStep.SIGNED_IN &&
      previousSteps[3] === SetupStep.NOT_SIGNED_IN
    ) {
      analytics.track(AnalyticsEvent.CONNECT_WALLET, {
        hasNogs: previousSteps[0] === SetupStep.TOKENS_FOUND,
      });
    }
  }, [previousSteps]);

  async function loadIdentity() {
    if (walletsReady && ready && authenticated && user) {
      if (isUndefined(getCurrentIdentity())) {
        if (isRequestingWalletSignature) return;
        setIsRequestingWalletSignature(true);
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
        } finally {
          setIsRequestingWalletSignature(false);
        }
      }
      setCurrentStep(SetupStep.IDENTITY_LOADED);
    } else {
      logout();
    }
  }

  async function loadAuthenticators() {
    try {
      await loadPreKeys();
      await storeLoadAuthenticators();
      setCurrentStep(SetupStep.AUTHENTICATORS_LOADED);
    } catch (e) {
      console.error(e);
      logout();
    }
  }

  const installRequiredAuthenticators = async () => {
    await authenticatorManager.installAuthenticators(requiredAuthenticators);
    authenticatorManager.initializeAuthenticators(requiredAuthenticators);
    setCurrentStep(SetupStep.REQUIRED_AUTHENTICATORS_INSTALLED);
  };

  const registerAccounts = async () => {
    let currentIdentity = getCurrentIdentity()!;
    if (currentIdentity.associatedFids.length > 0) {
      setCurrentStep(SetupStep.ACCOUNTS_REGISTERED);
    } else {
      await loadFidsForCurrentIdentity();
      currentIdentity = getCurrentIdentity()!;
      if (currentIdentity.associatedFids.length === 0) {
        const fidResult = (await authenticatorManager.callMethod({
          requestingFidgetId: "root",
          authenticatorId: "farcaster:nounspace",
          methodName: "getAccountFid",
          isLookup: true,
        })) as { value: number };
        const publicKeyResult = (await authenticatorManager.callMethod({
          requestingFidgetId: "root",
          authenticatorId: "farcaster:nounspace",
          methodName: "getSignerPublicKey",
          isLookup: true,
        })) as { value: Uint8Array };
        const signForFid = async (messageHash) => {
          const signResult = (await authenticatorManager.callMethod(
            {
              requestingFidgetId: "root",
              authenticatorId: "farcaster:nounspace",
              methodName: "signMessage",
              isLookup: false,
            },
            messageHash,
          )) as { value: Uint8Array };
          return signResult.value;
        };
        await registerFidForCurrentIdentity(
          fidResult.value,
          bytesToHex(publicKeyResult.value),
          signForFid,
        );
      }
    }
    setCurrentStep(SetupStep.ACCOUNTS_REGISTERED);
  };

  // Has to be separate otherwise will cause retrigger chain
  // due to depence on authenticatorManager
  useEffect(() => {
    if (
      ready &&
      walletsReady &&
      authenticated &&
      currentStep === SetupStep.REQUIRED_AUTHENTICATORS_INSTALLED
    ) {
      Promise.resolve(authenticatorManager.getInitializedAuthenticators()).then(
        (initializedAuthNames) => {
          const initializedAuthenticators = new Set(initializedAuthNames);
          const requiredAuthSet = new Set(requiredAuthenticators);
          if (isEqual(initializedAuthenticators, requiredAuthSet)) {
            setCurrentStep(SetupStep.AUTHENTICATORS_INITIALIZED);
          }
        },
      );
    }
  }, [
    ready,
    currentStep,
    authenticated,
    authenticatorManager.lastUpdatedAt,
    walletsReady,
  ]);

  useEffect(() => {
    if (ready && authenticated) {
      if (
        currentStep === SetupStep.NOT_SIGNED_IN ||
        currentStep === SetupStep.UNINITIALIZED
      ) {
        setCurrentStep(SetupStep.SIGNED_IN);
      } else if (walletsReady) {
        if (currentStep === SetupStep.SIGNED_IN) {
          loadWallet();
        } else if (currentStep === SetupStep.WALLET_CONNECTED) {
          checkForNogs();
        } else if (currentStep === SetupStep.TOKENS_FOUND) {
          loadIdentity();
        } else if (currentStep === SetupStep.IDENTITY_LOADED) {
          loadAuthenticators();
        } else if (currentStep === SetupStep.AUTHENTICATORS_LOADED) {
          installRequiredAuthenticators();
        } else if (currentStep === SetupStep.AUTHENTICATORS_INITIALIZED) {
          registerAccounts();
        } else if (currentStep === SetupStep.ACCOUNTS_REGISTERED) {
          setModalOpen(false);
          setCurrentStep(SetupStep.DONE);
        }
      }
    } else if (
      ready &&
      !authenticated &&
      currentStep !== SetupStep.NOT_SIGNED_IN
    ) {
      setCurrentStep(SetupStep.NOT_SIGNED_IN);
    }
  }, [currentStep, walletsReady, ready, authenticated]);

  async function isHoldingNogs(address): Promise<boolean> {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    try {
      const { data } = await axios.get<AlchemyIsHolderOfContract>(
        `${ALCHEMY_API("base")}nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/isHolderOfContract`,
        {
          params: {
            wallet: address,
            contractAddress: NOGS_CONTRACT_ADDR,
          },
        },
      );
      return data.isHolderOfContract;
    } catch {
      return false;
    }
  }

  async function checkForNogs() {
    if (user && user.wallet) {
      setHasNogs(await isHoldingNogs(user.wallet.address));
      setCurrentStep(SetupStep.TOKENS_FOUND);
    }
  }

  return (
    <>
      <LoginModal
        open={modalOpen}
        setOpen={setModalOpen}
        showClose={!keepModalOpen}
      />
      {children}
    </>
  );
};

export default LoggedInStateProvider;
