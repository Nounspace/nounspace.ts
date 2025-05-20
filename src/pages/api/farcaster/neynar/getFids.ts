import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { CastParamType } from "@neynar/nodejs-sdk/build/api";
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
        neynar.lookupUserByUsername({ username })
      )
    );

    const mentionsWithFids = fetchedMentions
      .filter((mention) => mention?.user?.username && mention?.user?.fid)
      .map((mention) => ({
        username: mention.user.username,
        fid: mention.user.fid.toString(),
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