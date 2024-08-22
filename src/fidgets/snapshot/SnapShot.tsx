// src/components/SnapShot.tsx

import React, { useState } from "react";
import { CardContent } from "@/common/components/atoms/card";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetSettingsStyle } from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import ProposalItem from "./components/ProposalItem";
import { useSnapshotProposals } from "@/common/lib/hooks/useSnapshotProposals";
import { Button } from "@/common/components/atoms/button";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

export type snapShotSettings = {
  subgraphUrl: string;
  daoContractAddress: string;
  "snapshot ens": string;
  "snapshot space": string;
} & FidgetSettingsStyle;

export const snapshotConfig: FidgetProperties = {
  fidgetName: "snapShot",
  icon: 0x26a1,
  fields: [
    {
      fieldName: "snapshot ens",
      default: "gnars.eth",
      required: true,
      inputSelector: TextInput,
    },

    ...defaultStyleFields,
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 3,
    maxWidth: 36,
  },
};

export const SnapShot: React.FC<FidgetArgs<snapShotSettings>> = ({
  settings,
}) => {
  // const [expandedProposalId, setExpandedProposalId] = useState<string | null>(
  //   null,
  // );
  const [skip, setSkip] = useState<number>(0);
  const first = 5;

  const { proposals, error } = useSnapshotProposals({
    ens: settings["snapshot ens"],
    skip,
    first,
  });
  // const { snapShotInfo } = useSnapShotInfo({
  //   ens: settings["snapshot ens"],
  // });

  // const handleToggleExpand = (proposalId: string) => {
  //   setExpandedProposalId((prevId) =>
  //     prevId === proposalId ? null : proposalId,
  //   );
  // };

  const handlePrevious = () => {
    setSkip((prevSkip) => Math.max(prevSkip - first, 0));
  };

  const handleNext = () => {
    setSkip((prevSkip) => prevSkip + first);
  };

  return (
    <CardContent className="size-full overflow-hidden p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">
        {settings["snapshot ens"]} proposals
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid gap-2 overflow-auto">
        {proposals.map((proposal) => (
          <ProposalItem
            key={proposal.id}
            proposal={proposal}
            // isExpanded={expandedProposalId === proposal.id}
            // onToggleExpand={handleToggleExpand}
            space={settings["snapshot ens"]}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <Button
          variant="primary"
          onClick={handlePrevious}
          disabled={skip === 0}
        >
          <FaAngleLeft /> Previous
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={proposals.length < first}
        >
          Next <FaAngleRight />
        </Button>
      </div>
    </CardContent>
  );
};

export default {
  fidget: SnapShot,
  properties: snapshotConfig,
} as FidgetModule<FidgetArgs<snapShotSettings>>;
