import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { CastParamType } from "@neynar/nodejs-sdk";
import { isAxiosError } from "axios";
import { isString } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadConversation(req: NextApiRequest, res: NextApiResponse) {
  const id = isString(req.query.identifier) ? req.query.identifier : "";
  const type = isString(req.query.type)
    ? (req.query.type as CastParamType)
    : CastParamType.Hash;

  try {
    const data = await neynar.lookupCastConversation(id, type, {
      ...req.query,
    });

    res.status(200).json(data);
  } catch (e) {
    console.log(e);
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
  get: loadConversation,
});
