import SuccessDynamicLayout from "@nouns/components/SuccessDynamicLayout";
import BridgeToBaseDialog from "@nouns/components/dialog/BridgeToBaseDialog";
import { FRAME_SERVER_URL } from "@nouns/utils/constants";

export default async function DepositSuccessPage(props: {
  params: Promise<{ txHash: string; nounId: string }>;
}) {
  const params = await props.params;
  return (
    <SuccessDynamicLayout
      frameUrl={`${FRAME_SERVER_URL}/deposit/1/${params.nounId}/${params.txHash}`}
      title="Converted!"
      subtitle={`You deposited Noun ${params.nounId} for 1,000,000 $nouns! Let everyone know your old Noun is available for swapping!`}
      socialShareCopy={`I just deposited Noun ${params.nounId} for 1,000,000 $nouns on Nouns.com!\n\nNoun ${params.nounId} is now available for swapping!`}
      secondaryButton={<BridgeToBaseDialog />}
    />
  );
}
