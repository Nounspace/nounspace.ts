import { getNounById, getNounByIdUncached } from "@nouns/data/noun/getNounById";
import { Suspense } from "react";
import LoadingSpinner from "@nouns/components/LoadingSpinner";
import DynamicSwapLayout from "@nouns/components/DynamicSwapLayout";
import { isAddressEqual } from "viem";
import { CHAIN_CONFIG } from "@nouns/config";
import { InstantSwap } from "./InstantSwap";
import { SomethingWentWrong } from "@nouns/components/SomethingWentWrong";

export default async function UserNounSelectPage(props: { params: Promise<{ toNounId: string }> }) {
  const params = await props.params;
  return (
    <DynamicSwapLayout
      currentStep={1}
      numSteps={1}
      title="Create an instant swap"
      subtitle={`Select your Noun you want to swap for Noun ${params.toNounId}.`}
      backButtonHref="/"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <DataWrapper toNounId={params.toNounId} />
      </Suspense>
    </DynamicSwapLayout>
  );
}

async function DataWrapper({ toNounId }: { toNounId: string }) {
  const toNoun = await getNounByIdUncached(toNounId);

  if (!toNoun) {
    return <SomethingWentWrong message={`Noun ${toNounId} doesn't exists.`} returnHref="/" />;
  }

  if (!isAddressEqual(toNoun.owner, CHAIN_CONFIG.addresses.nounsErc20)) {
    return (
      <SomethingWentWrong message={`Noun ${toNounId} is not owned by the $nouns ERC-20 contract.`} returnHref="/" />
    );
  }

  return <InstantSwap toNoun={toNoun} />;
}
