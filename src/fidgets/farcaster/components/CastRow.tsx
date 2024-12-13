import React, { useState, useCallback, useMemo } from "react";
import { Properties } from "csstype";
import { mergeClasses as classNames } from "@/common/lib/utils/mergeClasses";
import {
  ArrowPathRoundedSquareIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartFilledIcon } from "@heroicons/react/24/solid";
import { publishReaction, removeReaction } from "@/fidgets/farcaster/utils";
import { includes, isObject, isUndefined, map, get } from "lodash";
import { ErrorBoundary } from "@sentry/react";
import { renderEmbedForUrl } from "./Embeds";
import Image from "next/image";
import {
  CastWithInteractions,
  EmbedUrl,
  User,
} from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useFarcasterSigner } from "@/fidgets/farcaster/index";
import { CastReactionType } from "@/fidgets/farcaster/types";
import { ReactionType } from "@farcaster/core";
import { hexToBytes } from "@noble/ciphers/utils";
import CreateCast, { DraftType } from "./CreateCast";
import Modal from "@/common/components/molecules/Modal";
import FarcasterLinkify from "./linkify";
import { Avatar, AvatarImage } from "@/common/components/atoms/avatar";
import { useRouter } from "next/router";
import { formatTimeAgo } from "@/common/lib/utils/date";
import ExpandableText from "@/common/components/molecules/ExpandableText";
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";
import { AnalyticsEvent } from "@/common/providers/AnalyticsProvider";
import { FaReply } from "react-icons/fa6";

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
  onSelect?: (hash: string) => void;
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

const CastEmbeds = ({ cast, onSelectCast }) => {
  if (!("embeds" in cast) || !cast.embeds.length) {
    return null;
  }

  return (
    <ErrorBoundary>
      {map(cast.embeds, (embed, i) => {
        const embedData = isEmbedUrl(embed)
          ? {
              ...embed,
              key: embed.url,
            }
          : {
              castId: embed.cast_id,
              key: embed.cast_id,
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
                onSelectCast(embedData.castId.hash);
              }
            }}
          >
            {renderEmbedForUrl(embedData)}
          </div>
        );
      })}
    </ErrorBoundary>
  );
};

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

  const getReactions = () => {
    const repliesCount = cast.replies?.count || 0;
    const recastsCount = cast.reactions?.recasts_count || 0;
    const likesCount = cast.reactions?.likes_count;

    const likeFids = map(cast.reactions?.likes, "fid") || [];
    const recastFids = map(cast.reactions?.recasts, "fid") || [];
    return {
      [CastReactionType.likes]: {
        count: likesCount + Number(didLike),
        isActive: didLike || includes(likeFids, userFid),
      },
      [CastReactionType.recasts]: {
        count: recastsCount + Number(didRecast),
        isActive: didRecast || includes(recastFids, userFid),
      },
      [CastReactionType.replies]: { count: repliesCount },
    };
  };

  const onClickReaction = async (key: CastReactionType, isActive: boolean) => {
    if (key === CastReactionType.links) {
      return;
    }

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
          {replyCastType === "reply" ? <CastRow cast={cast} isEmbed /> : null}
        </div>
        <div className="flex">
          <CreateCast initialDraft={replyCastDraft} />
        </div>
      </Modal>
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
      </div>
    </>
  );
};

export const CastBody = ({
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
}) => {
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
              {cast.text}
            </ExpandableText>
          </p>
        </FarcasterLinkify>
      )}
      {!isEmbed && !hideEmbeds && (
        <CastEmbeds cast={cast} onSelectCast={onSelectCast} />
      )}
      {!hideReactions && <CastReactions cast={cast} />}
    </div>
  );
};

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

export const CastRow = ({
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
        onSelect && onSelect(cast.hash);
      }
    },
    [cast.hash, isFocused],
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
            onSelectCast={onSelect}
            maxLines={maxLines}
            hideEmbeds={hideEmbeds}
          />
        </div>
      </div>
    </div>
  );
};
