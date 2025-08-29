"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import useNotifications from "@/common/lib/hooks/useNotifications";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { FaCircleExclamation } from "react-icons/fa6";
import { Notification, NotificationTypeEnum, User } from "@neynar/nodejs-sdk/build/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { Alert, AlertDescription } from "@/common/components/atoms/alert";
import { CastAvatar, CastBody, CastRow, PriorityLink } from "@/fidgets/farcaster/components/CastRow";
import Loading from "@/common/components/molecules/Loading";
import { useInView } from "react-intersection-observer";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import {
  useNotificationsLastSeenCursor,
  useMutateNotificationsLastSeenCursor,
} from "@/common/lib/hooks/useNotificationsLastSeenCursor";
import moment from "moment";
import useDelayedValueChange from "@/common/lib/hooks/useDelayedValueChange";
import { FaHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";

const TAB_OPTIONS = {
  ALL: "all",
  MENTIONS: NotificationTypeEnum.Mention,
  FOLLOWS: NotificationTypeEnum.Follows,
  RECASTS: NotificationTypeEnum.Recasts,
  REPLIES: NotificationTypeEnum.Reply,
  LIKES: NotificationTypeEnum.Likes,
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
  );
};

const FormattedUsersText = ({ users }: { users: User[] }) => {
  if (users.length === 0) {
    return "Nobody";
  }

  const firstUserLink = (
    <PriorityLink href={`/s/${users[0].username}`} className="hover:underline text-slate-900">
      <b className="font-semibold">{users[0].display_name}</b>
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

const NotificationHeader = ({
  notification,
  relatedUsers,
  descriptionSuffix,
  maxAvatarsToDisplay = 8,
  leftIcon = null,
}: {
  notification: Notification;
  relatedUsers: User[];
  descriptionSuffix: string;
  maxAvatarsToDisplay?: number;
  leftIcon?: React.ReactNode;
}) => {
  const numAvatarsNotShown = Math.max(0, relatedUsers.length - maxAvatarsToDisplay);

  return (
    <div className="flex flex-col gap-2 flex-wrap items-start w-full">
      {relatedUsers.length > 0 && (
        <div className="flex gap-x-2 items-center mb-2 sm:pl-10 md:pl-12 md:overflow-x-auto pb-1">
          {leftIcon && (
            <span className="flex items-center justify-center text-red-500 mr-2 flex-shrink-0">{leftIcon}</span>
          )}
          {relatedUsers.slice(0, maxAvatarsToDisplay).map((user: User, i: number) => (
            <CastAvatar user={user} key={i} className="outline outline-2 outline-white flex-shrink-0 shadow-sm" />
          ))}
          {numAvatarsNotShown < 0 && (
            <div className="outline outline-2 outline-white rounded-full size-10 tracking-tighter text-gray-600 flex items-center justify-center bg-gray-100 text-xs font-semibold flex-shrink-0 shadow-sm">
              +{numAvatarsNotShown}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        <p className="text-base leading-[1.4] text-left m-0 p-0 sm:pl-10 md:pl-12 font-medium text-slate-700">
          <FormattedUsersText users={relatedUsers} />
          {` ${descriptionSuffix}`}
        </p>
      </div>
    </div>
  );
};

const MentionNotificationRow: NotificationRowProps = ({ notification, onSelect }) => {
  const mentionedByUser = notification.cast?.author ? [notification.cast.author] : [];

  return (
    <div className="flex flex-col gap-3">
      <NotificationHeader
        notification={notification}
        relatedUsers={mentionedByUser}
        descriptionSuffix="mentioned you"
      />
      <div className="ml-4 mt-1 w-full">
        <CastRow
          cast={notification.cast!}
          key={notification.cast!.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={false}
          hasReplies={false}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "15px",
            lineHeight: "1.4",
            color: "#0f172a",
            fontWeight: "400",
          }}
        />
      </div>
    </div>
  );
};

const FollowNotificationRow: NotificationRowProps = ({ notification, onSelect }) => {
  const newFollowers: User[] = notification.follows?.map((follow) => follow.user) ?? [];

  return (
    <NotificationHeader notification={notification} relatedUsers={newFollowers} descriptionSuffix="followed you" />
  );
};

const RecastNotificationRow: NotificationRowProps = ({ notification, onSelect }) => {
  const recastedByUsers = useMemo(() => {
    return (notification?.reactions || []).filter((r) => r.object === "recasts").map((r) => r.user);
  }, [notification?.reactions]);

  return (
    <div className="flex flex-col gap-3">
      <NotificationHeader
        notification={notification}
        relatedUsers={recastedByUsers}
        descriptionSuffix="recasted your cast"
      />
      <div className="ml-4 mt-1 w-full">
        <CastRow
          cast={notification.cast!}
          key={notification.cast!.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={false}
          hasReplies={false}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "15px",
            lineHeight: "1.4",
            color: "#0f172a",
            fontWeight: "400",
          }}
        />
      </div>
    </div>
  );
};

const QuoteNotificationRow: NotificationRowProps = ({ notification, onSelect }) => {
  const quotedByUser = notification.cast?.author ? [notification.cast.author] : [];

  return (
    <div className="flex flex-col gap-3">
      <NotificationHeader
        notification={notification}
        relatedUsers={quotedByUser}
        descriptionSuffix="quoted your cast"
      />
      <div className="ml-4 mt-1 w-full">
        <CastRow
          cast={notification.cast!}
          key={notification.cast!.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={false}
          hasReplies={false}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "15px",
            lineHeight: "1.4",
            color: "#0f172a",
            fontWeight: "400",
          }}
        />
      </div>
    </div>
  );
};

const ReplyNotificationRow: NotificationRowProps = ({ notification, onSelect }) => {
  const repliedByUser = notification.cast?.author ? [notification.cast.author] : [];

  return (
    <div className="flex flex-col gap-3">
      <NotificationHeader
        notification={notification}
        relatedUsers={repliedByUser}
        descriptionSuffix="replied to your cast"
      />
      <div className="ml-4 mt-1 w-full">
        <CastRow
          cast={notification.cast!}
          key={notification.cast!.hash}
          showChannel={false}
          isFocused={false}
          isEmbed={true}
          isReply={true}
          hasReplies={(notification?.cast?.replies?.count ?? 0) > 0}
          onSelect={onSelect}
          hideReactions={false}
          className="border-b-0 px-0 pb-0 hover:bg-transparent"
          castTextStyle={{
            fontSize: "15px",
            lineHeight: "1.4",
            color: "#0f172a",
            fontWeight: "400",
          }}
        />
      </div>
    </div>
  );
};

const LikeNotificationRow: NotificationRowProps = ({ notification, onSelect }) => {
  const fid = useCurrentFid();
  const likedByUsers = useMemo(() => {
    return (notification?.reactions || []).filter((r) => r.object === "likes").map((r) => r.user);
  }, [notification?.reactions]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onSelect(notification.cast!.hash, notification.cast!.author.username);
    },
    [notification.cast, onSelect]
  );

  return (
    <div className="flex flex-col gap-3">
      <NotificationHeader
        notification={notification}
        relatedUsers={likedByUsers}
        descriptionSuffix="liked your cast"
        leftIcon={<FaHeart className="w-4 h-4" aria-label="Like" />}
      />
      <div className="ml-4 mt-1 w-full cursor-pointer" onClick={handleClick}>
        <CastBody
          cast={notification.cast!}
          channel={null}
          isEmbed={false}
          showChannel={false}
          hideEmbeds={false}
          castTextStyle={{
            fontSize: "14px",
            color: "#64748b",
            lineHeight: "1.4",
            fontWeight: "400",
            textAlign: "left",
          }}
          hideReactions={false}
          renderRecastBadge={() => null}
          userFid={fid || undefined}
          isDetailView={false}
          onSelectCast={(hash) => onSelect(hash, notification.cast!.author.username)}
        />
      </div>
    </div>
  );
};

const NOTIFICATION_ROW_TYPE = {
  [NotificationTypeEnum.Mention]: MentionNotificationRow,
  [NotificationTypeEnum.Follows]: FollowNotificationRow,
  [NotificationTypeEnum.Recasts]: RecastNotificationRow,
  [NotificationTypeEnum.Quote]: QuoteNotificationRow,
  [NotificationTypeEnum.Reply]: ReplyNotificationRow,
  [NotificationTypeEnum.Likes]: LikeNotificationRow,
};

const NotificationRow: NotificationRowProps = ({ notification, onSelect, isUnseen = false }) => {
  const NotificationType = NOTIFICATION_ROW_TYPE[notification.type] || null;

  return NotificationType ? (
    <div
      className={
        isUnseen ? "bg-blue-50/80 transition-colors duration-1000 border-l-4 border-blue-400" : "bg-transparent transition-colors duration-1000"
      }
    >
      <div className="px-4 py-5 md:px-4 sm:px-5 xs:px-6 border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer transition-all duration-200 ease-out">
        <div className="max-w-2xl md:overflow-visible pb-2">
          <div className="min-w-full sm:px-2 xs:px-3">
            <NotificationType notification={notification} onSelect={onSelect} />
          </div>
        </div>
      </div>
    </div>
  ) : null;
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
  const [tab, setTab] = useState<string>(TAB_OPTIONS.ALL);
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

  const onTabChange = useCallback((value: string) => {
    setTab(value);
  }, []);

  const onSelectNotification = useCallback(
    (hash: string, username: string) => {
      router.push(`/homebase/c/${username}/${hash}`);
    },
    [router]
  );

  const filterByType = useCallback(
    (_notifications: Notification[]): Notification[] => {
      if (tab === TAB_OPTIONS.ALL) {
        return _notifications;
      }

      if (tab === TAB_OPTIONS.RECASTS) {
        return _notifications.filter(
          (notification) =>
            notification.type === NotificationTypeEnum.Recasts || notification.type === NotificationTypeEnum.Quote
        );
      }

      return _notifications.filter((notification) => notification.type === tab);
    },
    [tab]
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
    if (tab !== TAB_OPTIONS.ALL) return false;
    if (!mostRecentNotificationTimestamp) return false;
    if (!lastSeenNotificationDate) return true;

    return moment.utc(mostRecentNotificationTimestamp).isAfter(lastSeenNotificationDate);
  }, [tab, mostRecentNotificationTimestamp, lastSeenNotificationDate]);

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
    <div className="w-full min-h-screen">
      <Tabs value={tab} onValueChange={onTabChange} className="min-h-full">
        <div className="py-5 px-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold mb-4 md:mb-6 text-slate-900">Notifications</h1>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
            <TabsList className="grid min-w-[600px] md:min-w-fit w-full grid-cols-6 max-w-2xl bg-slate-100">
              <TabsTrigger value={TAB_OPTIONS.ALL} className="data-[state=active]:bg-white data-[state=active]:text-slate-900">All</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.MENTIONS} className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Mentions</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.FOLLOWS} className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Follows</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.RECASTS} className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Recasts</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.REPLIES} className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Replies</TabsTrigger>
              <TabsTrigger value={TAB_OPTIONS.LIKES} className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Likes</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value={tab} className="mt-0">
          <div className="relative overflow-hidden">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              {data?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {filterByType(page?.notifications ?? []).map((notification, pageItemIndex) => {
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
            <div ref={ref} className="h-[200px] flex items-center justify-center">
              {isFetching && (
                <div className="h-full w-full bg-slate-50/70 flex flex-col justify-center items-center rounded-lg mx-4 my-2">
                  <Loading />
                </div>
              )}
              {!isFetching && !hasNextPage && (
                <p className="text-slate-500 font-medium">There are no more notifications to display</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
