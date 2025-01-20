import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields, ErrorWrapper } from "@/fidgets/helpers";

export type ChatFidgetSettings = {
  roomName: string;
  size: number;
} & FidgetSettingsStyle;

const frameConfig: FidgetProperties = {
  fidgetName: "Chat",
  icon: 0x1f4ac, // 💬
  fields: [
    {
      fieldName: "roomName",
      default: "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab",
      required: true,
      inputSelector: TextInput,
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
  settings: { roomName = "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab" },
}) => {
    console.log("Room name:", roomName);

    if (!roomName) {
      return (
        <ErrorWrapper
          icon="➕"
          message="Provide a room name or contract address."
        />
      );
    }

    const url = `https://chat-fidget.vercel.app/?room=${roomName}`;

    return (
      <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
        <iframe
          key={roomName} // Add key to force re-render
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
