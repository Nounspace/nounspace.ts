import React, { useEffect, useState } from "react";
import { Wallet, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import Spinner from "@/common/ui/atoms/spinner";
import { useAccountStore } from "@/common/data/stores/accounts";
import { useSignMessage } from "@/common/data/stores/accounts/privyStore";

const SETUP_STATES = {
  wallet: "Loading Wallet...",
  check: "Checking for Existing Identities...",
  load: "Loading Identity...",
  select: "Multiple Identities Found, please choose which one to use",
  create: "Creating Identity...",
  error: "An error occurred, you will be signed out, please try again",
};

export default function Setup() {
  const { ready, authenticated, user, createWallet, logout } = usePrivy();
  const { signMessage, ready: walletsReady } = useSignMessage();
  const router = useRouter();
  const {
    loadIdentitiesForWallet,
    getIdentitiesForWallet,
    createIdentityForWallet,
    decryptIdentityKeys,
    setCurrentIdentity,
  } = useAccountStore((state) => ({
    loadIdentitiesForWallet: state.loadIdentitiesForWallet,
    getIdentitiesForWallet: state.getIdentitiesForWallet,
    createIdentityForWallet: state.createIdentityForWallet,
    decryptIdentityKeys: state.decryptIdentityKeys,
    setCurrentIdentity: state.setCurrentIdentity,
  }));
  const [currentStep, setCurrentStep] = useState(SETUP_STATES.wallet);
  // const [selectedIdentity, setSelectedIdentity] = useState("");

  // Redirect if not logged in with Privy
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready]);

  async function setup(wallet: Wallet) {
    setCurrentStep(SETUP_STATES.check);
    await loadIdentitiesForWallet(wallet);
    const identities = getIdentitiesForWallet(wallet);
    if (identities.length > 0) {
      if (identities.length > 1) {
        setCurrentStep(SETUP_STATES.select);
      } else {
        setCurrentStep(SETUP_STATES.load);
        await decryptIdentityKeys(
          signMessage,
          wallet,
          identities[0].identityPublicKey,
        );
        setCurrentIdentity(identities[0].identityPublicKey);
      }
    } else {
      setCurrentStep(SETUP_STATES.create);
      const publicKey = await createIdentityForWallet(signMessage, wallet);
      setCurrentIdentity(publicKey);
    }
    router.push("/homebase");
  }

  useEffect(() => {
    // if (!isUndefined(currentSpaceIdentityPublicKey)) {
    //   router.push("/homebase");
    // }
    if (walletsReady && ready && user) {
      const wallet = user.wallet;
      if (wallet) {
        setup(wallet);
      } else {
        createWallet()
          .then((w) => setup(w))
          .catch((e) => {
            console.error(e);
            logout();
            router.push("/login");
          });
      }
    }
  }, [walletsReady, ready]);

  return (
    <div className="w-full max-w-full min-h-screen">
      <div className="relative w-full h-screen flex-col items-center grid lg:max-w-none lg:grid-cols lg:px-0">
        <div className="relative h-full flex-col bg-muted p-10 text-foreground flex">
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-900 via-gray-700 to-stone-500" />
          <div className="relative z-20 mt-16 lg:mt-24">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-4xl lg:text-2xl font-semibold tracking-tight text-gray-100">
                  One second while we setup your account...
                </h1>
              </div>
              <div className="self-center text-gray-100">{currentStep}</div>
              {currentStep !== SETUP_STATES.select ? (
                <div className="self-center">
                  <Spinner className="size-15" />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
