import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { NounspaceResponse } from "@/common/data/api/requestHandler";
import {
  NotificationType,
  NotificationTypeEnum,
  NotificationsResponse,
  CastParamType,
} from "@neynar/nodejs-sdk/build/api";
import { isAxiosError } from "axios";
import { isString } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import { z, ZodSchema } from "zod";

const QuerySchema = z.object({
  fid: z.coerce.number().int(),
  limit: z.coerce.number().int().positive().max(25).default(15),
  cursor: z.string().optional(),
});

const _validateQueryParams = <T extends ZodSchema>(
  req: NextApiRequest,
  schema: T,
): [z.infer<T>, null | string] => {
  const parseResult = schema.safeParse(req.query);

  if (parseResult.success) {
    return [parseResult.data, null];
  }

  const error = parseResult.error.errors[0];
  const errorMessage = `${error.message} (${error.path.join(".")})`;
  return [parseResult.data, errorMessage];
};

const get = async (
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse<NotificationsResponse>>,
) => {
  const [{ fid, limit, cursor }, errorMessage] = _validateQueryParams(
    req,
    QuerySchema,
  );

  if (isString(errorMessage)) {
    return res.status(400).json({
      result: "error",
      error: { message: errorMessage },
    });
  }

  try {
    const data = await neynar.fetchAllNotifications({
      fid,
      limit,
      cursor,
      type: [
        NotificationType.Follows,
        NotificationType.Recasts,
        NotificationType.Likes,
        NotificationType.Mentions,
        NotificationType.Replies,
        NotificationType.Quotes,
      ],
    });

    // Neynar changed the notifications API to return dehydrated casts without
    // text or embed details. Hydrate any casts missing text so the client can
    // render notification contents properly.
    const notifications = data.notifications || [];
    const castsToFetch: Record<string, { n: number; r?: number }[]> = {};

    notifications.forEach((notification, nIndex) => {
      const cast: any = notification.cast;
      const hasText = typeof cast?.text === "string" && cast.text.length > 0;

      if (!hasText) {
        const hash = cast?.hash;
        if (hash) {
          if (!castsToFetch[hash]) {
            castsToFetch[hash] = [];
          }
          castsToFetch[hash].push({ n: nIndex });
        }
      }

      notification.reactions?.forEach((reaction, rIndex) => {
        const rCast: any = reaction.cast;
        const rHasText =
          typeof rCast?.text === "string" && rCast.text.length > 0;

        if (rHasText) {
          return;
        }

        const hash = rCast?.hash;
        if (hash) {
          if (!castsToFetch[hash]) {
            castsToFetch[hash] = [];
          }
          castsToFetch[hash].push({ n: nIndex, r: rIndex });
        }
      });
    });

    await Promise.all(
      Object.entries(castsToFetch).map(async ([hash, positions]) => {
        try {
          const { cast } = await neynar.lookupCastByHashOrWarpcastUrl({
            identifier: hash,
            type: CastParamType.Hash,
          });
          positions.forEach(({ n, r }) => {
            if (typeof r === "number") {
              notifications[n].reactions![r].cast = cast;
            } else {
              notifications[n].cast = cast;
            }
          });
        } catch (_) {
          // If hydration fails, leave the notification as-is
        }
      }),
    );

    res.status(200).json({
      result: "success",
      value: data,
    });
  } catch (e) {
    const _isAxiosError = isAxiosError(e);
    const status = (_isAxiosError && e.response!.data.status) || 500;
    const message =
      (_isAxiosError && e.response!.data.message) ||
      "An unknown error occurred";

    return res.status(status).json({
      result: "error",
      error: { message },
    });
  }
};

export default requestHandler({
  get: get,
});
