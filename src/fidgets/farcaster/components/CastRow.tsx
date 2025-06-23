"use client"

import { Avatar, AvatarImage } from "@/common/components/atoms/avatar";
import ExpandableText from "@/common/components/molecules/ExpandableText";
import Modal from "@/common/components/molecules/Modal";
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";
import { useAppStore } from "@/common/data/stores/app";
import { formatTimeAgo } from "@/common/lib/utils/date";
import { mergeClasses as classNames } from "@/common/lib/utils/mergeClasses";
import { useFarcasterSigner } from "@/fidgets/farcaster/index";
import { CastReactionType } from "@/fidgets/farcaster/types";
import { publishReaction, removeReaction } from "@/fidgets/farcaster/utils";
import { ReactionType } from "@farcaster/core";
import {
  ArrowPathRoundedSquareIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartFilledIcon } from "@heroicons/react/24/solid";
import {
  CastWithInteractions,
  EmbedUrl,
  User,
} from "@neynar/nodejs-sdk/build/api";
import { hexToBytes } from "@noble/ciphers/utils";
import { ErrorBoundary } from "@sentry/react";
import { Properties } from "csstype";
import { get, includes, isObject, isUndefined, map } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { FaReply } from "react-icons/fa6";
import { IoMdShare } from "react-icons/io";
import CreateCast, { DraftType } from "./CreateCast";
import { renderEmbedForUrl, type CastEmbed } from "./Embeds";
import FarcasterLinkify from "./linkify";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";
import { useToastStore } from "@/common/data/stores/toastStore";

function isEmbedUrl(maybe: unknown): maybe is EmbedUrl {
  return isObject(maybe) && typeof maybe["url"] === "string";
}

const defaultCastTextStyle = {
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
  onSelect?: (hash: string, username: string) => void;
  isFocused?: boolean;
  isEmbed?: boolean;
  isReply?: boolean;
  hasReplies?: boolean;
  showChannel?: boolean;
  hideReactions?: boolean;
  className?: string;
  castTextStyle?: any;
  maxLines?: number;
  hideEmbeds?: boolean;
  replyingToUsername?: string;
}

export const PriorityLink = ({ children, href, ...props }) => {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(href);
    },
    [href],
  );

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
};

export const CastAvatar = ({
  user,
  className,
}: {
  user: User;
  className?: string;
}) => {
  return (
    <PriorityLink className="cursor-pointer h-fit" href={`/s/${user.username}`}>
      <Avatar
        className={classNames(
          "size-10 flex-none bg-background hover:brightness-[90%] transition duration-300 ease-out",
          className,
        )}
      >
        <AvatarImage
          src={`${user.pfp_url}`}
          alt={user?.display_name}
          className="object-cover"
        />
      </Avatar>
    </PriorityLink>
  );
};

interface CastEmbedsProps {
  cast: CastWithInteractions;
  onSelectCast: (hash: string, username: string) => void;
}

const CastEmbedsComponent = ({ cast, onSelectCast }: CastEmbedsProps) => {
  if (!("embeds" in cast) || !cast.embeds.length) {
    return null;
  }

  return (
    <ErrorBoundary>
      {map(cast.embeds, (embed, i) => {
        const embedData: CastEmbed = isEmbedUrl(embed)
          ? {
            url: embed.url,
            key: embed.url,
          }
          : {
            castId: embed.cast_id,
            key: embed.cast_id?.hash?.toString() || '',
          };

        return (
          <div
            key={i}
            className={classNames(
              "mt-4 gap-y-4 border border-foreground/15 rounded-xl flex justify-center items-center overflow-hidden max-h-[500px] w-full bg-background/50",
              embedData.castId ? "max-w-[100%]" : "max-w-max",
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (embedData?.castId?.hash) {
                const hashString = typeof embedData.castId.hash === 'string' 
                  ? embedData.castId.hash 
                  : Buffer.from(embedData.castId.hash).toString('hex');
                onSelectCast(hashString, cast.author.username);
              }
            }}
          >
            {renderEmbedForUrl(embedData, false)}
          </div>
        );
      })}
    </ErrorBoundary>
  );
};

const CastEmbeds = React.memo(CastEmbedsComponent);
CastEmbeds.displayName = 'CastEmbeds';

