import React, { useState } from "react";
import { Properties } from "csstype";
import { mergeClasses as classNames } from "@/common/lib/utils/mergeClasses";
import {
  ArrowPathRoundedSquareIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartFilledIcon } from "@heroicons/react/24/solid";
import { localize, timeDiff } from "@/common/lib/utils/date";
import { publishReaction, removeReaction } from "@/fidgets/farcaster/utils";
import { includes, isObject, isUndefined, map, get } from "lodash";
import { ErrorBoundary } from "@sentry/react";
import { renderEmbedForUrl } from "./Embeds";
import Image from "next/image";
import {
  CastWithInteractions,
  EmbedUrl,
} from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { Button } from "@/common/components/atoms/button";
import { useFarcasterSigner } from "@/fidgets/farcaster/index";
import { CastReactionType } from "@/fidgets/farcaster/types";
import { ReactionType } from "@farcaster/core";
import { hexToBytes } from "@noble/ciphers/utils";
import CreateCast, { DraftType } from "./CreateCast";
import Modal from "@/common/components/molecules/Modal";
import Link from "next/link";
import FarcasterLinkify from "./linkify";

function isEmbedUrl(maybe: unknown): maybe is EmbedUrl {
  return isObject(maybe) && typeof maybe["url"] === "string";
}

const castTextStyle = {
  whiteSpace: "pre-wrap",
  // based on https://css-tricks.com/snippets/css/prevent-long-urls-from-breaking-out-of-container/
  /* These are technically the same, but use both */
  overflowWrap: "break-word",
  wordWrap: "break-word",

  MsWordBreak: "break-all",
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  // 'word-break': 'break-all',
  /* Instead use this non-standard one: */
  wordBreak: "break-word",

  /* Adds a hyphen where the word breaks, if supported (No Blink) */
  MsHyphens: "auto",
  MozHyphens: "auto",
  WebkitHyphens: "auto",
  hyphens: "auto",
} as Properties<string | number, string & any>;

interface CastRowProps {
  cast: CastWithInteractions & {
    inclusion_context?: {
      is_following_recaster: boolean;
      is_following_author: boolean;
    };
  };
  showChannel?: boolean;
  isThreadView?: boolean;
  isEmbed?: boolean;
  hideReactions?: boolean;
}

