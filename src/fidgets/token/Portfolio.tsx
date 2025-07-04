import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import { GiTwoCoins } from "react-icons/gi";

export type PortfolioFidgetSettings = {
  trackType: "farcaster" | "address";
  farcasterUsername: string;
  walletAddresses: string;
} & FidgetSettingsStyle;

const styleFields = defaultStyleFields.filter((field) =>
  ["fidgetBorderColor", "fidgetBorderWidth", "fidgetShadow"].includes(
    field.fieldName,
  ),
);

const portfolioProperties: FidgetProperties = {
  fidgetName: "Portfolio",
  icon: 0x1f4b0, // 💰
  mobileIcon: <GiTwoCoins size={20} />,
  fields: [
    {
      fieldName: "trackType",
      displayName: "Wallet(s) to track",
      default: "farcaster",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <SettingsSelector
            {...props}
            className="[&_label]:!normal-case"
            settings={[
              { name: "Farcaster username", value: "farcaster" },
              { name: "Wallet Address(es)", value: "address" },
            ]}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "farcasterUsername",
      displayName: "Username",
      default: "nounspacetom",
      required: false,
      disabledIf: (settings) => settings.trackType !== "farcaster",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput
            {...props}
            className="[&_label]:!normal-case"
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "walletAddresses",
      displayName: "Address(es)",
      default: "0x06AE622bF2029Db79Bdebd38F723f1f33f95F6C5",
      required: false,
      disabledIf: (settings) => settings.trackType !== "address",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput
            {...props}
            className="[&_label]:!normal-case"
          />
        </WithMargin>
      ),
      group: "settings",
    },
    ...styleFields,
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 3,
    maxWidth: 36,
  },
};

const Portfolio: React.FC<FidgetArgs<PortfolioFidgetSettings>> = ({
  settings,
}) => {
  const {
    trackType,
    farcasterUsername,
    walletAddresses,
    fidgetBorderColor,
    fidgetBorderWidth,
    fidgetShadow,
  } = settings;

  const baseUrl = "https://balance-fidget.replit.app";
  const url =
    trackType === "address"
      ? `${baseUrl}/portfolio/${encodeURIComponent(walletAddresses)}`
      : trackType === "farcaster"
        ? `${baseUrl}/fc/${encodeURIComponent(farcasterUsername)}`
        : baseUrl;

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        borderColor: fidgetBorderColor,
        borderWidth: fidgetBorderWidth,
        boxShadow: fidgetShadow,
      }}
      className="h-[calc(100dvh-220px)] md:h-full"
    >
      <iframe src={url} className="size-full" frameBorder="0" />
    </div>
  );
};

export default {
  fidget: Portfolio,
  properties: portfolioProperties,
} as FidgetModule<FidgetArgs<PortfolioFidgetSettings>>;

