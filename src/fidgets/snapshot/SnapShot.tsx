import { Button } from "@/common/components/atoms/button";
import { CardContent } from "@/common/components/atoms/card";
import FontSelector from "@/common/components/molecules/FontSelector";
import ImageScaleSlider from "@/common/components/molecules/ImageScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import { useSnapshotProposals } from "@/common/lib/hooks/useSnapshotProposals";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import React, { useState } from "react";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import ProposalItem from "./components/ProposalItem";

export type snapShotSettings = {
  subgraphUrl: string;
  daoContractAddress: string;
  "snapshot ens": string;
  "snapshot space": string;
  scale: number;
  headingsFontFamily?: string;
  fontFamily?: string;
} & FidgetSettingsStyle;

export const snapshotConfig: FidgetProperties = {
  fidgetName: "SnapShot Governance",
  mobileFidgetName: "Gov",
  mobileIcon: <BsFillLightningChargeFill size={22} />,
  icon: 0x26a1,
  fields: [
    {
      fieldName: "snapshot ens",
      displayName: "Snapshot ENS",
      displayNameHint: "Enter the ENS name of the Snapshot space (e.g. 'gnars.eth')",
      default: "gnars.eth",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "headingsFontFamily",
      default: "Theme Headings Font",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "font Family",
      default: "Theme Font",
      required: false,
      inputSelector: FontSelector,
      group: "style",
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

  const getHeadingsFontFamily = () => {
    return settings.headingsFontFamily === "Theme Headings Font"
      ? "var(--user-theme-headings-font)"
      : settings.headingsFontFamily || "var(--user-theme-headings-font)";
  };

  const getBodyFontFamily = () => {
    return settings.fontFamily === "Theme Font"
      ? "var(--user-theme-font)"
      : settings.fontFamily || "var(--user-theme-font)";
  };
  
  return (
    <div className="size-full" >
      <CardContent className="size-full overflow-hidden p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: getHeadingsFontFamily() }}>
          {settings["snapshot ens"]} proposals
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-2 overflow-auto" style={{ fontFamily: getBodyFontFamily() }}>
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
    </div>
  );
};

export default {
  fidget: SnapShot,
  properties: snapshotConfig,
} as FidgetModule<FidgetArgs<snapShotSettings>>;