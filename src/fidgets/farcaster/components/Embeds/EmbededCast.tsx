import React, { useEffect, useState } from "react";
import { CastRow } from "@/fidgets/farcaster/components/CastRow";
import { isEmpty, isString } from "lodash";
import { CastParamType } from "@neynar/nodejs-sdk/build/api";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/api";
import { CastResponse } from "@neynar/nodejs-sdk/build/api";
import type { CastEmbed } from ".";
import { bytesToHex } from "@noble/ciphers/utils";
import axiosBackend from "@/common/data/api/backend";
import { AxiosResponse } from "axios";

const EmbededCast = ({ url, castId }: CastEmbed) => {
  const [cast, setCast] = useState<CastWithInteractions | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        let res: AxiosResponse<CastResponse> | null;
        if (url) {
          res = await axiosBackend.get("/api/farcaster/neynar/cast", {
            params: {
              identifier: url,
              type: CastParamType.Url,
            },
          });
        } else if (castId) {
          res = await axiosBackend.get("/api/farcaster/neynar/cast", {
            params: {
              identifier: isString(castId.hash)
                ? castId.hash
                : bytesToHex(castId.hash),
              type: CastParamType.Hash,
            },
          });
        } else {
          return;
        }

        if (res && res.data && res.data.cast) {
          setCast(res.data.cast);
        }
      } catch (err) {
        console.error(`Error in CastEmbed: ${err} ${url} ${castId}`);
      }
    };

    getData();
  }, [url, castId]);

  if ((!url && !castId) || isEmpty(cast)) return null;

  return (
    <div key={`cast-embed-${url}`} className=" flex-1 overflow-hidden">
      <CastRow cast={cast} showChannel isEmbed hideReactions />
    </div>
  );
};

export default EmbededCast;
