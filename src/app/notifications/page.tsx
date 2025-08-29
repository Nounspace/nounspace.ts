"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import useNotifications from "@/common/lib/hooks/useNotifications";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { FaCircleExclamation, FaHeart } from "react-icons/fa6";
import { Notification, NotificationTypeEnum, User } from "@neynar/nodejs-sdk/build/api";
import { Alert, AlertDescription } from "@/common/components/atoms/alert";
import { CastAvatar, CastBody, PriorityLink } from "@/fidgets/farcaster/components/CastRow";
import Loading from "@/common/components/molecules/Loading";
import { useInView } from "react-intersection-observer";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import {
  useNotificationsLastSeenCursor,
  useMutateNotificationsLastSeenCursor,
} from "@/common/lib/hooks/useNotificationsLastSeenCursor";
import moment from "moment";
import useDelayedValueChange from "@/common/lib/hooks/useDelayedValueChange";
import { useRouter } from "next/navigation";

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
  );
};

const FormattedUsersText = ({ users }: { users: User[] }) => {
  if (users.length === 0) {
    return "Nobody";
  }

  const firstUserLink = (
    <PriorityLink href={`/s/${users[0].username}`} className="hover:underline text-foreground font-semibold">
      {users[0].display_name}
    </PriorityLink>
  );

  if (users.length === 1) {
    return firstUserLink;
  } else if (users.length === 2) {
    return <>{firstUserLink} and 1 other</>;
  } else {
    return (
      <>
        {firstUserLink} and {users.length - 1} others
      </>
    );
  }
};

const getNotificationActionText = (type: NotificationTypeEnum): string => {
  switch (type) {
    case NotificationTypeEnum.Follows:
      return "followed you";
    case NotificationTypeEnum.Recasts:
    case NotificationTypeEnum.Quote:
      return "recasted your cast";
    case NotificationTypeEnum.Likes:
      return "liked your cast";
    case NotificationTypeEnum.Mention:
      return "mentioned you";
    case NotificationTypeEnum.Reply:
      return "replied to your cast";
    default:
      return "interacted with your content";
  }
};

const getNotificationIcon = (type: NotificationTypeEnum): React.ReactNode => {
  switch (type) {
    case NotificationTypeEnum.Follows:
      return <span className="text-xs">👥</span>;
    case NotificationTypeEnum.Recasts:
    case NotificationTypeEnum.Quote:
      return <span className="text-xs">🔄</span>;
    case NotificationTypeEnum.Likes:
      return <FaHeart className="text-red-500 w-3 h-3" />;
    case NotificationTypeEnum.Mention:
      return <span className="text-xs">💬</span>;
    case NotificationTypeEnum.Reply:
      return <span className="text-xs">↩️</span>;
    default:
      return null;
  }
};

