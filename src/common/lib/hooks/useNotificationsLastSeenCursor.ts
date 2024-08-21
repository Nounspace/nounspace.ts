import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  keepPreviousData,
  skipToken,
  useQueryClient,
} from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";
import {
  GetLastSeenNotificationCursorResponse,
  PostLastSeenNotificationCursorResponse,
} from "@/pages/api/notifications/lastSeenCursor";
import { signSignable, Signable } from "@/common/lib/signedFiles";
import { useAppStore } from "@/common/data/stores/app";
import { find } from "lodash";
import { SpaceIdentity } from "@/common/data/stores/app/accounts/identityStore";

const _queryKey = (
  fid?: number | null,
  identityPublicKey?: string | null,
): any[] => {
  return ["notificationsLastSeenCursor", fid, identityPublicKey];
};

const useCurrentSpaceIdentity = (): SpaceIdentity | undefined => {
  return useAppStore((state) => {
    return find(state.account.spaceIdentities, {
      rootKeys: { publicKey: state.account.currentSpaceIdentityPublicKey },
    });
  });
};

export const useNotificationsLastSeenCursor = (
  fid?: number | null,
  identityPublicKey?: string | null,
) => {
  const fetchNotificationsLastSeenCursor = useCallback(async () => {
    const { data } =
      await axiosBackend.get<GetLastSeenNotificationCursorResponse>(
        "/api/notifications/lastSeenCursor",
        {
          params: {
            fid,
            identityPublicKey,
          },
        },
      );

    if (data.result === "error") {
      throw new Error(data.error?.message);
    }

    return data.value!.lastSeenTimestamp;
  }, [fid, identityPublicKey]);

  const skip = !fid || !identityPublicKey;

  return useQuery({
    queryKey: _queryKey(fid, identityPublicKey),
    queryFn: skip ? skipToken : fetchNotificationsLastSeenCursor,
    placeholderData: keepPreviousData,
  });
};

export const useMutateNotificationsLastSeenCursor = (
  fid?: number | null,
  identityPublicKey?: string | null,
) => {
  const queryClient = useQueryClient();
  const spaceIdentity = useCurrentSpaceIdentity();

  const mutationFn = useCallback(
    async ({ lastSeenTimestamp }: { lastSeenTimestamp: string }) => {
      if (!spaceIdentity) {
        throw new Error("Invalid request");
      }

      const signedRequestData: Signable = signSignable(
        {
          fid,
          identityPublicKey,
          lastSeenTimestamp,
        },
        spaceIdentity.rootKeys.privateKey,
      );

      const { data } =
        await axiosBackend.post<PostLastSeenNotificationCursorResponse>(
          "/api/notifications/lastSeenCursor",
          signedRequestData,
        );

      if (data.result === "error") {
        throw new Error(data.error?.message);
      }

      return data.value!.lastSeenTimestamp;
    },
    [fid, identityPublicKey, spaceIdentity],
  );

  const onSuccess = useCallback(
    (data: string | null) => {
      queryClient.setQueryData(_queryKey(fid, identityPublicKey), data);
    },
    [fid, identityPublicKey, queryClient],
  );

  return useMutation({
    mutationFn: mutationFn,
    onSuccess: onSuccess,
  });
};

export default useNotificationsLastSeenCursor;
