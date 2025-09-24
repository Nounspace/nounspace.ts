import SuccessDynamicLayout from "@nouns/components/SuccessDynamicLayout";
import { FRAME_SERVER_URL } from "@nouns/utils/constants";

export default async function DepositSuccessPage(props: {
  params: Promise<{ txHash: string; fromNounId: string; toNounId: string }>;
}) {
  const params = await props.params;
  return (
    <SuccessDynamicLayout
      frameUrl={`${FRAME_SERVER_URL}/instant-swap/1/${params.fromNounId}/${params.toNounId}/${params.txHash}`}
      title={`You own Noun ${params.toNounId}!`}
      subtitle="Share the news and let everyone know you swapped your Noun!"
      socialShareCopy={`I just swapped Noun ${params.fromNounId} for Noun ${params.toNounId} on Nouns.com!`}
    />
  );
}
