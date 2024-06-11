import { isUndefined, keys, map } from "lodash";
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

type HandlerFunction<R extends NounspaceResponse> = (
  req: NextApiRequest,
  res: NextApiResponse<R>,
) => Promise<void>;

type RequestHandlerArgs<R extends NounspaceResponse> = {
  get?: HandlerFunction<R>;
  post?: HandlerFunction<R>;
  patch?: HandlerFunction<R>;
  delete?: HandlerFunction<R>;
  put?: HandlerFunction<R>;
};

export default async function requestHandler<R extends NounspaceResponse>(
  args: RequestHandlerArgs<R>,
) {
  const allowedMethods = map(keys(args), (m) => m.toUpperCase());

  return async (req: NextApiRequest, res: NextApiResponse<R>) => {
    const method = req.method ? args[req.method.toLowerCase()] : undefined;

    if (!isUndefined(method)) {
      return method(req, res);
    } else {
      res.status(405).json({
        result: "error",
        error: {
          message: `Allowed methods: ${allowedMethods}`,
        },
      } as R);
    }
  };
}
