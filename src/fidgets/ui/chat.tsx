import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields, ErrorWrapper, WithMargin } from "@/fidgets/helpers";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";
import { isAddress } from "viem";

export type ChatFidgetSettings = {
  roomName: string;
  roomOwnerAddress?: string;
  size: number;
} & FidgetSettingsStyle;

const isValidEthereumAddress = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return !value;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return true;
  }

  return isAddress(trimmed);
};

const getOwnerAddressParam = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  return isAddress(trimmed) ? trimmed : undefined;
};

const frameConfig: FidgetProperties = {
  fidgetName: "Chat",
  icon: 0x1f4ac, // 💬
  mobileIcon: <BsChatDots size={20} />,
  mobileIconSelected: <BsChatDotsFill size={20} />,
  fields: [
    {
      fieldName: "roomName",
      displayName: "Room Name",
      default: "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab",
      displayNameHint: "Enter a name or contract address for the chat room",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "roomOwnerAddress",
      displayName: "Room Owner Address",
      displayNameHint:
        "When creating a new room, set the room owner by inputting the Ethereum address of the wallet they'll use to update the room. Room owners can update the room's avatar and token gate settings.",
      default: "",
      validator: isValidEthereumAddress,
      errorMessage: "Owner must be an Ethereum address",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const Chat: React.FC<
  FidgetArgs<ChatFidgetSettings> & { inEditMode: boolean }
> = ({
  settings: {
    roomName = "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab",
    roomOwnerAddress,
  },
}) => {
    // console.log("Room name:", roomName);

    if (!roomName) {
      return (
        <ErrorWrapper
          icon="➕"
          message="Provide a room name or contract address."
        />
      );
    }

    const ownerAddress = getOwnerAddressParam(roomOwnerAddress);
    const chatUrl = new URL("https://chat-fidget.vercel.app/");
    chatUrl.searchParams.set("room", roomName);

    if (ownerAddress) {
      chatUrl.searchParams.set("owner", ownerAddress);
    }

    const url = chatUrl.toString();

    return (
      <div style={{ overflow: "hidden", width: "100%" }} className="h-[calc(100dvh-220px)] md:h-full">
        <iframe
          key={`${roomName}-${ownerAddress ?? ""}`}
          src={url}
          title="Chat Fidget"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-forms allow-modals allow-cursor-lock allow-orientation-lock allow-pointer-lock allow-popups-to-escape-sandbox"
          className="size-full"
        />
      </div>
    );
  };

export default {
  fidget: Chat,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<ChatFidgetSettings>>;
