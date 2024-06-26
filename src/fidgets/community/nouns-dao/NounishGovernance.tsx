import React, { useState } from "react";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import type { ProposalData } from "@/fidgets/community/nouns-dao";
import useProposals from "@/fidgets/community/nouns-dao/hooks/useProposals";
import useProposal from "@/fidgets/community/nouns-dao/hooks/useProposal";
import ProposalListView from "@/fidgets/community/nouns-dao/components/ProposalListView";
import ProposalDetailView from "@/fidgets/community/nouns-dao/components/ProposalDetailView";
import { CardContent } from "@/common/components/atoms/card";

export type NounishGovernanceSettings = object;

export const nounishGovernanceConfig: FidgetProperties = {
  fidgetName: "nounish-governance",
  fields: [],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

export const NounishGovernance: React.FC<
  FidgetArgs<NounishGovernanceSettings>
> = ({ settings }) => {
  // @todo: display proposal creation and end date. The nouns api currently returns
  //   block numbers - need to convert to date by querying block time via web3 provider.
  //   The ui for this is ready, but commented out for now.
  // @todo: combine/refactor api data hooks
  const [proposalId, setProposalId] = useState<ProposalData | null>(null);
  const { proposals, loading: listLoading } = useProposals();
  const { proposal, loading: detailLoading } = useProposal(proposalId);

  return (
    <CardContent className="size-full overflow-scroll p-4">
      {proposalId ? (
        <ProposalDetailView
          proposal={proposal}
          goBack={() => setProposalId(null)}
          loading={detailLoading}
        />
      ) : (
        <ProposalListView
          proposals={proposals || []}
          setProposal={setProposalId}
          loading={listLoading}
        />
      )}
    </CardContent>
  );
};

export default {
  fidget: NounishGovernance,
  properties: nounishGovernanceConfig,
} as FidgetModule<FidgetArgs<NounishGovernanceSettings>>;
