"use client";

import { Avatar, AvatarImage } from "@/common/components/atoms/avatar";
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
import { CastWithInteractions, EmbedUrl, User } from "@neynar/nodejs-sdk/build/api";
import { hexToBytes, bytesToHex } from "@noble/ciphers/utils";
import { ErrorBoundary } from "@sentry/react";
import { Properties } from "csstype";
import { get, includes, isObject, isUndefined, map } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { FaReply } from "react-icons/fa6";
import { IoMdShare } from "react-icons/io";
import CreateCast, { DraftType } from "./CreateCast";
import { renderEmbedForUrl, type CastEmbed } from "./Embeds";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";
import { useToastStore } from "@/common/data/stores/toastStore";
import {
  CastModalPortalBoundary,
  CastDiscardPrompt,
} from "@/common/components/molecules/CastModalHelpers";
import type { DialogContentProps } from "@radix-ui/react-dialog";
import { eventIsFromCastModalInteractiveRegion } from "@/common/lib/utils/castModalInteractivity";

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
    [href]
  );

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
};

export const CastAvatar = ({ user, className }: { user: User; className?: string }) => {
  return (
    <PriorityLink className="cursor-pointer h-fit" href={`/s/${user.username}`}>
      <Avatar
        className={classNames(
          "size-10 flex-none bg-background hover:brightness-[90%] transition duration-300 ease-out",
          className
        )}
      >
        <AvatarImage src={`${user.pfp_url}`} alt={user?.display_name} className="object-cover" />
      </Avatar>
    </PriorityLink>
  );
};

interface CastEmbedsProps {
  cast: CastWithInteractions;
  onSelectCast: (hash: string, username: string) => void;
}

// Helper function to extract URLs from cast text
const extractUrlsFromText = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex) || [];
};

const CastEmbedsComponent = ({ cast, onSelectCast }: CastEmbedsProps) => {
  // Get URLs from embeds and also extract any URLs from the cast text
  const embedUrls = "embeds" in cast && cast.embeds ? cast.embeds : [];
  const textUrls = extractUrlsFromText(cast.text || "");

  // If no embeds from API and no URLs in text, return null
  if (!embedUrls.length && !textUrls.length) {
    return null;
  }

  return (
    <ErrorBoundary>
      {/* Render embeds from API */}
      {map(embedUrls, (embed, i) => {
        const embedData: CastEmbed = isEmbedUrl(embed)
          ? {
              url: embed.url,
              key: embed.url,
            }
          : {
              castId: embed.cast_id,
              key: embed.cast_id?.hash 
                ? (typeof embed.cast_id.hash === "string" 
                    ? embed.cast_id.hash 
                    : bytesToHex(embed.cast_id.hash))
                : "",
            };

        return (
          <div
            key={`embed-${i}`}
            className={classNames(
              "mt-4 gap-y-4 border border-foreground/15 rounded-xl flex justify-center items-center overflow-hidden max-h-[500px] w-full bg-background/50",
              embedData.castId ? "max-w-[100%]" : "max-w-max"
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (embedData?.castId?.hash) {
                const hashString =
                  typeof embedData.castId.hash === "string"
                    ? embedData.castId.hash
                    : bytesToHex(embedData.castId.hash);
                onSelectCast(hashString, cast.author.username);
              }
            }}
          >
            {renderEmbedForUrl(embedData, false)}
          </div>
        );
      })}

      {/* Render URLs found in text that aren't already in embeds */}
      {textUrls.map((url, i) => {
        // Skip if this URL is already in the embeds
        const isAlreadyEmbedded = embedUrls.some((embed) => isEmbedUrl(embed) && embed.url === url);

        if (isAlreadyEmbedded) {
          return null;
        }

        const embedData: CastEmbed = {
          url: url,
          key: url,
        };

        return (
          <div
            key={`text-url-${i}`}
            className={classNames(
              "mt-4 gap-y-4 border border-foreground/15 rounded-xl flex justify-center items-center overflow-hidden max-h-[500px] w-full bg-background/50",
              "max-w-max"
            )}
          >
            {renderEmbedForUrl(embedData, false)}
          </div>
        );
      })}
    </ErrorBoundary>
  );
};

