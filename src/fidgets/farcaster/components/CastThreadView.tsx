import React from "react";
import Loading from "@/common/components/molecules/Loading";
import { CastRow } from "./CastRow";
import { IoArrowBack } from "react-icons/io5";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Button } from "@/common/components/atoms/button";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/api";
import { useLoadFarcasterConversation } from "@/common/data/queries/farcaster";
import { CardHeader, CardTitle } from "@/common/components/atoms/card";
import ScrollToIndex from "@/common/components/molecules/ScrollToIndex";

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

  const allCasts: any[] = [
    ...parentCasts.map((cast, idx) => ({
      cast: cast,
      key: cast.hash,
      showChannel: true,
      isFocused: false,
      isReply: idx !== 0,
      hasReplies: true,
      onSelect: onSelect,
    })),
    focusedCast && {
      cast: focusedCast,
      key: focusedCast.hash,
      showChannel: true,
      isFocused: true,
      isReply: parentCasts.length > 0,
      hasReplies: replyCasts.length > 0,
      onSelect: onSelect,
    },
    ...replyCasts.map((cast, idx) => ({
      cast: cast,
      key: cast.hash,
      showChannel: true,
      isFocused: false,
      isReply: false,
      hasReplies: false,
      onSelect: onSelect,
    })),
  ].filter((c) => c);

  return (
    <div className="flex flex-col relative h-full">
      <StickyHeader onBack={onBack} />
      {isLoading && <Loading />}
      {!isLoading && !focusedCast && "Cast not found"}
      {!isLoading && focusedCast && (
        <ScrollToIndex scrollToIndex={parentCasts.length} extraHeight={500}>
          {allCasts.map((castProps) => (
            <CastRow {...castProps} key={castProps.key} />
          ))}
        </ScrollToIndex>
      )}
    </div>
  );
};

const StickyHeader = ({ onBack }: { onBack?: () => void }) => {
  return onBack ? (
    <CardHeader className="bg-background/75 backdrop-blur-lg px-0 h-14 sticky flex-row items-center gap-2 top-0 z-10">
      <Button
        variant="ghost"
        onClick={() => onBack && onBack()}
        className="flex items-center focus:outline-none size-9 p-0 hover:bg-foreground/5 ml-1 rounded-full"
      >
        <Tooltip.Provider delayDuration={50} skipDelayDuration={0}>
          <>
            <IoArrowBack
              className="size-5 group-hover:opacity-80 stroke-2"
              aria-hidden="true"
            />
          </>
        </Tooltip.Provider>
      </Button>
      <CardTitle className="!mt-0 text-xl">Conversation</CardTitle>
    </CardHeader>
  ) : null;
};

export default CastThreadView;
