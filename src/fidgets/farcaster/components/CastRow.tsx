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
  onSelect?: () => void;
  showChannel?: boolean;
  isThreadView?: boolean;
  isEmbed?: boolean;
  hideReactions?: boolean;
}

const CastLeftAvatar = ({ isEmbed, cast }) => {
  return (
    !isEmbed && (
      <img
        className="relative h-10 w-10 flex-none bg-background rounded-full object-cover"
        src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_144/${cast.author.pfp_url}`}
      />
    )
  );
};

const CastEmbeds = ({ cast }) => {
  if (!("embeds" in cast) || !cast.embeds.length) {
    return null;
  }

  return (
    <div
      className="mt-4 space-y-4 border rounded-xl flex justify-center overflow-hidden max-h-72"
      onClick={(e) => e.preventDefault()}
    >
      <ErrorBoundary>
        {map(cast.embeds, (embed) => {
          if (isEmbedUrl(embed))
            return renderEmbedForUrl({ ...embed, key: embed.url });
          return renderEmbedForUrl({
            castId: embed.cast_id,
            key: embed.cast_id,
          });
        })}
      </ErrorBoundary>
    </div>
  );
};

const CastBody = ({
  cast,
  channel,
  isEmbed,
  showChannel,
  castTextStyle,
  hideReactions,
  renderRecastBadge,
  renderCastReactions,
  userFid,
}) => {
  return (
    <div className="flex flex-col grow">
      <CastAuthorAttribution
        cast={cast}
        renderRecastBadge={renderRecastBadge}
        channel={channel}
        showChannel={showChannel}
        isEmbed={isEmbed}
      />
      {cast.text && (
        <FarcasterLinkify attributes={userFid}>
          <p
            className="leading-[1.3] text-left max-h-96 overflow-y-auto"
            style={castTextStyle}
          >
            {cast.text}
          </p>
        </FarcasterLinkify>
      )}
      {!isEmbed && <CastEmbeds cast={cast} />}
      {!hideReactions && renderCastReactions(cast as CastWithInteractions)}
    </div>
  );
};

const CastAuthorAttribution = ({
  cast,
  renderRecastBadge,
  channel,
  showChannel,
  isEmbed,
}) => {
  const now = new Date();

  const timeAgo =
    "timestamp" in cast
      ? timeDiff(now, new Date(cast.timestamp))
      : [0, "seconds"];

  const timeAgoStr = localize(Number(timeAgo[0]), timeAgo[1].toString());

  return (
    <div className="flex flex-row justify-between gap-x-4 leading-6 tracking-tight leading-[1.3]">
      <div className="flex flex-row">
        <Link
          className="items-center flex font-bold text-foreground/80 truncate cursor-pointer gap-1"
          href={`/s/${cast.author.username}`}
        >
          {isEmbed && (
            <img
              className="relative h-4 w-4 mr-1 flex-none bg-background rounded-full"
              src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_144/${cast.author.pfp_url}`}
            />
          )}
          {cast.author.display_name}
          <span>
            {cast.author.power_badge && (
              <Image
                src="/images/ActiveBadge.webp"
                className="mt-0.5 size-4"
                alt="power badge"
                width={50}
                height={30}
              />
            )}
          </span>
          <span className="font-normal">@{cast.author.username}</span>
          <span> · </span>
          <div className="flex flex-row">
            {"timestamp" in cast && cast.timestamp && (
              <span className="font-normal">{timeAgoStr} </span>
            )}
          </div>
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
    </div>
  );
};

export const CastRow = ({
  cast,
  showChannel,
  onSelect,
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

    if (isUndefined(signer)) return console.error("NO SIGNER");
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
        targetCastId: castId,
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
        {cast.channel && cast.channel.name && (
          <div
            key={`cast-${cast.hash}-channel-name`}
            className="mt-1.5 flex align-center text-sm text-foreground/40 py-1 px-1.5 rounded-md"
          >
            /{cast.channel.name}
          </div>
        )}
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

  return (
    <div className="[&:not(:last-child)]:border-b">
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
      <div onClick={onSelect}>
        <div className="p-3">
          <div className="flex items-top gap-x-2">
            <CastLeftAvatar isEmbed={isEmbed} cast={cast} />
            <CastBody
              cast={cast}
              channel={channel}
              isEmbed={isEmbed}
              showChannel={showChannel}
              castTextStyle={castTextStyle}
              hideReactions={hideReactions}
              renderRecastBadge={renderRecastBadge}
              renderCastReactions={renderCastReactions}
              userFid={userFid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
