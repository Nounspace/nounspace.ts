import { NotificationsResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { NounspaceResponse } from "@/common/data/api/requestHandler";
import axiosBackend from "@/common/data/api/backend";

export const useNotifications = (fid?: number | null, limit: number = 25) => {
  const fetchNotificationsPage = async ({
    pageParam: cursor,
  }): Promise<NotificationsResponse> => {
    if (!fid) {
      throw new Error("You must be logged in to view notifications.");
    }
    const { data } = await axiosBackend.get<
      NounspaceResponse<NotificationsResponse>
    >("/api/notifications", {
      params: {
        fid,
        limit,
        cursor,
      },
    });

    if (data.result === "error") {
      throw new Error(data.error?.message);
    }

    return data.value!;
  };

  return useInfiniteQuery<NotificationsResponse>({
    queryKey: ["notifications", fid, limit],
    queryFn: fetchNotificationsPage,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.next?.cursor,
    placeholderData: keepPreviousData,
  });
};

export default useNotifications;
