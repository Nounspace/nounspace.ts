import { NeynarUser } from "@/pages/api/farcaster/neynar/user";
import { useState, useEffect } from "react";

export const useNeynarUser = (username: string | undefined) => {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchUser = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/farcaster/neynar/user?username=${username}`,
          { signal: abortController.signal },
        );
        const data = await response.json();
        if (!data) {
          setError("No user found for username " + username);
          return;
        }

        setUser(data.user);
        setError(null);
      } catch (err: any) {
        if (!abortController.signal.aborted) {
          setError("Error fetching user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      abortController.abort();
    };
  }, [username]);

  return { user, error, isLoading };
};
