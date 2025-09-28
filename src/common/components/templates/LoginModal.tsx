"use client";
import { useAppStore } from "@/common/data/stores/app";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import React, { useEffect, useMemo, useState } from "react";
import { SetupStep } from "@/common/data/stores/app/setup";
import LoadingScreen from "../organisms/LoadingScreen";
import Spinner from "../atoms/spinner";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import Modal from "@/common/components/molecules/Modal";
import { MiniKit } from "@worldcoin/minikit-js";
import WorldLoginButton from "@/common/auth/WorldLoginButton";
const LoginModal = ({
  open,
  setOpen,
  showClose,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  showClose: boolean;
}) => {
  const { currentStep, setCurrentStep } = useAppStore((state) => ({
    // Setup State Tracking
    currentStep: state.setup.currentStep,
    setCurrentStep: state.setup.setCurrentStep,
  }));

  const { authenticated, ready } = usePrivy();
  const { login } = useLogin({
    onComplete: (_user, isNewUser, wasAlreadyAuthenticated) => {
      if (!wasAlreadyAuthenticated) {
        if (isNewUser) {
          // redirect to the new user tutorial?
        }
      }
      setCurrentStep(SetupStep.SIGNED_IN);
    },
    onError: (error: Error) => {
      setErrored(true);
      setErrorMessage(error.message || "An error occurred during login");
    },
  });
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isWorldMiniApp, setIsWorldMiniApp] = useState(false);
  const { CurrentInitializerComponent } = useAuthenticatorManager();

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsWorldMiniApp(false);
      return;
    }
    setIsWorldMiniApp(MiniKit.isInstalled());
  }, []);

  useEffect(() => {
    if (
      currentStep === SetupStep.NOT_SIGNED_IN &&
      !authenticated &&
      ready &&
      open &&
      !isWorldMiniApp
    ) {
      login();
    }
  }, [currentStep, open, ready, authenticated, isWorldMiniApp, login]);

  const shouldShowModal = useMemo(() => {
    if (!open || currentStep === SetupStep.DONE) {
      return false;
    }

    if (isWorldMiniApp) {
      return true;
    }

    return authenticated;
  }, [authenticated, currentStep, isWorldMiniApp, open]);

  function getModalContent() {
    if (!ready) {
      return (
        <div className="self-center">
          <Spinner className="size-12" />
        </div>
      );
    }

    if (currentStep === SetupStep.NOT_SIGNED_IN) {
      if (authenticated) {
        return (
          <>
            <div className="self-center">
              <Spinner className="size-12" />
            </div>
            {errored && (
              <div className="bg-red text-white">
                An error occurred signing you in. Please try again or contact
                support if the problem persists
              </div>
            )}
          </>
        );
      }

      if (isWorldMiniApp) {
        return (
          <div className="flex flex-col gap-4">
            <WorldLoginButton
              onStart={() => {
                setErrored(false);
                setErrorMessage("");
              }}
              onError={(error: Error) => {
                setErrored(true);
                setErrorMessage(error.message || "An error occurred during login");
              }}
              onSuccess={() => {
                setErrored(false);
                setErrorMessage("");
              }}
              showError={errored}
              errorMessage={errorMessage}
              className="w-full justify-center"
            />
          </div>
        );
      }

      return authenticated ? (
        <>
          <div className="self-center">
            <Spinner className="size-12" />
          </div>
          {errored && (
            <div className="bg-red text-white">
              An error occurred signing you in. Please try again or contact
              support if the problem persists
            </div>
          )}
        </>
      ) : null;
    }

    if (currentStep === SetupStep.REQUIRED_AUTHENTICATORS_INSTALLED)
      return CurrentInitializerComponent ? (
        <CurrentInitializerComponent />
      ) : (
        "One second..."
      );

    return <LoadingScreen text={currentStep} />;
  }

  return (
    <Modal
      setOpen={setOpen}
      open={shouldShowModal}
      showClose={showClose}
    >
      {getModalContent()}
    </Modal>
  );
};

export default LoginModal;
