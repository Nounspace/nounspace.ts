"use client"

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import useNotifications from "@/common/lib/hooks/useNotifications";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { FaCircleExclamation } from "react-icons/fa6";
import {
  Notification,
  NotificationTypeEnum,
  User,
  CastWithInteractions,
} from "@neynar/nodejs-sdk/build/api"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs"
import { Alert, AlertDescription } from "@/common/components/atoms/alert"
import {
  CastAvatar,
  CastBody,
  CastRow,
  PriorityLink,
} from "@/fidgets/farcaster/components/CastRow"
import Loading from "@/common/components/molecules/Loading"
import { useInView } from "react-intersection-observer"
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey"
import {
  useNotificationsLastSeenCursor,
  useMutateNotificationsLastSeenCursor,
} from "@/common/lib/hooks/useNotificationsLastSeenCursor"
import moment from "moment"
import useDelayedValueChange from "@/common/lib/hooks/useDelayedValueChange"
import { FaHeart } from "react-icons/fa"
import { useRouter } from "next/navigation"

const TAB_OPTIONS = {
  ALL: "all",
  MENTIONS: NotificationTypeEnum.Mention,
  FOLLOWS: NotificationTypeEnum.Follows,
  RECASTS: NotificationTypeEnum.Recasts,
  REPLIES: NotificationTypeEnum.Reply,
  LIKES: NotificationTypeEnum.Likes,
}
const getNotificationCast = (
  notification: Notification,
): CastWithInteractions | undefined => {
  if (
    notification.cast &&
    typeof (notification.cast as any).text === "string" &&
    (notification.cast as any).text.length > 0
  ) {
    return notification.cast as any;
  }

  const reactionCast = notification.reactions?.[0]?.cast as any;
  if (
    reactionCast &&
    typeof reactionCast.text === "string" &&
    reactionCast.text.length > 0
  ) {
    return reactionCast;
  }

  return undefined;
};


export type NotificationRowProps = React.FC<{
  notification: Notification;
  onSelect: (castHash: string, username: string) => void;
  isUnseen?: boolean;
}>;

const ErrorPanel = ({ message }: { message: string }) => {
  return (
    <Alert variant="destructive">
      <FaCircleExclamation className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

const FormattedUsersText = ({ users }: { users: User[] }) => {
  if (users.length === 0) {
    return "Nobody"
  }

  const firstUserLink = (
    <PriorityLink href={`/s/${users[0].username}`} className="hover:underline">
      <b>{users[0].display_name}</b>
    </PriorityLink>
  )

  if (users.length === 1) {
    return firstUserLink
  } else if (users.length === 2) {
    return <>{firstUserLink} and 1 other</>
  } else {
    return (
      <>
        {firstUserLink} and {users.length - 1} others
      </>
    )
  }
}

const NotificationHeader = ({
  notification,
  relatedUsers,
  descriptionSuffix,
  maxAvatarsToDisplay = 8,
  leftIcon = null,
}: {
  notification: Notification
  relatedUsers: User[]
  descriptionSuffix: string
  maxAvatarsToDisplay?: number
  leftIcon?: React.ReactNode
}) => {
  const numAvatarsNotShown = Math.max(
    0,
    relatedUsers.length - maxAvatarsToDisplay
  )

  return (
    <div className="flex flex-col gap-1 flex-wrap items-start w-full">
      {relatedUsers.length > 0 && (
        <div className="flex gap-x-1 items-center mb-1 sm:pl-10 md:pl-12 md:overflow-x-auto pb-1">
          {leftIcon && (
            <span className="flex items-center justify-center text-red-500 mr-1 flex-shrink-0">
              {leftIcon}
            </span>
          )}
          {relatedUsers
            .slice(0, maxAvatarsToDisplay)
            .map((user: User, i: number) => (
              <CastAvatar
                user={user}
                key={i}
                className="outline outline-2 outline-white flex-shrink-0"
              />
            ))}
          {numAvatarsNotShown < 0 && (
            <div className="outline outline-2 outline-white rounded-full size-10 tracking-tighter text-gray-500 flex items-center justify-center bg-gray-200 text-xs font-bold flex-shrink-0">
              +{numAvatarsNotShown}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        <p className="text-base leading-[1.3] text-left m-0 p-0 sm:pl-10 md:pl-12">
          <FormattedUsersText users={relatedUsers} />
          {` ${descriptionSuffix}`}
        </p>
      </div>
    </div>
  )
}

const MentionNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const cast = getNotificationCast(notification);
  if (!cast) return null;

  const mentionedByUser = cast.author ? [cast.author] : [];

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={mentionedByUser}
        descriptionSuffix="mentioned you"
      />
      <div className="ml-4 w-full">
        <CastRow
          cast={cast}
          key={cast.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={false}
          hasReplies={false}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "16px",
          }}
        />
      </div>
    </div>
  );
};

const FollowNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const newFollowers: User[] =
    notification.follows?.map((follow) => follow.user) ?? []

  return (
    <NotificationHeader
      notification={notification}
      relatedUsers={newFollowers}
      descriptionSuffix="followed you"
    />
  )
}

const RecastNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const recastedByUsers = useMemo(() => {
    return (notification?.reactions || [])
      .filter((r) => r.object === "recasts")
      .map((r) => r.user)
  }, [notification?.reactions])

  const cast = getNotificationCast(notification);
  if (!cast) return null;

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={recastedByUsers}
        descriptionSuffix="recasted your cast"
      />
      <div className="ml-4 w-full">
        <CastRow
          cast={cast}
          key={cast.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={false}
          hasReplies={false}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "16px",
          }}
        />
      </div>
    </div>
  );
};

const QuoteNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const cast = getNotificationCast(notification);
  if (!cast) return null;

  const quotedByUser = cast.author ? [cast.author] : [];

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={quotedByUser}
        descriptionSuffix="quoted your cast"
      />
      <div className="ml-4 w-full">
        <CastRow
          cast={cast}
          key={cast.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={false}
          hasReplies={false}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "16px",
          }}
        />
      </div>
    </div>
  );
};

const ReplyNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const cast = getNotificationCast(notification);
  if (!cast) return null;

  const repliedByUser = cast.author ? [cast.author] : [];

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={repliedByUser}
        descriptionSuffix="replied to your cast"
      />
      <div className="ml-4 w-full">
        <CastRow
          cast={cast}
          key={cast.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={true}
          hasReplies={(cast?.replies?.count ?? 0) > 0}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "16px",
          }}
        />
      </div>
    </div>
  );
};

const LikeNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const fid = useCurrentFid()
  const likedByUsers = useMemo(() => {
    return (notification?.reactions || [])
      .filter((r) => r.object === "likes")
      .map((r) => r.user);
  }, [notification?.reactions]);

  const cast = getNotificationCast(notification);
  if (!cast) return null;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onSelect(cast.hash, cast.author.username);
    },
    [cast, onSelect],
  );

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={likedByUsers}
        descriptionSuffix="liked your cast"
        leftIcon={<FaHeart className="w-4 h-4" aria-label="Like" />}
      />
      <div className="ml-4 w-full cursor-pointer" onClick={handleClick}>
        <CastBody
          cast={cast}
          channel={null}
          isEmbed={false}
          showChannel={false}
          hideEmbeds={false}
          castTextStyle={{
            fontSize: "14px",
            color: "#71767B",
            lineHeight: "1.3",
            fontWeight: "normal",
            textAlign: "left",
          }}
          hideReactions={false}
          renderRecastBadge={() => null}
          userFid={fid || undefined}
          isDetailView={false}
          onSelectCast={(hash) => onSelect(hash, cast.author.username)}
        />
      </div>
    </div>
  )
}

const NOTIFICATION_ROW_TYPE = {
  [NotificationTypeEnum.Mention]: MentionNotificationRow,
  [NotificationTypeEnum.Follows]: FollowNotificationRow,
  [NotificationTypeEnum.Recasts]: RecastNotificationRow,
  [NotificationTypeEnum.Quote]: QuoteNotificationRow,
  [NotificationTypeEnum.Reply]: ReplyNotificationRow,
  [NotificationTypeEnum.Likes]: LikeNotificationRow,
}

const NotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
  isUnseen = false,
}) => {
  const NotificationType = NOTIFICATION_ROW_TYPE[notification.type] || null

  return NotificationType ? (
    <div
      className={
        isUnseen
          ? "bg-blue-50 transition-colors duration-1000"
          : "bg-transparent transition-colors duration-1000"
      }
    >
      <div className="px-4 py-4 md:px-4 sm:px-5 xs:px-6 border-b hover:bg-foreground/5 cursor-pointer transition duration-300 ease-out">
        <div className="max-w-2xl md:overflow-visible pb-2">
          <div className="min-w-full sm:px-2 xs:px-3">
            <NotificationType notification={notification} onSelect={onSelect} />
          </div>
        </div>
      </div>
    </div>
  ) : null
}

const isNotificationUnseen = (
  notification: Notification,
  lastSeenNotificationDate?: moment.Moment | null
): boolean | undefined => {
  if (lastSeenNotificationDate === undefined) return undefined
  if (lastSeenNotificationDate === null) return true

  return moment
    .utc(notification.most_recent_timestamp)
    .isAfter(lastSeenNotificationDate)
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div>Loading notifications...</div>}>
      <NotificationsPageContent />
    </Suspense>
  )
}