const CastAttributionHeader = ({
  cast,
  inline,
  avatar,
  isReply,
}: {
  cast: CastWithInteractions;
  inline: boolean;
  avatar: boolean;
  isReply: boolean;
}) => {
  return (
    <div className="flex justify-start w-full gap-x-2">
      {isReply && avatar && !inline && (
        <ThreadConnector className="h-[8px] top-0 left-[31px]" />
      )}
      {avatar && (
        <CastAvatar
          user={cast.author}
          className={inline ? "size-5" : "size-10"}
        />
      )}
      <div
        className={classNames(
          "flex gap-x-1 truncate flex-wrap",
          inline ? "flex-row mb-0.5" : "flex-col",
        )}
      >
        <CastAttributionPrimary cast={cast} />
        <CastAttributionSecondary cast={cast} />
      </div>
    </div>
  );
};

const CastAttributionPrimary = ({ cast }) => {
  if (!cast?.author?.display_name) return null;

  return (
    <div className="flex items-center justify-start font-bold opacity-80 cursor-pointer gap-1 tracking-tight leading-[1.3] truncate flex-auto">
      <PriorityLink
        href={`/s/${cast.author.username}`}
        className="cursor-pointer truncate"
      >
        <span className="hover:underline">{cast.author.display_name}</span>
      </PriorityLink>
      {cast?.author?.power_badge && (
        <Image
          src="/images/ActiveBadge.webp"
          className="size-4"
          alt="power badge"
          width={50}
          height={30}
        />
      )}
    </div>
  );
};

const CastAttributionSecondary = ({ cast }) => {
  const relativeDateString = useMemo(() => {
    return cast?.timestamp ? formatTimeAgo(cast.timestamp) : "";
  }, [cast?.timestamp]);

  return (
    <div className="flex items-center justify-start tracking-tight leading-[1.3] truncate gap-1 opacity-60 font-normal">
      <span className="truncate">@{cast.author.username}</span>
      {relativeDateString && (
        <>
          <span className="font-normal"> · </span>
          <span className="">{relativeDateString}</span>
        </>
      )}
    </div>
  );
};

const CastReactions = ({ cast }: { cast: CastWithInteractions }) => {
  const [didLike, setDidLike] = useState(
    cast.viewer_context?.liked ?? false,
  );
  const [didRecast, setDidRecast] = useState(
    cast.viewer_context?.recasted ?? false,
  );
  const { signer, fid: userFid } = useFarcasterSigner("render-cast");
  const { showToast } = useToastStore();
  const { setModalOpen, getIsAccountReady } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
    getIsAccountReady: state.getIsAccountReady,
  }));

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

  const getReactions = () => {
    const repliesCount = cast.replies?.count || 0;
    const recastsCount = cast.reactions?.recasts_count || 0;
    const likesCount = cast.reactions?.likes_count || 0;

    const likeFids = map(cast.reactions?.likes, "fid") || [];
    const recastFids = map(cast.reactions?.recasts, "fid") || [];

    const viewerLiked = cast.viewer_context?.liked ?? false;
    const viewerRecasted = cast.viewer_context?.recasted ?? false;

    return {
      [CastReactionType.likes]: {
        count: likesCount + (!viewerLiked ? Number(didLike) : 0),
        isActive:
          didLike ||
          viewerLiked ||
          includes(likeFids, userFid),
      },
      [CastReactionType.recasts]: {
        count: recastsCount + (!viewerRecasted ? Number(didRecast) : 0),
        isActive:
          didRecast ||
          viewerRecasted ||
          includes(recastFids, userFid),
      },
      [CastReactionType.replies]: { count: repliesCount },
    };
  };

  const onClickReaction = async (key: CastReactionType, isActive: boolean) => {
    if (key === CastReactionType.links) {
      return;
    }

    if (!getIsAccountReady()) {
      setModalOpen(true);
      return;
    }

    // We check if we have the signer before proceeding
    if (isUndefined(signer)) {
      console.error("NO SIGNER");
      return;
    }

    try {
      if (key === CastReactionType.replies) {
        onReply?.();
        return;
      }

      if (key === CastReactionType.quote) {
        onQuote?.();
        return;
      }

      // We only perform analytics and state modification actions
      // when we are sure that we can proceed
      if (key === CastReactionType.likes) {
        trackAnalyticsEvent(AnalyticsEvent.LIKE, {
          username: cast.author.username,
          castId: cast.hash,
        });
        setDidLike(!isActive);
      } else if (key === CastReactionType.recasts) {
        trackAnalyticsEvent(AnalyticsEvent.RECAST, {
          username: cast.author.username,
          castId: cast.hash,
        });
        setDidRecast(!isActive);
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
        className="mt-1.5 flex align-center cursor-pointer text-sm opacity-50 hover:text-foreground/85 hover:bg-background/85 py-1 px-1.5 rounded-md"
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

  const onReply = () => {
    if (!getIsAccountReady()) {
      setModalOpen(true);
      return;
    }
    trackAnalyticsEvent(AnalyticsEvent.REPLY, {
      username: cast.author.username,
      castId: cast.hash,
    });

    // Clean the hash by removing the "0x" prefix if present
    const cleanedHash = cast.hash.startsWith("0x")
      ? cast.hash.slice(2)
      : cast.hash;

    // Convert the hex string to Uint8Array
    const parentCastHash = hexToBytes(cleanedHash);

    // Check for invalid length and prevent submission if necessary
    if (parentCastHash.length !== 20) {
      console.error(
        "Hash must be 20 bytes, but received length:",
        parentCastHash.length,
      );
      return;
    }

    setReplyCastDraft({
      parentCastId: { fid: cast.author.fid, hash: parentCastHash },
    });
    setReplyCastType("reply");
    setShowModal(true);
  };

  const onQuote = () => {
    if (!getIsAccountReady()) {
      setModalOpen(true);
      return;
    }
    trackAnalyticsEvent(AnalyticsEvent.RECAST, {
      username: cast.author.username,
      castId: cast.hash,
    });
    setReplyCastDraft({
      embeds: [{ castId }],
    });
    setReplyCastType("quote");
    setShowModal(true);
  };

  const reactions = getReactions();

  // const linksCount = cast?.embeds ? cast.embeds.length : 0;

  // const isOnchainLink =
  //   linksCount > 0 && "url" in cast.embeds[0]
  //     ? cast.embeds[0].url.startsWith("chain:")
  //     : false;

  return (
    <>
      <Modal
        open={showModal}
        setOpen={setShowModal}
        focusMode
        showClose={false}
      >
        <div className="mb-4">
          {replyCastType === "reply" ? <CastRowExport cast={cast} isEmbed /> : null}
        </div>
        <div className="flex">
          <CreateCast initialDraft={replyCastDraft} />
        </div>
      </Modal>
      <div className="-ml-1.5 flex items-center space-x-3 w-full">
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

        {/* Commented out this button to "Open cast in a new tab" until we add that functionality*/}

        {/* {linksCount && !isOnchainLink ? (
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
        ) : null} */}
        {renderReaction(
          CastReactionType.quote,
          true,
          undefined,
          getIconForCastReactionType(CastReactionType.quote),
        )}
        {cast.channel && cast.channel.name && (
          <div
            key={`cast-${cast.hash}-channel-name`}
            className="mt-1.5 flex align-center text-sm opacity-40 py-1 px-1.5 rounded-md"
          >
            /{cast.channel.name}
          </div>
        )}
        <div
          className="ml-auto mt-1.5 flex cursor-pointer text-sm opacity-50 hover:text-foreground/85 hover:bg-background/85 py-1 px-1.5 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            const url = `${window.location.origin}/homebase/c/${cast.author.username}/${cast.hash}`;
            navigator.clipboard.writeText(url);
            showToast("Link copied", 2000);
          }}
        >
          <IoMdShare className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    </>
  );
};

