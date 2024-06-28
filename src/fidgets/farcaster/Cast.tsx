import React from "react";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import EmbededCast from "./components/Embeds/EmbededCast";
import { isUndefined } from "lodash";
import TextInput from "@/common/components/molecules/TextInput";

type CastFidgetSettings = {
  castHash?: string;
  casterFid?: number;
  castUrl?: string;
};

const castFidgetProperties: FidgetProperties = {
  fidgetName: "Pinned Cast",
  icon: 0x1f4ac, // 💬
  fields: [
    {
      fieldName: "castHash",
      required: false,
      inputSelector: TextInput,
    },
    {
      fieldName: "casterFid",
      required: false,
      inputSelector: TextInput,
    },
    {
      fieldName: "castUrl",
      required: false,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 1,
    maxHeight: 4,
    minWidth: 3,
    maxWidth: 12,
  },
};

const Cast: React.FC<FidgetArgs<CastFidgetSettings>> = ({
  settings: { castHash, casterFid, castUrl },
}) => {
  const castId =
    !isUndefined(castHash) && !isUndefined(casterFid)
      ? { hash: castHash, fid: casterFid }
      : undefined;

  if (isUndefined(castUrl) && isUndefined(castId)) {
    return "Must Cast URL or both Caster FID and Cast Hash";
  }

  return <EmbededCast url={castUrl} castId={castId} />;
};

const exp: FidgetModule<FidgetArgs<CastFidgetSettings>> = {
  fidget: Cast,
  properties: castFidgetProperties,
};

export default exp;
