import DynamicSwapLayout from "@nouns/components/DynamicSwapLayout";
import LoadingSpinner from "@nouns/components/LoadingSpinner";
import { getNounById } from "@nouns/data/noun/getNounById";
import { Suspense } from "react";
import TreasurySwapStepTwo from "./TreasurySwapStepTwo";

export default async function TreasurySwapStepTwoPage(
  props: {
    params: Promise<{ treasuryNounId: string; userNounId: string; tipAmount: bigint }>;
  }
) {
  const params = await props.params;
  return (
    <DynamicSwapLayout
      currentStep={2}
      numSteps={2}
      title="Give a reason"
      subtitle="Share why you want this noun."
      backButtonHref={`/treasury-swap/${params.treasuryNounId}`}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DataWrapper
          treasuryNounId={params.treasuryNounId}
          userNounId={params.userNounId}
          tipAmount={params.tipAmount}
        />
      </Suspense>
    </DynamicSwapLayout>
  );
}

async function DataWrapper({
  treasuryNounId,
  userNounId,
  tipAmount,
}: {
  treasuryNounId: string;
  userNounId: string;
  tipAmount: bigint;
}) {
  const treasuryNoun = await getNounById(treasuryNounId);
  const userNoun = await getNounById(userNounId);

  if (!treasuryNoun || !userNoun) {
    return <>Nouns don{"'"}t exists!</>;
  }

  return <TreasurySwapStepTwo userNoun={userNoun} treasuryNoun={treasuryNoun} tip={tipAmount} />;
}
