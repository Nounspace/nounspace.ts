import { useState, useEffect } from "react";
import { isEqual } from "lodash";
import usePrevious from "@/common/lib/hooks/usePrevious";

export const useGraphqlQuery = ({
  url,
  query,
  skip,
  variables = {},
}: {
  url: string;
  query: string;
  skip?: boolean;
  variables?: object;
}): {
  data: any;
  error: string | null;
  loading: boolean;
} => {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const prevUrl = usePrevious(url);
  const prevQuery = usePrevious(query);
  const prevVariables = usePrevious(variables);

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        setError(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
      }

      setData(result?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!url || !query || skip) return;

    if (
      url !== prevUrl ||
      query !== prevQuery ||
      !isEqual(variables, prevVariables)
    ) {
      fetchData();
    }
  }, [url, query, variables, prevUrl, prevQuery, prevVariables, skip]);

  return { data, error, loading };
};

export default useGraphqlQuery;
