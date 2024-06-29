import { useAppStore } from "@/common/data/stores/app";
import { useLogin } from "@privy-io/react-auth";
import React, { useState } from "react";
import { Button } from "../atoms/button";
import { SetupStep } from "@/common/data/stores/app/setup";
import LoadingScreen from "../organisms/LoadingScreen";

const LoginModal = () => {
  const { currentStep } = useAppStore((state) => ({
    // Setup State Tracking
    currentStep: state.setup.currentStep,
  }));

  const { login } = useLogin({
    onComplete: (_user, isNewUser, wasAlreadyAuthenticated) => {
      if (!wasAlreadyAuthenticated) {
        if (isNewUser) {
          // redirect to the new user tutorial?
        }
      }
    },
    onError: () => {
      setErrored(true);
    },
  });
  const [errored, setErrored] = useState(false);

  if (currentStep === SetupStep.START) {
    return (
      <>
        <Button
          onClick={login}
          size="lg"
          className="p-6 text-black bg-white"
          type="button"
          variant="ghost"
        >
          {" "}
          Sign In or Create Account{" "}
        </Button>
        {errored ? (
          <div className="bg-red text-white">
            An error occurred signing you in. Please try again or contact
            support if the problem persists
          </div>
        ) : (
          <></>
        )}
      </>
    );
  }

  return <LoadingScreen text={currentStep} />;
};

export default LoginModal;
