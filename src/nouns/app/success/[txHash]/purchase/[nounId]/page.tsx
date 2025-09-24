import SuccessDynamicLayout from "@nouns/components/SuccessDynamicLayout";
import { FRAME_SERVER_URL } from "@nouns/utils/constants";

export default async function DepositSuccessPage(props: {
  params: Promise<{ txHash: string; nounId: string }>;
}) {
  const params = await props.params;
  return (
    <SuccessDynamicLayout
      frameUrl={`${FRAME_SERVER_URL}/purchase/1/${params.nounId}/${params.txHash}`}
      title={`You purchased Noun ${params.nounId}!`}
      subtitle={`Share the news and let everyone know you own  a new Noun!`}
      socialShareCopy={`I just purchased Noun ${params.nounId} on Nouns.com!`}
    />
  );
}