const NotificationRow: NotificationRowProps = ({ notification, onSelect, isUnseen = false }) => {
  const handleClick = useCallback(() => {
    if (notification.cast?.hash && notification.cast?.author?.username) {
      onSelect(notification.cast.hash, notification.cast.author.username);
    }
  }, [notification, onSelect]);

  // Get users based on notification type
  const getRelatedUsers = (): User[] => {
    if (notification.reactions) {
      return notification.reactions.map((r) => r.user);
    }
    if (notification.follows) {
      return notification.follows.map((f) => f.user);
    }
    if (notification.cast?.author) {
      return [notification.cast.author];
    }
    return [];
  };

  const relatedUsers = getRelatedUsers();
  const maxAvatarsToShow = 4;
  const showAvatars =
    relatedUsers.length > 1 ||
    notification.type === NotificationTypeEnum.Follows ||
    notification.type === NotificationTypeEnum.Likes ||
    notification.type === NotificationTypeEnum.Recasts ||
    notification.type === NotificationTypeEnum.Quote ||
    notification.type === NotificationTypeEnum.Mention ||
    notification.type === NotificationTypeEnum.Reply;

  return (
    <div
      className={`
        px-4 py-3 border-b border-border/20 cursor-pointer transition-all duration-200
        hover:bg-accent/50
        ${isUnseen ? "bg-blue-50/30 border-l-4 border-l-blue-500" : ""}
      `}
      onClick={handleClick}
    >
      {/* Avatars row (for all notification types) */}
      {showAvatars && relatedUsers.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          {/* Notification icon for group actions or single action indicator */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
              notification.type === NotificationTypeEnum.Likes
                ? "bg-red-500"
                : notification.type === NotificationTypeEnum.Follows
                  ? "bg-blue-500"
                  : notification.type === NotificationTypeEnum.Recasts ||
                      notification.type === NotificationTypeEnum.Quote
                    ? "bg-green-500"
                    : notification.type === NotificationTypeEnum.Mention
                      ? "bg-purple-500"
                      : notification.type === NotificationTypeEnum.Reply
                        ? "bg-orange-500"
                        : "bg-gray-500"
            }`}
          >
            {notification.type === NotificationTypeEnum.Likes ? (
              <FaHeart className="text-white w-2.5 h-2.5" />
            ) : notification.type === NotificationTypeEnum.Follows ? (
              <span className="text-white text-xs">👥</span>
            ) : notification.type === NotificationTypeEnum.Recasts ||
              notification.type === NotificationTypeEnum.Quote ? (
              <span className="text-white text-xs">🔄</span>
            ) : notification.type === NotificationTypeEnum.Mention ? (
              <span className="text-white text-xs">@</span>
            ) : notification.type === NotificationTypeEnum.Reply ? (
              <span className="text-white text-xs">↩</span>
            ) : (
              getNotificationIcon(notification.type)
            )}
          </div>

          {/* User avatars */}
          <div className="flex -space-x-2">
            {relatedUsers.slice(0, maxAvatarsToShow).map((user, index) => (
              <CastAvatar
                key={user.fid || index}
                user={user}
                className="w-8 h-8 border-2 border-background hover:z-20"
              />
            ))}
            {/* Show overflow indicator */}
            {relatedUsers.length > maxAvatarsToShow && (
              <div className="w-8 h-8 bg-muted border-2 border-background rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{relatedUsers.length - maxAvatarsToShow}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content row */}
      <div className="flex">
        {/* Right side - Content */}
        <div className="flex-1 min-w-0">
          {/* Header with users and action */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FormattedUsersText users={relatedUsers} />
            </div>
            <span className="text-muted-foreground text-sm">{getNotificationActionText(notification.type)}</span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">
              {moment(notification.most_recent_timestamp).fromNow()}
            </span>
          </div>

          {/* Cast content if present */}
          {notification.cast && (
            <div className="mt-2 text-sm text-muted-foreground">
              <CastBody
                cast={notification.cast}
                castTextStyle={{
                  fontSize: "14px",
                  lineHeight: "1.4",
                  color: "rgb(100 116 139)",
                  fontWeight: "400",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const isNotificationUnseen = (
  notification: Notification,
  lastSeenNotificationDate?: moment.Moment | null
): boolean | undefined => {
  if (lastSeenNotificationDate === undefined) return undefined;
  if (lastSeenNotificationDate === null) return true;

  return moment.utc(notification.most_recent_timestamp).isAfter(lastSeenNotificationDate);
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div>Loading notifications...</div>}>
      <NotificationsPageContent />
    </Suspense>
  );
}

function NotificationsPageContent() {
  const fid = useCurrentFid();
  const identityPublicKey = useCurrentSpaceIdentityPublicKey();
  const { data, error, fetchNextPage, hasNextPage, isFetching } = useNotifications(fid);
  const [ref] = useInView({
    skip: !hasNextPage || isFetching,
    onChange: (_inView) => {
      if (_inView) {
        fetchNextPage();
      }
    },
  });

  const { data: lastSeenNotificationTimestamp } = useNotificationsLastSeenCursor(fid, identityPublicKey);

  const { mutate: updateLastSeenCursor } = useMutateNotificationsLastSeenCursor(fid, identityPublicKey);

  const router = useRouter();

  const onSelectNotification = useCallback(
    (hash: string, username: string) => {
      router.push(`/homebase/c/${username}/${hash}`);
    },
    [router]
  );

  const lastSeenNotificationDate = useMemo<moment.Moment | null | undefined>(() => {
    return typeof lastSeenNotificationTimestamp === "string"
      ? moment.parseZone(lastSeenNotificationTimestamp)
      : lastSeenNotificationTimestamp;
  }, [lastSeenNotificationTimestamp]);

  const mostRecentNotificationTimestamp: string | null = useMemo(() => {
    if (data?.pages?.length && data.pages[0]?.notifications?.length > 0) {
      return data.pages[0].notifications[0].most_recent_timestamp;
    }
    return null;
  }, [data]);

  const shouldUpdateNotificationsCursor: boolean = useMemo(() => {
    if (!mostRecentNotificationTimestamp) return false;
    if (!lastSeenNotificationDate) return true;

    return moment.utc(mostRecentNotificationTimestamp).isAfter(lastSeenNotificationDate);
  }, [mostRecentNotificationTimestamp, lastSeenNotificationDate]);

  const updateNotificationsCursor = useCallback(() => {
    if (shouldUpdateNotificationsCursor && mostRecentNotificationTimestamp) {
      updateLastSeenCursor({
        lastSeenTimestamp: mostRecentNotificationTimestamp,
      });
    }
  }, [updateLastSeenCursor, mostRecentNotificationTimestamp, shouldUpdateNotificationsCursor]);

  useEffect(() => {
    if (shouldUpdateNotificationsCursor) {
      updateNotificationsCursor();
    }
  }, [updateNotificationsCursor, shouldUpdateNotificationsCursor]);

  // On page load, the lastSeenCursor is updated, which immediately clears the badge count in the nav.
  // To make it apparent which notifications are new, this delays the visual clearing of the unseen
  // notifications to keep them highlighted for an extra n seconds after being marked seen in the db.
  const delayedLastSeenNotificationDate = useDelayedValueChange(
    lastSeenNotificationDate,
    20000,
    function shouldDelay(prev, curr) {
      const wasJustCreated = moment.isMoment(curr) && prev === null;
      const wasJustUpdated = moment.isMoment(curr) && moment.isMoment(prev);
      return wasJustCreated || wasJustUpdated;
    }
  );

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border/40 bg-background sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        </div>

        {/* Notifications List */}
        <div className="relative">
          <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Loading...</div>}>
            {data?.pages?.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {(page?.notifications ?? []).map((notification, pageItemIndex) => {
                  const isUnseen = isNotificationUnseen(notification, delayedLastSeenNotificationDate);
                  return (
                    <NotificationRow
                      notification={notification}
                      onSelect={onSelectNotification}
                      isUnseen={isUnseen}
                      key={`${pageIndex}-${pageItemIndex}`}
                    />
                  );
                })}
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
          <div ref={ref} className="h-[100px] flex items-center justify-center">
            {isFetching && (
              <div className="h-full w-full flex flex-col justify-center items-center">
                <Loading />
              </div>
            )}
            {!isFetching && !hasNextPage && <p className="text-muted-foreground text-sm">No more notifications</p>}
          </div>
        )}
      </div>
    </div>
  );
}
