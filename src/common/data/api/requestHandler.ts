import { NextApiRequest, NextApiResponse } from "next/types";

type ResponseError = {
  message?: string;
};

export type NounspaceResponse<
  D = any,
  E extends ResponseError = ResponseError,
> = {
  result: "success" | "error";
  error?: E;
  value?: D;
};

export default async function requestHandler<R extends NounspaceResponse>(
  handlePost: (req: NextApiRequest, res: NextApiResponse<R>) => Promise<void>,
  handleGet: (req: NextApiRequest, res: NextApiResponse<R>) => Promise<void>,
) {
  return async (req: NextApiRequest, res: NextApiResponse<R>) => {
    if (req.method === "POST") {
      return handlePost(req, res);
    } else if (req.method === "GET") {
      return handleGet(req, res);
    } else {
      res.status(405).json({
        result: "error",
        error: {
          message: "Only GET and POST are allowed",
        },
      } as R);
    }
  };
}