function NotificationsPageContent() {
  const [tab, setTab] = useState<string>(TAB_OPTIONS.ALL)
  const fid = useCurrentFid()
  const identityPublicKey = useCurrentSpaceIdentityPublicKey()
  const { data, error, fetchNextPage, hasNextPage, isFetching } =
    useNotifications(fid)
  const [ref] = useInView({
    skip: !hasNextPage || isFetching,
    onChange: (_inView) => {
      if (_inView) {
        fetchNextPage()
      }
    },
  })

  const { data: lastSeenNotificationTimestamp } =
    useNotificationsLastSeenCursor(fid, identityPublicKey)

  const { mutate: updateLastSeenCursor } = useMutateNotificationsLastSeenCursor(
    fid,
    identityPublicKey
  )

  const router = useRouter()

  const onTabChange = useCallback((value: string) => {
    setTab(value)
  }, [])

  const onSelectNotification = useCallback(
    (hash: string, username: string) => {
      router.push(`/homebase/c/${username}/${hash}`);
    },
    [router],
  );

  const filterByType = useCallback(
    (_notifications: Notification[]): Notification[] => {
      if (tab === TAB_OPTIONS.ALL) {
        return _notifications
      }

      if (tab === TAB_OPTIONS.RECASTS) {
        return _notifications.filter(
          (notification) =>
            notification.type === NotificationTypeEnum.Recasts ||
            notification.type === NotificationTypeEnum.Quote,
        )
      }

      return _notifications.filter((notification) => notification.type === tab)
    },
    [tab]
  )

  const lastSeenNotificationDate = useMemo<
    moment.Moment | null | undefined
  >(() => {
    return typeof lastSeenNotificationTimestamp === "string"
      ? moment.parseZone(lastSeenNotificationTimestamp)
      : lastSeenNotificationTimestamp
  }, [lastSeenNotificationTimestamp])

  const mostRecentNotificationTimestamp: string | null = useMemo(() => {
    if (data?.pages?.length && data.pages[0]?.notifications?.length > 0) {
      return data.pages[0].notifications[0].most_recent_timestamp
    }
    return null
  }, [data])

  const shouldUpdateNotificationsCursor: boolean = useMemo(() => {
    if (tab !== TAB_OPTIONS.ALL) return false
    if (!mostRecentNotificationTimestamp) return false
    if (!lastSeenNotificationDate) return true

    return moment
      .utc(mostRecentNotificationTimestamp)
      .isAfter(lastSeenNotificationDate)
  }, [tab, mostRecentNotificationTimestamp, lastSeenNotificationDate])

  const updateNotificationsCursor = useCallback(() => {
    if (shouldUpdateNotificationsCursor && mostRecentNotificationTimestamp) {
      updateLastSeenCursor({
        lastSeenTimestamp: mostRecentNotificationTimestamp,
      })
    }
  }, [
    updateLastSeenCursor,
    mostRecentNotificationTimestamp,
    shouldUpdateNotificationsCursor,
  ])

  useEffect(() => {
    if (shouldUpdateNotificationsCursor) {
      updateNotificationsCursor()
    }
  }, [updateNotificationsCursor, shouldUpdateNotificationsCursor])

  // On page load, the lastSeenCursor is updated, which immediately clears the badge count in the nav.
  // To make it apparent which notifications are new, this delays the visual clearing of the unseen
  // notifications to keep them highlighted for an extra n seconds after being marked seen in the db.
  const delayedLastSeenNotificationDate = useDelayedValueChange(
    lastSeenNotificationDate,
    20000,
    function shouldDelay(prev, curr) {
      const wasJustCreated = moment.isMoment(curr) && prev === null
      const wasJustUpdated = moment.isMoment(curr) && moment.isMoment(prev)
      return wasJustCreated || wasJustUpdated
    }
  )

  return (
    <div className="w-full min-h-screen">
      <Tabs value={tab} onValueChange={onTabChange} className="min-h-full">
        <div className="py-4 px-4 border-b">
          <h1 className="text-xl font-bold mb-2 md:mb-6">Notifications</h1>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
            <TabsList className="grid min-w-[600px] md:min-w-fit w-full grid-cols-6 max-w-2xl">
              <TabsTrigger value={TAB_OPTIONS.ALL}>All</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.MENTIONS}>Mentions</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.FOLLOWS}>Follows</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.RECASTS}>Recasts</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.REPLIES}>Replies</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.LIKES}>Likes</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value={tab} className="mt-0">
          <div className="relative overflow-hidden">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              {data?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {filterByType(page?.notifications ?? []).map(
                    (notification, pageItemIndex) => {
                      const isUnseen = isNotificationUnseen(
                        notification,
                        delayedLastSeenNotificationDate
                      )
                      return (
                        <NotificationRow
                          notification={notification}
                          onSelect={onSelectNotification}
                          isUnseen={isUnseen}
                          key={`${pageIndex}-${pageItemIndex}`}
                        />
                      )
                    }
                  )}
                </React.Fragment>
              ))}
            </Suspense>
          </div>
          {error && (
            <div className="p-4">
              <ErrorPanel message={error.message} />
            </div>
          )}
          {!error && (
            <div
              ref={ref}
              className="h-[200px] flex items-center justify-center"
            >
              {isFetching && (
                <div className="h-full w-full bg-foreground/5 flex flex-col justify-center items-center">
                  <Loading />
                </div>
              )}
              {!isFetching && !hasNextPage && (
                <p className="text-primary/40 font-medium">
                  There are no more notifications to display
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
