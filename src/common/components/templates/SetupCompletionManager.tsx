import React from "react";
import Navigation from "../organisms/Navigation";
import { useAppStore } from "@/common/data/stores";

type SetupCompletionManagerProps = {
  children: React.ReactNode;
};

const SetupCompletionManager: React.FC<SetupCompletionManagerProps> = ({
  children,
}) => {
  const { currentStep, setCurrentStep, loadAuthenticators } = useAppStore(
    (state) => ({
      currentStep: state.setup.currentStep,
      setCurrentStep: state.setup.setCurrentStep,
      loadAuthenticators: state.account.loadAuthenitcators,
    }),
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--user-theme-background)" }}
    >
      <div className="container mx-auto">
        <Navigation />
        <div className="p-4 sm:ml-64">{children}</div>
      </div>
    </div>
  );
};

export default SetupCompletionManager;
