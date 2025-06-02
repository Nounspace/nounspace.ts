import { Button } from "@/common/components/atoms/button";
import { CardContent } from "@/common/components/atoms/card";
import FontSelector from "@/common/components/molecules/FontSelector";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import { useSnapshotProposals } from "@/common/lib/hooks/useSnapshotProposals";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import React, { useState } from "react";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import ProposalItem from "./components/ProposalItem";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";

export type SnapShotSettings = {
  subgraphUrl: string;
  daoContractAddress: string;
  snapshotEns: string;
  snapshotSpace: string;
  scale: number;
  headingsFontFamily?: string;
  fontFamily?: string;
  fontColor?: string | any;
  headingsFontColor?: string | any;
} & FidgetSettingsStyle;

export const snapshotConfig: FidgetProperties = {
  fidgetName: "SnapShot Governance",
  mobileFidgetName: "Gov",
  mobileIcon: <BsFillLightningChargeFill size={22} />,
  icon: 0x26a1,
  fields: [
    {
      fieldName: "snapshotEns",
      displayName: "Snapshot ENS",
      displayNameHint: "Enter the ENS name of the Snapshot space (e.g. 'gnars.eth')",
      default: "gnars.eth",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "headingsFontFamily",
      displayName: "Headings Font Family",
      displayNameHint: "Font used for proposal titles. Select 'Theme Headings Font' to inherit from the theme.",
      default: "Theme Headings Font",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "fontFamily",
      displayName: "Font Family",
      displayNameHint: "Font used for proposal text. Select 'Theme Font' to inherit from the theme.",
      default: "Theme Font",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <FontSelector {...props} />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "fontColor",
      displayName: "Font Color",
      displayNameHint: "Color used for proposal text.",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-font-color)"
            defaultColor="#000000"
            colorType="font color"
          />
        </WithMargin>
      ),
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      displayName: "Headings Font Color",
      displayNameHint: "Color used for headings and proposal titles.",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ThemeColorSelector
            {...props}
            themeVariable="var(--user-theme-headings-font-color)"
            defaultColor="#000000"
            colorType="headings font color"
          />
        </WithMargin>
      ),
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

export const SnapShot: React.FC<FidgetArgs<SnapShotSettings>> = ({
  settings,
}) => {
  // const [expandedProposalId, setExpandedProposalId] = useState<string | null>(
  //   null,
  // );
  const [skip, setSkip] = useState<number>(0);
  const first = 5;

  const { proposals, error } = useSnapshotProposals({
    ens: settings.snapshotEns,
    skip,
    first,
  });
  // const { snapShotInfo } = useSnapShotInfo({
  //   ens: settings.snapshotEns,
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

  const getHeadingsFontColor = () => {
    if (settings.headingsFontColor &&
      settings.headingsFontColor.toString() !== "var(--user-theme-headings-font-color)") {
      return settings.headingsFontColor;
    }

    return '#000000';
  };

  const getBodyFontColor = () => {
    if (settings.fontColor &&
      settings.fontColor.toString() !== "var(--user-theme-font-color)") {
      return settings.fontColor;
    }

    return '#333333';
  };



  return (
    <div className="size-full">
      <CardContent className="size-full overflow-hidden p-4 flex flex-col">
        <h1
          className="text-2xl font-bold mb-4"
          style={{
            fontFamily: getHeadingsFontFamily(),
            color: getHeadingsFontColor()
          }}
        >
          {settings.snapshotEns} proposals
        </h1>
        {error && <p className="text-red-500" style={{ fontFamily: getBodyFontFamily(), color: getBodyFontColor() }}>{error}</p>}
        <div
          className="grid gap-2 overflow-auto"
          style={{ fontFamily: getBodyFontFamily(), color: getBodyFontColor() }}
        >
          {proposals.map((proposal) => (
            <ProposalItem
              key={proposal.id}
              proposal={proposal}
              space={settings.snapshotEns}
              headingsFont={getHeadingsFontFamily()}
              headingsColor={getHeadingsFontColor()}
              bodyFont={getBodyFontFamily()}
              bodyColor={getBodyFontColor()}
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
} as FidgetModule<FidgetArgs<SnapShotSettings>>;
