import React, { useEffect, useState } from "react";
import { CastRow } from "@/fidgets/farcaster/components/CastRow";
import { isEmpty, isString } from "lodash";
import { CastParamType } from "@neynar/nodejs-sdk";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { CastResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import type { CastEmbed } from ".";
import { bytesToHex } from "@noble/ciphers/utils";
import axiosBackend from "@/common/data/api/backend";

const EmbededCast = ({ url, castId }: CastEmbed) => {
  const [cast, setCast] = useState<CastWithInteractions | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        let res: CastResponse | null;
        if (url) {
          res = await axiosBackend.get("/api/farcaster/neynar/cast", {
            params: {
              identified: url,
              type: CastParamType.Url,
            },
          });
        } else if (castId) {
          res = await axiosBackend.get("/api/farcaster/neynar/cast", {
            params: {
              identified: isString(castId.hash)
                ? castId.hash
                : bytesToHex(castId.hash),
              type: CastParamType.Hash,
            },
          });
        } else {
          return;
        }

        if (res && res.cast) {
          setCast(res.cast);
        }
      } catch (err) {
        console.log(`Error in CastEmbed: ${err} ${url} ${castId}`);
      }
    };

    getData();
  }, []);

  if ((!url && !castId) || isEmpty(cast)) return null;

  return (
    <div
      key={`cast-embed-${url}`}
      className="border border-foreground/20 rounded-lg"
    >
      <CastRow cast={cast} showChannel isEmbed />
    </div>
  );
};

export default EmbededCast;
