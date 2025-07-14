import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import axios, { CancelTokenSource, isAxiosError } from "axios";
import axiosBackend from "@/common/data/api/backend";
import { NounspaceResponse } from "@/common/data/api/requestHandler";

export type ChannelResult = {
  id: string;
  name: string;
  image_url: string | null;
  description?: string;
};

export type ChannelSearchReturnValue = {
  channels: ChannelResult[];
  loading: boolean;
  error: string | null;
};

const useSearchChannels = (
  query: string | null,
  debounceMs: number = 300,
): ChannelSearchReturnValue => {
  const [results, setResults] = useState<ChannelResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRequest = useRef<CancelTokenSource | null>(null);

  const fetchResults = useCallback(
    debounce(async (q: string) => {
      if (cancelRequest.current) {
        cancelRequest.current.cancel("New search initiated");
      }

      cancelRequest.current = axios.CancelToken.source();

      try {
        const response = await axiosBackend.get<
          NounspaceResponse<{ channels: ChannelResult[] }>
        >("/api/farcaster/neynar/search-channels", {
          params: {
            q,
            limit: 5,
          },
          cancelToken: cancelRequest.current.token,
        });
        setResults(response.data.value?.channels || []);
        setLoading(false);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          const errMsg = isAxiosError(err)
            ? err.response?.data?.error?.message
            : null;
          setError(errMsg || "An error occurred while searching");
          setLoading(false);
        }
      }
    }, debounceMs),
    [],
  );
  useEffect(() => {
    setError(null);
    if (query) {
      setLoading(true);
      fetchResults(query);
    }

    return () => {
      cancelRequest.current?.cancel("component unmounted");
      fetchResults.cancel();
    };
  }, [query]);

  return {
    channels: (query && results) || [],
    loading: loading,
    error: error,
  };
};

export default useSearchChannels;
