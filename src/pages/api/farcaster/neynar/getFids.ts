import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { CastParamType } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { isAxiosError } from "axios";
import { isString } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";


async function getUsernamesAndFidsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const usernames = Array.isArray(req.query.usernames)
    ? req.query.usernames
    : typeof req.query.usernames === "string"
    ? req.query.usernames.split(",")
    : [];

  if (!usernames.length) {
    return res.status(400).json({ error: "Missing or invalid usernames parameter" });
  }

  try {
    const fetchedMentions = await Promise.all(
      usernames.map((username) =>
        neynar.lookupUserByUsername(username)
      )
    );

    const mentionsWithFids = fetchedMentions
      .filter((mention) => mention?.result?.user?.username && mention?.result?.user?.fid)
      .map((mention) => ({
        username: mention.result.user.username,
        fid: mention.result.user.fid.toString(),
      }));

    res.status(200).json(mentionsWithFids);
  } catch (e) {
    if (isAxiosError(e)) {
      res
        .status(e.response?.status || 500)
        .json(e.response?.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

// // Default export for API route
export default requestHandler({
  get: getUsernamesAndFidsHandler,
});