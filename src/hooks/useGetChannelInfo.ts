import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { useQuery } from "@tanstack/react-query";

export const useLookupChannel = (channel: string) => {
  return useQuery({
    queryKey: ["lookupChannel", channel],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const neynarClient = new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!);

      return await neynarClient.lookupChannel(channel);
    },
  });
};