const CastEmbeds = React.memo(CastEmbedsComponent);
CastEmbeds.displayName = "CastEmbeds";

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
      {isReply && avatar && !inline && <ThreadConnector className="h-[8px] top-0 left-[31px]" />}
      {avatar && <CastAvatar user={cast.author} className={inline ? "size-5" : "size-10"} />}
      <div className={classNames("flex gap-x-1 truncate flex-wrap", inline ? "flex-row mb-0.5" : "flex-col")}>
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
      <PriorityLink href={`/s/${cast.author.username}`} className="cursor-pointer truncate">
        <span className="hover:underline">{cast.author.display_name}</span>
      </PriorityLink>
      {cast?.author?.power_badge && (
        <Image src="/images/ActiveBadge.webp" className="size-4" alt="power badge" width={50} height={30} />
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
  const [didLike, setDidLike] = useState(cast.viewer_context?.liked ?? false);
  const [didRecast, setDidRecast] = useState(cast.viewer_context?.recasted ?? false);
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
  // discard confirmation state for modal opened from this CastRow
  const [shouldConfirmCastClose, setShouldConfirmCastClose] = useState(false);
  const [showCastDiscardPrompt, setShowCastDiscardPrompt] = useState(false);

  const closeCastModal = useCallback(() => {
    setShowModal(false);
    setShowCastDiscardPrompt(false);
    setShouldConfirmCastClose(false);
  }, []);

  const handleCastModalChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (shouldConfirmCastClose) {
          setShowCastDiscardPrompt(true);
          return;
        }

        closeCastModal();
        return;
      }

      setShowCastDiscardPrompt(false);
      setShowModal(true);
    },
    [closeCastModal, shouldConfirmCastClose],
  );

  useEffect(() => {
    if (!shouldConfirmCastClose) {
      setShowCastDiscardPrompt(false);
    }
  }, [shouldConfirmCastClose]);

  const handleCastModalInteractOutside = useCallback<
    NonNullable<DialogContentProps["onInteractOutside"]>
  >(
    (event) => {
      const hasDetailWithOriginalEvent = (
        e: unknown,
      ): e is { detail?: { originalEvent?: unknown } } => {
        return typeof e === "object" && e !== null && "detail" in e;
      };

      const hasTarget = (e: unknown): e is { target?: unknown } => {
        return typeof e === "object" && e !== null && "target" in e;
      };

      const originalEvent = hasDetailWithOriginalEvent(event) &&
        event.detail?.originalEvent instanceof Event
        ? event.detail.originalEvent
        : undefined;

      const eventTarget = originalEvent?.target instanceof EventTarget
        ? originalEvent.target
        : hasTarget(event) && event.target instanceof EventTarget
        ? event.target
        : null;

      if (originalEvent && eventTarget &&
          eventIsFromCastModalInteractiveRegion(originalEvent, eventTarget)) {
        event.preventDefault();
        return;
      }

      if (!shouldConfirmCastClose) {
        return;
      }

      event.preventDefault();
      setShowCastDiscardPrompt(true);
    },
    [shouldConfirmCastClose],
  );

  const handleDiscardCast = useCallback(() => {
    closeCastModal();
  }, [closeCastModal]);

  const handleCancelDiscard = useCallback(() => {
    setShowCastDiscardPrompt(false);
  }, []);

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
        isActive: didLike || viewerLiked || includes(likeFids, userFid),
      },
      [CastReactionType.recasts]: {
        count: recastsCount + (!viewerRecasted ? Number(didRecast) : 0),
        isActive: didRecast || viewerRecasted || includes(recastFids, userFid),
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

      const reactionBodyType: ReactionType = key === CastReactionType.likes ? ReactionType.LIKE : ReactionType.RECAST;
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

  const renderReaction = (key: CastReactionType, isActive: boolean, count?: number | string, icon?: JSX.Element) => {
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
    const cleanedHash = cast.hash.startsWith("0x") ? cast.hash.slice(2) : cast.hash;

    // Convert the hex string to Uint8Array
    const parentCastHash = hexToBytes(cleanedHash);

    // Check for invalid length and prevent submission if necessary
    if (parentCastHash.length !== 20) {
      console.error("Hash must be 20 bytes, but received length:", parentCastHash.length);
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

  return (
    <>
      <Modal
        open={showModal}
        setOpen={handleCastModalChange}
        focusMode
        showClose={false}
        onInteractOutside={handleCastModalInteractOutside}
        onPointerDownOutside={handleCastModalInteractOutside}
      >
        <CastModalPortalBoundary>
          <div className="mb-4">
            {replyCastType === "reply" ? <CastRowExport cast={cast} isEmbed /> : null}
          </div>
          <div className="flex">
            <CreateCast initialDraft={replyCastDraft} onShouldConfirmCloseChange={setShouldConfirmCastClose} />
          </div>
          <CastDiscardPrompt open={showCastDiscardPrompt} onClose={handleCancelDiscard} onDiscard={handleDiscardCast} />
        </CastModalPortalBoundary>
      </Modal>
      <div className="-ml-1.5 flex items-center space-x-3 w-full">
        {Object.entries(reactions).map(([key, reactionInfo]) => {
          const isActive = get(reactionInfo, "isActive", false);
          const icon = getIconForCastReactionType(key as CastReactionType, isActive);
          const reaction = renderReaction(key as CastReactionType, isActive, reactionInfo.count, icon);
          return reaction;
        })}

        {renderReaction(CastReactionType.quote, true, undefined, getIconForCastReactionType(CastReactionType.quote))}
        {cast.channel && cast.channel.name && (
          <Link
            key={`cast-${cast.hash}-channel-name`}
            href={`/c/${encodeURIComponent((cast.channel.id || cast.channel.name).toString())}`}
            className="mt-1.5 flex items-center text-sm opacity-60 transition-colors hover:text-blue-500 focus:text-blue-500 py-1 px-1.5 rounded-md"
            onClick={(event) => event.stopPropagation()}
          >
            /{cast.channel.name}
          </Link>
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

// Safe text expansion component with character-based truncation
const SafeExpandableText: React.FC<{
  children: string;
  maxLines?: number | null;
  style?: React.CSSProperties;
}> = ({ children, maxLines, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no maxLines specified, render without truncation
  if (!maxLines || maxLines <= 0) {
    return <EnhancedLinkify style={style}>{children}</EnhancedLinkify>;
  }

  // Character-based truncation (more reliable than height calculations)
  const maxChars = maxLines * 80; // Approximate 80 characters per line
  const shouldTruncate = children.length > maxChars;
  const displayText = isExpanded || !shouldTruncate ? children : children.slice(0, maxChars) + "...";

  return (
    <div style={style}>
      <EnhancedLinkify style={style}>{displayText}</EnhancedLinkify>
      {shouldTruncate && !isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="text-blue-500 hover:underline ml-1 font-medium"
          type="button"
        >
          Show more
        </button>
      )}
    </div>
  );
};
// Enhanced text linkifier for Farcaster content
const EnhancedLinkify: React.FC<{ children: string; style?: React.CSSProperties }> = ({ children, style }) => {
  const linkifyText = (text: string) => {
    // Production-ready regex patterns optimized for performance
    // Non-global versions for .test() to avoid stateful behavior
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/;
    const mentionRegex = /(@[a-zA-Z0-9_.-]+)/;
    const channelRegex = /(\/[a-zA-Z0-9_-]+)(?=\s|$)/;
    const hashtagRegex = /(#[a-zA-Z0-9_-]+)/;

    // Efficient text splitting that preserves special tokens (keeps global flag for split)
    const combinedRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|@[a-zA-Z0-9_.-]+|\/[a-zA-Z0-9_-]+(?=\s|$)|#[a-zA-Z0-9_-]+)/g;
    const parts = text.split(combinedRegex);

    return parts
      .map((part, index) => {
        if (!part) return null;

        // URL links
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline cursor-pointer break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        // User mentions
        if (mentionRegex.test(part)) {
          const username = part.slice(1);
          return (
            <a
              key={index}
              href={`/s/${username}`}
              className="text-blue-500 hover:underline cursor-pointer font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        // Channel references
        if (channelRegex.test(part) && part.length > 1) {
          return (
            <span
              key={index}
              className="text-blue-500 hover:underline cursor-pointer font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </span>
          );
        }

        // Hashtags
        if (hashtagRegex.test(part)) {
          return (
            <span key={index} className="font-medium text-slate-700" onClick={(e) => e.stopPropagation()}>
              {part}
            </span>
          );
        }

        return part;
      })
      .filter(Boolean);
  };

  return <span style={style}>{linkifyText(children)}</span>;
};

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
  const handleSelectCast = useCallback(
    (hash: string, username: string) => {
      if (onSelectCast) {
        onSelectCast(hash, username);
      }
    },
    [onSelectCast]
  );

  return (
    <div className="flex flex-col grow">
      {cast.text && (
        <div className={isDetailView ? "text-lg leading-[1.4]" : "text-base leading-[1.4]"}>
          <SafeExpandableText maxLines={maxLines || (isDetailView ? null : 10)} style={castTextStyle}>
            {cast.text}
          </SafeExpandableText>
        </div>
      )}

      {!isEmbed && !hideEmbeds && <CastEmbeds cast={cast} onSelectCast={handleSelectCast} />}
      {!hideReactions && <CastReactions cast={cast} />}
    </div>
  );
};

export const CastBody = React.memo(CastBodyComponent);
CastBody.displayName = "CastBody";

const ThreadConnector = ({ className }) => {
  return <div className={classNames("absolute w-[2px] bg-border flex-1", className)} />;
};

const CastLeftGutter = ({ cast, connectTop, connectBottom }) => {
  return (
    <div className="flex flex-0 justify-center top-0 bottom-0">
      {connectTop && <ThreadConnector className="top-0 h-[4px]" />}
      <CastAvatar user={cast.author} className="size-10" />
      {connectBottom && <ThreadConnector className="bottom-0 h-[calc(100%-60px)]" />}
    </div>
  );
};

const getIconForCastReactionType = (reactionType: CastReactionType, isActive?: boolean): JSX.Element | undefined => {
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
      return <ArrowPathRoundedSquareIcon className={className} aria-hidden="true" />;
    case CastReactionType.quote:
      return <ChatBubbleLeftRightIcon className={className} aria-hidden="true" />;
    case CastReactionType.replies:
      return <FaReply className={className} aria-hidden="true" />;
    case CastReactionType.links:
      return <ArrowTopRightOnSquareIcon className={className} aria-hidden="true" />;
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

  const getChannelForParentUrl = (_parentUrl: string | null): { name: string } | null => null;

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

  const channel = showChannel && "parent_url" in cast ? getChannelForParentUrl(cast.parent_url) : null;

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
    [cast.hash, isFocused, cast.author.username, onSelect]
  );

  return (
    <div
      className={classNames(
        "![&(:last-child)]:border-b-none relative p-3",
        !isFocused && "hover:bg-foreground/5 cursor-pointer",
        !isEmbed && (!hasReplies || isFocused) ? "border-b border-b-foreground/10" : "",
        className
      )}
    >
      <div onClick={handleClick} className={classNames("transition duration-300 ease-out flex gap-2")}>
        {!isFocused && !isEmbed && <CastLeftGutter cast={cast} connectTop={isReply} connectBottom={hasReplies} />}
        <div className={isFocused ? "flex flex-col flex-1 gap-3" : "flex-1 overflow-x-hidden truncate"}>
          <CastAttributionHeader cast={cast} avatar={isFocused || isEmbed} inline={!isFocused} isReply={isReply} />
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
CastRow.displayName = "CastRow";

export const CastRowExport = CastRow;

