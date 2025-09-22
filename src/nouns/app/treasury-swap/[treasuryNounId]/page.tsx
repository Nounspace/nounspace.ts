import { getNounById, getNounByIdUncached } from "@nouns/data/noun/getNounById";
import { Suspense } from "react";
import LoadingSpinner from "@nouns/components/LoadingSpinner";
import DynamicSwapLayout from "@nouns/components/DynamicSwapLayout";
import { isAddressEqual } from "viem";
import { CHAIN_CONFIG } from "@nouns/config";
import TreasurySwapStepOne from "./TreasurySwapStepOne";
import { SomethingWentWrong } from "@nouns/components/SomethingWentWrong";

export default async function TreasurySwapStepOnePage(props: { params: Promise<{ chain: number; treasuryNounId: string }> }) {
  const params = await props.params;
  return (
    <DynamicSwapLayout
      currentStep={1}
      numSteps={2}
      title="Create your offer"
      subtitle="Select your Noun and tip."
      backButtonHref="/"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DataWrapper treasuryNounId={params.treasuryNounId} />
      </Suspense>
    </DynamicSwapLayout>
  );
}

async function DataWrapper({ treasuryNounId }: { treasuryNounId: string }) {
  const treasuryNoun = await getNounByIdUncached(treasuryNounId);

  if (!treasuryNoun) {
    return <SomethingWentWrong message={`Noun ${treasuryNounId} doesn't exists.`} returnHref="/" />;
  }

  if (!isAddressEqual(treasuryNoun.owner, CHAIN_CONFIG.addresses.nounsTreasury)) {
    return <SomethingWentWrong message={`Noun ${treasuryNounId} is not owned by the Nouns Treasury.`} returnHref="/" />;
  }

  return <TreasurySwapStepOne treasuryNoun={treasuryNoun} />;
}