export const CastRow = ({
  cast,
  showChannel,
  isEmbed = false,
  isThreadView = false,
  hideReactions = false,
}: CastRowProps) => {
  const [didLike, setDidLike] = useState(false);
  const [didRecast, setDidRecast] = useState(false);

  const { signer, fid: userFid } = useFarcasterSigner("render-cast");

  const authorFid = cast.author.fid;
  const castHashBytes = hexToBytes(cast.hash.slice(2));
  const castId = {
    fid: authorFid,
    hash: castHashBytes,
  };
  const now = new Date();

  const [showModal, setShowModal] = useState(false);
  const [replyCastDraft, setReplyCastDraft] = useState<Partial<DraftType>>();
  type ReplyCastType = "reply" | "quote";
  const [replyCastType, setReplyCastType] = useState<ReplyCastType>();

  const onReply = () => {
    setReplyCastDraft({
      parentCastId: castId,
    });
    setReplyCastType("reply");
    setShowModal(true);
  };

  const onQuote = () => {
    setReplyCastDraft({
      embeds: [{ castId }],
    });
    setReplyCastType("quote");
    setShowModal(true);
  };

  const getCastReactionsObj = () => {
    const repliesCount = cast.replies?.count || 0;
    const recastsCount = cast.reactions?.recasts_count || 0;
    const likesCount = cast.reactions?.likes_count;

    const likeFids = map(cast.reactions?.likes, "fid") || [];
    const recastFids = map(cast.reactions?.recasts, "fid") || [];
    return {
      [CastReactionType.replies]: { count: repliesCount },
      [CastReactionType.recasts]: {
        count: recastsCount + Number(didRecast),
        isActive: didRecast || includes(recastFids, userFid),
      },
      [CastReactionType.likes]: {
        count: likesCount + Number(didLike),
        isActive: didLike || includes(likeFids, userFid),
      },
    };
  };

  const reactions = getCastReactionsObj();

  const getChannelForParentUrl = (
    _parentUrl: string | null,
  ): { name: string } | null => null;

  const getIconForCastReactionType = (
    reactionType: CastReactionType,
    isActive?: boolean,
  ): JSX.Element | undefined => {
    const className = classNames(
      isActive ? "text-foreground/70" : "",
      "mt-0.5 w-4 h-4 mr-1",
    );

    switch (reactionType) {
      case CastReactionType.likes:
        return isActive ? (
          <HeartFilledIcon className={className} aria-hidden="true" />
        ) : (
          <HeartIcon className={className} aria-hidden="true" />
        );
      case CastReactionType.recasts:
        return (
          <ArrowPathRoundedSquareIcon
            className={className}
            aria-hidden="true"
          />
        );
      case CastReactionType.quote:
        return (
          <ChatBubbleLeftRightIcon className={className} aria-hidden="true" />
        );
      case CastReactionType.replies:
        return <ChatBubbleLeftIcon className={className} aria-hidden="true" />;
      case CastReactionType.links:
        return (
          <ArrowTopRightOnSquareIcon className={className} aria-hidden="true" />
        );
      default:
        return undefined;
    }
  };

  const onClickReaction = async (key: CastReactionType, isActive: boolean) => {
    if (key === CastReactionType.links) {
      return;
    }

    if (key === CastReactionType.likes) {
      setDidLike(!isActive);
    } else if (key === CastReactionType.recasts) {
      setDidRecast(!isActive);
    }

    if (isUndefined(signer)) return;
    try {
      if (key === CastReactionType.replies) {
        onReply?.();
        return;
      }

      if (key === CastReactionType.quote) {
        onQuote?.();
        return;
      }

      const reactionBodyType: ReactionType =
        key === CastReactionType.likes
          ? ReactionType.LIKE
          : ReactionType.RECAST;
      const reaction = {
        type: reactionBodyType,
        target: castId,
      };
      if (isActive) {
        await removeReaction({
          authorFid: userFid,
          signer,
          reaction,
        });
      } else {
        await publishReaction({
          authorFid: userFid,
          signer,
          reaction,
        });
      }
    } catch (error) {
      console.error(`Error in onClickReaction: ${error}`);
    }
  };

  const renderReaction = (
    key: CastReactionType,
    isActive: boolean,
    count?: number | string,
    icon?: JSX.Element,
  ) => {
    return (
      <div
        key={`cast-${cast.hash}-${key}`}
        className="mt-1.5 flex align-center text-sm text-foreground/40 hover:text-foreground hover:bg-background/50 py-1 px-1.5 rounded-md"
        onClick={async (event) => {
          event.stopPropagation();
          onClickReaction(key, isActive);
        }}
      >
        {icon}
        {count !== null && <span className="">{count}</span>}
      </div>
    );
  };

  const renderCastReactions = (cast: CastWithInteractions) => {
    const linksCount = cast?.embeds ? cast.embeds.length : 0;
    const isOnchainLink =
      linksCount > 0 && "url" in cast.embeds[0]
        ? cast.embeds[0].url.startsWith("chain:")
        : false;

    return (
      <div className="-ml-1.5 flex space-x-3">
        {Object.entries(reactions).map(([key, reactionInfo]) => {
          const isActive = get(reactionInfo, "isActive", false);
          const icon = getIconForCastReactionType(
            key as CastReactionType,
            isActive,
          );
          const reaction = renderReaction(
            key as CastReactionType,
            isActive,
            reactionInfo.count,
            icon,
          );

          return reaction;
        })}
        {linksCount && !isOnchainLink ? (
          <a
            tabIndex={-1}
            href={"url" in cast.embeds[0] ? cast.embeds[0].url : "#"}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer"
          >
            {renderReaction(
              CastReactionType.links,
              linksCount > 1,
              linksCount ?? undefined,
              getIconForCastReactionType(CastReactionType.links),
            )}
          </a>
        ) : null}
        {renderReaction(
          CastReactionType.quote,
          true,
          undefined,
          getIconForCastReactionType(CastReactionType.quote),
        )}
      </div>
    );
  };

  const getText = () =>
    "text" in cast && cast.text ? (
      <FarcasterLinkify attributes={userFid}>{cast.text} </FarcasterLinkify>
    ) : null;

  const renderEmbeds = () => {
    if (!("embeds" in cast) || !cast.embeds.length) {
      return null;
    }

    return (
      <div className="mt-4 space-y-4" onClick={(e) => e.preventDefault()}>
        <ErrorBoundary>
          {map(cast.embeds, (embed) => {
            if (isEmbedUrl(embed)) {
              return (
                <div key={`cast-embed-${embed.url}`}>
                  {renderEmbedForUrl(embed)}
                </div>
              );
            }
            return (
              <div key={`cast-embed-${embed.cast_id}`}>
                {renderEmbedForUrl({ castId: embed.cast_id })}
              </div>
            );
          })}
        </ErrorBoundary>
      </div>
    );
  };

  const renderRecastBadge = () => {
    const shouldShowBadge =
      "inclusion_context" in cast &&
      cast.inclusion_context?.is_following_recaster &&
      !cast.inclusion_context?.is_following_author;

    if (!shouldShowBadge) return null;
    return (
      <span className="h-5 ml-2 inline-flex truncate items-top rounded-sm bg-gray-400/10 px-1.5 py-0.5 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/30">
        <ArrowPathRoundedSquareIcon className="h-4 w-4" />
      </span>
    );
  };

  const channel =
    showChannel && "parent_url" in cast
      ? getChannelForParentUrl(cast.parent_url)
      : null;
  const timeAgo =
    "timestamp" in cast
      ? timeDiff(now, new Date(cast.timestamp))
      : [0, "seconds"];
  const timeAgoStr = localize(Number(timeAgo[0]), timeAgo[1].toString());

  return (
    <div className="flex min-w-full w-full max-w-2xl">
      <Modal
        open={showModal}
        setOpen={setShowModal}
        focusMode
        showClose={false}
      >
        <div className="mb-4">
          {replyCastType === "reply" ? <CastRow cast={cast} isEmbed /> : null}
        </div>
        <div className="flex">
          <CreateCast initialDraft={replyCastDraft} />
        </div>
      </Modal>
      <div
        className={classNames(
          "p-3",
          "bg-foreground/10",
          "border-l-1 border-transparent",
          "lg:ml-0 grow rounded-r-sm",
        )}
      >
        {isThreadView && (
          <div className="absolute bg-foreground/10 -ml-3 mt-[1.2rem] h-[1.5px] w-6" />
        )}
        <div className="flex items-top gap-x-4">
          {!isEmbed && (
            <img
              className="relative h-10 w-10 flex-none bg-background rounded-full"
              src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_144/${cast.author.pfp_url}`}
            />
          )}
          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between gap-x-4 leading-5">
              <div className="flex flex-row">
                <Link
                  className="items-center flex font-semibold text-foreground/80 truncate cursor-pointer w-full max-w-54 lg:max-w-full"
                  href={`/s/${cast.author.username}`}
                >
                  {isEmbed && (
                    <img
                      className="relative h-4 w-4 mr-1 flex-none bg-background rounded-full"
                      src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_144/${cast.author.pfp_url}`}
                    />
                  )}
                  {cast.author.display_name}
                  <span className="hidden font-normal lg:ml-1 lg:block">
                    (@{cast.author.username})
                  </span>
                  <span>
                    {cast.author.power_badge && (
                      <Image
                        src="/images/ActiveBadge.webp"
                        className="ml-2 mt-0.5 h-[17px] w-[17px]"
                        alt="power badge"
                        width={50}
                        height={30}
                      />
                    )}
                  </span>
                </Link>
                {showChannel && channel && (
                  <Button
                    variant="outline"
                    className="h-5 ml-2 inline-flex truncate items-top rounded-sm bg-blue-400/10  hover:bg-blue-400/20 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:text-blue-600 ring-1 ring-inset ring-blue-400/30 border-none"
                  >
                    {channel.name}
                  </Button>
                )}
                {renderRecastBadge()}
              </div>
              <div className="flex flex-row">
                {"timestamp" in cast && cast.timestamp && (
                  <span className="text-sm leading-5 text-foreground/50">
                    {timeAgoStr}
                  </span>
                )}
                <a
                  href={`https://warpcast.com/${
                    cast.author.username
                  }/${cast.hash.slice(0, 10)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm leading-5 text-foreground/50"
                  tabIndex={-1}
                >
                  <ArrowTopRightOnSquareIcon className="mt-0.5 w-4 h-4 ml-1.5" />
                </a>
              </div>
            </div>
            <div
              className="mt-2 w-full max-w-xl text-md text-foreground cursor-pointer break-words lg:break-normal"
              style={castTextStyle}
            >
              {getText()}
            </div>
            {!hideReactions &&
              renderCastReactions(cast as CastWithInteractions)}
            {!isEmbed && renderEmbeds()}
          </div>
        </div>
      </div>
    </div>
  );
};
