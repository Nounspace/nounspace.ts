import React from "react";
import { SetupStep } from "@/common/data/stores/setup";
import LoadingScreen from "../molecules/LoadingScreen";

type SetupCompletionManagerProps = {
  currentStep: SetupStep;
};

const SetupLoadingScreen: React.FC<SetupCompletionManagerProps> = ({
  currentStep,
}) => {
  return <LoadingScreen text={currentStep} />;
};

export default SetupLoadingScreen;
