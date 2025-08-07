import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { CastParamType } from "@neynar/nodejs-sdk/build/api";
import { isAxiosError } from "axios";
import isString from "lodash/isString";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadCast(req: NextApiRequest, res: NextApiResponse) {
  const id = isString(req.query.identifier) ? req.query.identifier : "";
  const type = isString(req.query.type)
    ? (req.query.type as CastParamType)
    : CastParamType.Hash;

  try {
    const data = await neynar.lookupCastByHashOrWarpcastUrl({
      identifier: id, 
      type
    });

    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res
        .status(e.response!.data.status || 500)
        .json(e.response!.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

export default requestHandler({
  get: loadCast,
});
