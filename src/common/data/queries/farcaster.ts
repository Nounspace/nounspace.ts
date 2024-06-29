import { BulkUsersResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useQuery } from "@tanstack/react-query";
import axiosBackend from "../api/backend";

export const useLoadFarcasterUser = (fid: number) => {
  return useQuery({
    queryKey: ["user", fid],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      if (fid === -1) {
        return {
          users: [],
        };
      }
      const { data } = await axiosBackend.get<BulkUsersResponse>(
        "/api/farcaster/neynar/users",
        {
          params: {
            fids: fid,
          },
        },
      );
      return data;
    },
  });
};
