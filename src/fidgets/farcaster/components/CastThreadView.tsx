import React, { useEffect, useMemo, useState } from "react";
import Loading from "@/common/components/molecules/Loading";
import { CastRow } from "./CastRow";
import { CastList } from "./CastList";
import axiosBackend from "@/common/data/api/backend";
import { mergeClasses as classNames } from "@/common/lib/utils/mergeClasses";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Button } from "@/common/components/atoms/button";
import { CastParamType } from "@neynar/nodejs-sdk";
import {
  CastResponse,
  CastWithInteractions,
  CastWithInteractionsReplies,
  Conversation,
} from "@neynar/nodejs-sdk/build/neynar-api/v2";
import neynar from "@/common/data/api/neynar";
import { useLoadFarcasterConversation } from "@/common/data/queries/farcaster";
import { concat } from "lodash";

type CastThreadViewProps = {
  cast: { hash: string; author: { fid: number } };
  onBack?: () => void;
  isActive?: boolean;
  setSelectedCastHash: React.Dispatch<React.SetStateAction<string>>;
  viewerFid?: number;
};

export const CastThreadView = ({
  cast,
  onBack,
  isActive,
  setSelectedCastHash,
  viewerFid,
}: CastThreadViewProps) => {
  const { data, isLoading } = useLoadFarcasterConversation(
    cast.hash,
    viewerFid,
  );
  const casts = useMemo(
    () =>
      data
        ? concat(
            [data.conversation.cast],
            data.conversation.cast.direct_replies || [],
          )
        : [],
    [data],
  );

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

  const renderRow = (cast: CastWithInteractions, idx: number) => {
    return (
      <li key={`cast-thread-${cast.hash}`}>
        <div className="relative pl-4">
          {/* this is the left line */}
          <div
            className={classNames(
              idx === 0 ? "-ml-[31px]" : "border-l-2",
              "relative flex items-start border-muted",
            )}
          >
            <div
              className={classNames(
                idx === 0 ? "bg-foreground/10" : "",
                "min-w-0 flex-1",
              )}
            >
              {idx === 0 && (
                <div
                  className={classNames(
                    idx === 0 ? "bg-muted-foreground/50" : "bg-foreground/10",
                    "absolute top-8 left-[31px] h-[calc(100%-32px)] w-0.5",
                  )}
                />
              )}
              <CastRow cast={cast} showChannel isThreadView={idx > 0} />
            </div>
          </div>
        </div>
      </li>
    );
  };

  const renderFeed = () => (
    <CastList
      data={casts}
      renderRow={(item: CastWithInteractions, idx: number) =>
        renderRow(item, idx)
      }
    />
  );

  return (
    <div className="flex flex-col text-foreground/80 text-lg">
      {!isLoading && onBack && renderGoBackButton()}
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flow-root ml-4">{renderFeed()}</div>
      )}
    </div>
  );
};
