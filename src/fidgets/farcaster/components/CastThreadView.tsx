import React from "react";
import Loading from "@/common/components/molecules/Loading";
import { CastRow } from "./CastRow";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Button } from "@/common/components/atoms/button";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useLoadFarcasterConversation } from "@/common/data/queries/farcaster";

type CastThreadViewProps = {
  cast: { hash: string; author?: { fid: number } };
  onBack?: () => void;
  onSelect?: (hash: string) => void;
  viewerFid?: number;
};

export const CastThreadView = ({
  cast,
  onBack,
  onSelect,
  viewerFid,
}: CastThreadViewProps) => {
  const { data, isLoading } = useLoadFarcasterConversation(
    cast.hash,
    viewerFid,
  );

  const parentCasts: CastWithInteractions[] =
    data?.conversation?.chronological_parent_casts || [];
  const focusedCast: CastWithInteractions | null =
    data?.conversation?.cast || null;
  const replyCasts: CastWithInteractions[] =
    data?.conversation?.cast?.direct_replies || [];

  const renderGoBackButton = () => (
    <Button
      variant="outline"
      onClick={() => onBack && onBack()}
      className="w-20 group m-2 flex items-center px-2 py-1 shadow-sm text-sm font-medium rounded-md text-foreground/80 bg-background focus:outline-none"
    >
      <Tooltip.Provider delayDuration={50} skipDelayDuration={0}>
        <>
          <ArrowLeftIcon
            className="mr-1 h-4 w-4 text-foreground/70 group-hover:text-foreground/80"
            aria-hidden="true"
          />
          Back
        </>
      </Tooltip.Provider>
    </Button>
  );

  if (!focusedCast) {
    return "Cast not found";
  }

  return (
    <div className="flex flex-col">
      {!isLoading && onBack && renderGoBackButton()}
      {isLoading && <Loading />}
      {!isLoading && (
        <ul>
          {parentCasts.map((cast, idx) => (
            <CastRow
              cast={cast}
              key={cast.hash}
              showChannel={true}
              isFocused={false}
              isReply={idx !== 0}
              hasReplies={true}
              onSelect={onSelect}
            />
          ))}
          <CastRow
            cast={focusedCast}
            key={focusedCast.hash}
            showChannel={true}
            isFocused={true}
            isReply={parentCasts.length > 0}
            hasReplies={replyCasts.length > 0}
            onSelect={onSelect}
          />
          {replyCasts.map((cast, idx) => (
            <CastRow
              cast={cast}
              key={cast.hash}
              showChannel={true}
              isFocused={false}
              isReply={false}
              hasReplies={false}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
