import React, { useState } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";

export type ProfileFidgetSettings = {
  text: string;
};

const profileProperties: FidgetProperties = {
  fidgetName: "profile",
  icon: 0x1f464, // This is the hex code for an emoji
  fields: [
    {
      fieldName: "Bio",
      default: "Hello World!",
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const Profile: React.FC<FidgetArgs<ProfileFidgetSettings>> = ({
  settings: { text },
}) => {
  const [timesClicked, setTimesClicked] = useState(0);

  function incrementClicker() {
    setTimesClicked(timesClicked + 1);
  }

  return (
    <div className="flex flex-row h-full overflow-auto p-6">
      <div className="h-full max-h-24">
        <img
          className="aspect-square rounded-full max-h-full"
          src="https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=168/https%3A%2F%2Fi.imgur.com%2FA4R3rf7.png"
        />
      </div>
      <div className="w-4/6 flex flex-col pl-6">
        <div className="flex flex-col">
          <span className="w-full text-xl">Reality Crafter</span>
          <small className="text-slate-500">@realitycrafter.eth</small>
        </div>
        <div className="flex flex-row text-sm">
          <p className="mr-6">577 Following</p>
          <p>2247 Followers</p>
        </div>
        <p className="text-sm mt-4">
          Founder /nounspace | Founding Member /atxdao | Garbage Collector
          @trashnfts | Creating community and good vibes wherever I go.
        </p>
      </div>
    </div>
  );
};

export default {
  fidget: Profile,
  properties: profileProperties,
} as FidgetModule<FidgetArgs<ProfileFidgetSettings>>;