interface CastBodyProps {
  cast: CastWithInteractions;
  channel?: { name: string } | null;
  isEmbed?: boolean;
  showChannel?: boolean;
  castTextStyle?: any;
  hideReactions?: boolean;
  renderRecastBadge?: () => React.ReactNode;
  userFid?: number;
  isDetailView?: boolean;
  onSelectCast?: (hash: string, username: string) => void;
  maxLines?: number;
  hideEmbeds?: boolean;
}

const CastBodyComponent = ({
  cast,
  channel,
  isEmbed,
  showChannel,
  castTextStyle,
  hideReactions,
  renderRecastBadge,
  userFid,
  isDetailView,
  onSelectCast,
  maxLines = 0,
  hideEmbeds = false,
}: CastBodyProps) => {
  const handleSelectCast = useCallback((hash: string, username: string) => {
    if (onSelectCast) {
      onSelectCast(hash, username);
    }
  }, [onSelectCast]);
  
  return (
    <div className="flex flex-col grow">
      {cast.text && (
        <FarcasterLinkify attributes={userFid}>
          <p
            className={
              isDetailView ? "text-lg leading-[1.3]" : "text-base leading-[1.3]"
            }
            style={castTextStyle}
          >
            <ExpandableText maxLines={maxLines || (isDetailView ? null : 10)}>
              {React.createElement('span', {}, cast.text)}
            </ExpandableText>
          </p>
        </FarcasterLinkify>
      )}
      {!isEmbed && !hideEmbeds && (
        <CastEmbeds cast={cast} onSelectCast={handleSelectCast} />
      )}
      {!hideReactions && <CastReactions cast={cast} />}
    </div>
  );
};

export const CastBody = React.memo(CastBodyComponent);
CastBody.displayName = 'CastBody';


