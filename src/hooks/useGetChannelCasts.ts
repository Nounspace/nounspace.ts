import { FeedType, FilterType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { useQuery } from "@tanstack/react-query";

export const useGetChannelCasts = (channel: string) => {
  return useQuery({
    queryKey: ["channelCasts", channel],
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const neynarClient = new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!);

      const feedOptions = {
        filterType: FilterType.ChannelId,
        parentUrl: undefined,
        channelId: channel,
        cursor: undefined,
        fid: Number(732),
        limit: 20,
      };

      return await neynarClient.fetchFeed(FeedType.Filter, feedOptions);
    },
  });
};
