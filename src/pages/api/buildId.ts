import { NextApiResponse } from "next";

export default function buildId(_, res: NextApiResponse) {
  res.status(200).json({
    buildId: process.env.NEXT_PUBLIC_VERSION,
  });
}