const ThreadConnector = ({ className }) => {
  return (
    <div
      className={classNames("absolute w-[2px] bg-border flex-1", className)}
    />
  );
};

const CastLeftGutter = ({ cast, connectTop, connectBottom }) => {
  return (
    <div className="flex flex-0 justify-center top-0 bottom-0">
      {connectTop && <ThreadConnector className="top-0 h-[4px]" />}
      <CastAvatar user={cast.author} className="size-10" />
      {connectBottom && (
        <ThreadConnector className="bottom-0 h-[calc(100%-60px)]" />
      )}
    </div>
  );
};

const getIconForCastReactionType = (
  reactionType: CastReactionType,
  isActive?: boolean,
): JSX.Element | undefined => {
  const baseColor = isActive
    ? reactionType === CastReactionType.likes
      ? "text-red-500"
      : reactionType === CastReactionType.recasts
        ? "text-green-500"
        : "text-foreground"
    : "text-foreground/70";
  const className = classNames("mt-0.5 w-4 h-4 mr-1", baseColor);

  switch (reactionType) {
    case CastReactionType.likes:
      return isActive ? (
        <HeartFilledIcon className={className} aria-hidden="true" />
      ) : (
        <HeartIcon className={className} aria-hidden="true" />
      );
    case CastReactionType.recasts:
      return (
        <ArrowPathRoundedSquareIcon className={className} aria-hidden="true" />
      );
    case CastReactionType.quote:
      return (
        <ChatBubbleLeftRightIcon className={className} aria-hidden="true" />
      );
    case CastReactionType.replies:
      return <FaReply className={className} aria-hidden="true" />;
    case CastReactionType.links:
      return (
        <ArrowTopRightOnSquareIcon className={className} aria-hidden="true" />
      );
    default:
      return undefined;
  }
};

const CastRowComponent = ({
  cast,
  onSelect,
  isFocused,
  isEmbed = false,
  isReply = false,
  hasReplies = false,
  showChannel = false,
  hideReactions = false,
  className = undefined,
  castTextStyle = undefined,
  maxLines = 0,
  hideEmbeds = false,
  replyingToUsername = undefined,
}: CastRowProps) => {
  const { fid: userFid } = useFarcasterSigner("render-cast");

  const getChannelForParentUrl = (
    _parentUrl: string | null,
  ): { name: string } | null => null;

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

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (isFocused) {
        return;
      }

      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        // Text was selected, prevent click
        event.preventDefault();
        event.stopPropagation();
      } else {
        onSelect && onSelect(cast.hash, cast.author.username);
      }
    },
    [cast.hash, isFocused, cast.author.username, onSelect],
  );

  return (
    <div
      className={classNames(
        "![&(:last-child)]:border-b-none relative p-3",
        !isFocused && "hover:bg-foreground/5 cursor-pointer",
        !isEmbed && (!hasReplies || isFocused)
          ? "border-b border-b-foreground/10"
          : "",
        className,
      )}
    >
      <div
        onClick={handleClick}
        className={classNames("transition duration-300 ease-out flex gap-2")}
      >
        {!isFocused && !isEmbed && (
          <CastLeftGutter
            cast={cast}
            connectTop={isReply}
            connectBottom={hasReplies}
          />
        )}
        <div
          className={
            isFocused
              ? "flex flex-col flex-1 gap-3"
              : "flex-1 overflow-x-hidden truncate"
          }
        >
          <CastAttributionHeader
            cast={cast}
            avatar={isFocused || isEmbed}
            inline={!isFocused}
            isReply={isReply}
          />
          {replyingToUsername && (
            <p className="mb-1 tracking-tight text-sm leading-[1.3] truncate gap-1 opacity-60 font-medium">
              Replying to{" "}
              <PriorityLink href={`/s/${replyingToUsername}`}>
                <span className="cursor-pointer text-blue-500 hover:text-blue-500/70 hover:underline">
                  @{replyingToUsername}
                </span>
              </PriorityLink>
            </p>
          )}
          <CastBody
            cast={cast}
            channel={channel}
            isEmbed={isEmbed}
            showChannel={showChannel}
            castTextStyle={{
              ...defaultCastTextStyle,
              ...(castTextStyle || {}),
            }}
            hideReactions={hideReactions}
            renderRecastBadge={renderRecastBadge}
            isDetailView={isFocused}
            userFid={userFid}
            onSelectCast={(hash) => onSelect && onSelect(hash, cast.author.username)}
            maxLines={maxLines}
            hideEmbeds={hideEmbeds}
          />
        </div>
      </div>
    </div>
  );
};

export const CastRow = React.memo(CastRowComponent);
CastRow.displayName = 'CastRow';

export const CastRowExport = CastRow;
