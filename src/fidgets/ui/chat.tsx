import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetModule, FidgetProperties, type FidgetSettingsStyle } from "@/common/fidgets";
import { defaultStyleFields, ErrorWrapper, WithMargin } from "@/fidgets/helpers";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";

export type ChatFidgetSettings = {
  roomName: string;
  size: number;
} & FidgetSettingsStyle;

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
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const Chat: React.FC<FidgetArgs<ChatFidgetSettings> & { inEditMode: boolean }> = ({
  settings: { roomName = "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab" },
}) => {
  // console.log("Room name:", roomName);

  if (!roomName) {
    return <ErrorWrapper icon="➕" message="Provide a room name or contract address." />;
  }

  const url = `https://chat-fidget.vercel.app/?room=${roomName}`;

  return (
    <div style={{ overflow: "hidden", width: "100%" }} className="h-[calc(100dvh-220px)] md:h-full">
      <iframe
        key={roomName} // Add key to force re-render
        src={url}
        title="Chat Fidget"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups-to-escape-sandbox"
        className="size-full"
      />
    </div>
  );
};

export default {
  fidget: Chat,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<ChatFidgetSettings>>;
