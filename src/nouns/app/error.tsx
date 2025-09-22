"use client";
import { Button } from "@nouns/components/ui/button";
import { trackEvent } from "@nouns/data/analytics/trackEvent";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackEvent("app_error", { message: `${error}` });
  }, [error]);

  return (
    <div className="flex grow flex-col items-center justify-center gap-2 p-4 text-center">
      <h2>Ooops, something went wrong :(</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
