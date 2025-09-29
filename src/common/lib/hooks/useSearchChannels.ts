import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import axios, { CancelTokenSource } from "axios";
import axiosBackend from "@/common/data/api/backend";
import { ChannelSearchResponse } from "@neynar/nodejs-sdk/build/api";

type ChannelSearchResult = {
  channels: ChannelSearchResponse["channels"];
  cursor?: string | null;
};

export type ChannelSearchReturnValue = {
  channels: ChannelSearchResponse["channels"];
  loading: boolean;
  error: string | null;
};

const useSearchChannels = (query: string | null, debounceMs: number = 300) => {
  const [results, setResults] = useState<ChannelSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRequest = useRef<CancelTokenSource | null>(null);

  const fetchResults = useCallback(
    debounce(async (q: string) => {
      if (cancelRequest.current) {
        cancelRequest.current.cancel("New channel search initiated");
      }

      cancelRequest.current = axios.CancelToken.source();

      try {
        const { data } = await axiosBackend.get<ChannelSearchResponse>(
          "/api/farcaster/neynar/search-channels",
          {
            params: {
              q,
              limit: 5,
            },
            cancelToken: cancelRequest.current.token,
          },
        );

        setResults({ channels: data.channels, cursor: data.next?.cursor });
        setLoading(false);
        setError(null);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        setError("An error occurred while searching channels");
        setLoading(false);
      }
    }, debounceMs),
    [debounceMs],
  );

  useEffect(() => {
    setError(null);
    if (query && query.trim().length > 0) {
      setLoading(true);
      fetchResults(query.trim());
    } else {
      setLoading(false);
      setResults(null);
    }
  }, [query, fetchResults]);

  return {
    channels: results?.channels ?? [],
    loading,
    error,
  };
};

export default useSearchChannels;
