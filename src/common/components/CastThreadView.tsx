import React, { useEffect, useMemo, useState } from "react";
import { CastType } from "@/common/constants/farcaster";
import { Loading } from "./Loading";
import { CastRow } from "./CastRow";
import { useAccountStore } from "@/stores/useAccountStore";
import NewPostEntry from "./NewPostEntry";
import { useNewPostStore } from "@/stores/useNewPostStore";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { SelectableListWithHotkeys } from "./SelectableListWithHotkeys";
import { openWindow } from "../helpers/navigation";
import { classNames } from "../helpers/css";
import HotkeyTooltipWrapper from "./HotkeyTooltipWrapper";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v1";

type CastThreadViewProps = {
  cast: { hash: string; author: { fid: string } };
  onBack?: () => void;
  fid?: string;
  isActive?: boolean;
  setSelectedCast?: (cast: CastType) => void;
  setShowReplyModal: (show: boolean) => void;
};

export const CastThreadView = ({
  cast,
  onBack,
  fid,
  isActive,
  setSelectedCast,
  setShowReplyModal,
}: CastThreadViewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [casts, setCasts] = useState<CastWithInteractions[]>([]);
  const [selectedCastIdx, setSelectedCastIdx] = useState(0);
  const [selectedCastDepth, setSelectedCastDepth] = useState(0);

  const draftIdx = useNewPostStore(
    (state) =>
      state.drafts &&
      state.drafts.findIndex((draft) => draft.parentCastId?.hash === cast?.hash)
  );
  const { drafts } = useNewPostStore();
  const draft = draftIdx !== -1 ? drafts[draftIdx] : undefined;

  const castTree = useMemo(() => {
    if (casts.length === 0) return [];

    const castTree = casts.reduce((acc, cast) => {
      if (!cast?.parentHash) {
        acc.push(cast);
      } else {
        const parentCast = casts.find((c) => c.hash === cast.parentHash);
        // console.log('found parentCast', parentCast);
        if (parentCast) {
          if (!parentCast.children) {
            parentCast.children = [];
          }
          parentCast.children.push(cast);
        }
      }
      return acc;
    }, [] as CastType[]);

    return castTree;
  }, [casts]);

  const { selectedChannelUrl } = useAccountStore();

  const { addNewPostDraft, removePostDraft } = useNewPostStore();

  useEffect(() => {
    if (!cast || casts.length === 0 || !setSelectedCast) return;

    setSelectedCast(casts[selectedCastIdx]);
  }, [cast, selectedCastIdx, casts]);

  useEffect(() => {
    if (selectedCastIdx === 0) {
      window.scrollTo(0, 0);
    } else if (selectedCastIdx === casts.length - 1) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [selectedCastIdx]);

  const renderGoBackButton = () => (
    <Button
      variant="outline"
      onClick={() => onBack && onBack()}
      className="group mt-2 md:ml-10 flex items-center px-2 py-1 shadow-sm text-sm font-medium rounded-md text-foreground/80 bg-background focus:outline-none"
    >
      <Tooltip.Provider delayDuration={50} skipDelayDuration={0}>
        <HotkeyTooltipWrapper hotkey="Esc" side="right">
          <>
            <ArrowLeftIcon
              className="mr-1 h-4 w-4 text-foreground/70 group-hover:text-foreground/80"
              aria-hidden="true"
            />
            Back
          </>
        </HotkeyTooltipWrapper>
      </Tooltip.Provider>
    </Button>
  );

  useEffect(() => {
    const loadData = async () => {
      const neynarClient = new NeynarAPIClient(
        process.env.NEXT_PUBLIC_NEYNAR_API_KEY!
      );
      const { conversation } = await neynarClient.lookupCastConversation(cast.hash, CastParamType.Hash, {replyDepth: 1, includeChronologicalParentCasts: true });
      const {direct_replies: replies, ...castObjectWithoutReplies} = conversation.cast;
      if (replies) {
        setCasts([castObjectWithoutReplies].concat(replies));
      } else {
        const castResponse = await neynarClient.lookUpCastByHash(cast.hash, {viewerFid: Number(fid)});
        setCasts([castResponse.result.cast]);
      }

      setIsLoading(false);
    };

    if (!cast) return;

    setSelectedCastIdx(0);
    loadData();
    addNewPostDraft({
      parentCastId: { hash: cast.hash, fid: cast.author.fid },
    });

    return () => {
      removePostDraft(draftIdx, true);
    };
  }, [cast?.hash]);

  const onOpenLinkInCast = () => {
    const castInThread = casts[selectedCastIdx];
    if (castInThread?.embeds?.length === 0) return;

    const url = castInThread.embeds[0].url;
    openWindow(url);
  };

  const renderRow = (
    cast: CastType & { children: CastType[] },
    idx: number,
    depth: number = 0
  ) => {
    const isRowSelected =
      selectedCastIdx === idx && selectedCastDepth === depth;

    return (
      <li
        key={`cast-thread-${cast.hash}`}
        className={classNames(idx === selectedCastIdx ? "" : "")}
      >
        <div className="relative px-4">
          {/* this is the left line */}
          {/* {idx !== casts.length - 1 ? (
            <span className="rounded-lg absolute left-12 top-10 ml-px h-[calc(100%-36px)] w-px" aria-hidden="true" />
          ) : null} */}
          <div
            className={classNames(
              "border-l-2",
              isActive && isRowSelected
                ? "border-transparent"
                : "border-transparent",
              "pl-3.5 relative flex items-start space-x-3"
            )}
          >
            <>
              <div
                className={classNames(
                  "absolute left-16 top-4 ml-1.5 w-0.5 h-[calc(100%-30px)]",
                  cast.children ? "bg-gray-600/50" : "bg-transparent"
                )}
              />
              <div className="min-w-0 flex-1">
                <CastRow
                  cast={cast}
                  showChannel={selectedChannelUrl === null}
                  isSelected={
                    selectedCastIdx === idx && selectedCastDepth === depth
                  }
                />
                {cast?.children && cast.children.length > 0 && depth < 2 && (
                  <div className={clsx(depth === 1 ? "hidden xl:block": "")}>
                    <SelectableListWithHotkeys
                      data={cast.children}
                      selectedIdx={selectedCastIdx}
                      setSelectedIdx={setSelectedCastIdx}
                      renderRow={(item: any, idx: number) =>
                        renderRow(item, idx, depth + 1)
                      }
                      onSelect={() => onOpenLinkInCast()}
                      onExpand={() => null}
                      isActive={isActive && selectedCastDepth === depth}
                      onDown={() => {
                        // if cast has children, increase depth and set select index to 0
                        // what is the current cast? we dont know
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </li>
    );
  };

  const renderFeed = () => (
    <SelectableListWithHotkeys
      data={castTree}
      selectedIdx={selectedCastIdx}
      setSelectedIdx={setSelectedCastIdx}
      renderRow={(item: any, idx: number) => renderRow(item, idx)}
      onSelect={() => onOpenLinkInCast()}
      onExpand={() => null}
      isActive={isActive}
    />
  );

  const renderReplyButton = (cast: CastType) => {
    if (!cast) return null;
    const onClick = () => {
      setSelectedCast(cast);
      setShowReplyModal(true);
    }
    return (
    <Button variant="outline" className="mt-4 ml-10 mr-4" onClick={() => onClick()}>
      Reply
      <span className="ml-3 flex-none text-xs text-gray-200 bg-gray-600 px-2 py-1 rounded-md">
        <kbd className="font-mono">r</kbd>
      </span>
    </Button>
  )
    }

  const renderThread = () => (
    <div className="flow-root">
      {renderFeed()}
      {renderReplyButton(casts[selectedCastIdx])}
      {false && draftIdx !== -1 && (
        <div
          className="mt-4 mr-4"
          key={`new-post-parentHash-${cast?.hash}`}
        >
          <NewPostEntry
            draft={draft}
            draftIdx={draftIdx}
            onPost={() => onBack && onBack()}
            hideChannel
            disableAutofocus
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col text-foreground/80 text-lg">
      {isLoading ? <Loading className="ml-4" /> : renderThread()}
      {!isLoading && onBack && (
        <div className="mb-4">{renderGoBackButton()}</div>
      )}
    </div>
  );
};
