import { Button } from "@/common/components/atoms/button";
import { CardContent } from "@/common/components/atoms/card";
import FontSelector from "@/common/components/molecules/FontSelector";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import { useSnapshotProposals } from "@/common/lib/hooks/useSnapshotProposals";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import React, { useState, useCallback, useMemo } from "react";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import ProposalItem from "./components/ProposalItem";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import { useFontStyles } from "./hooks/useFontStyles";

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
      displayNameHint:
        "Enter the ENS name of the Snapshot space (e.g. 'gnars.eth')",
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
      displayNameHint:
        "Font used for proposal titles. Select 'Theme Headings Font' to inherit from the theme.",
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
      displayNameHint:
        "Font used for proposal text. Select 'Theme Font' to inherit from the theme.",
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
  const [skip, setSkip] = useState<number>(0);
  const first = 5;

  const { proposals, error } = useSnapshotProposals({
    ens: settings.snapshotEns,
    skip,
    first,
  });

  // Use the font styles hook
  const fontStyles = useFontStyles(settings);

  // Memoize navigation handlers
  const handlePrevious = useCallback(() => {
    setSkip((prevSkip) => Math.max(prevSkip - first, 0));
  }, [first]);

  const handleNext = useCallback(() => {
    setSkip((prevSkip) => prevSkip + first);
  }, [first]);

  // Memoize disabled states
  const isPreviousDisabled = useMemo(() => skip === 0, [skip]);
  const isNextDisabled = useMemo(
    () => proposals.length < first,
    [proposals.length, first]
  );

  // Memoize the container style
  const containerStyle = useMemo(
    () => ({
      fontFamily: fontStyles.bodyFont,
      color: fontStyles.bodyColor,
    }),
    [fontStyles.bodyFont, fontStyles.bodyColor]
  );

  const headingStyle = useMemo(
    () => ({
      fontFamily: fontStyles.headingsFont,
      color: fontStyles.headingsColor,
    }),
    [fontStyles.headingsFont, fontStyles.headingsColor]
  );

  return (
    <div className="size-full">
      <CardContent className="size-full overflow-hidden p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4" style={headingStyle}>
          {settings.snapshotEns} Governance
        </h1>
        {error && (
          <p className="text-red-500" style={containerStyle}>
            {error}
          </p>
        )}
        <div className="grid gap-2 overflow-auto" style={containerStyle}>
          {proposals.map((proposal) => (
            <ProposalItem
              key={proposal.id}
              proposal={proposal}
              space={settings.snapshotEns}
              headingsFont={fontStyles.headingsFont}
              headingsColor={fontStyles.headingsColor}
              bodyFont={fontStyles.bodyFont}
              bodyColor={fontStyles.bodyColor}
            />
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="primary"
            onClick={handlePrevious}
            disabled={isPreviousDisabled}
          >
            <FaAngleLeft /> Previous
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isNextDisabled}
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
