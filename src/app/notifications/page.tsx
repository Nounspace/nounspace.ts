"use client";

import { Alert, AlertDescription } from "@/common/components/atoms/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import Loading from "@/common/components/molecules/Loading";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import useDelayedValueChange from "@/common/lib/hooks/useDelayedValueChange";
import useNotifications from "@/common/lib/hooks/useNotifications";
import {
  useMutateNotificationsLastSeenCursor,
  useNotificationsLastSeenCursor,
} from "@/common/lib/hooks/useNotificationsLastSeenCursor";
import {
  CastAvatar,
  CastBody,
  CastRow,
  PriorityLink,
} from "@/fidgets/farcaster/components/CastRow";
import {
  Notification,
  NotificationTypeEnum,
  User,
} from "@neynar/nodejs-sdk/build/api";
import moment from "moment";
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";
import { useInView } from "react-intersection-observer";
import { FaHeart } from "react-icons/fa";

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
  onSelect: (castHash: string) => void;
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
    <PriorityLink href={`/s/${users[0].username}`} className="hover:underline">
      <b>{users[0].display_name}</b>
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
  const numAvatarsNotShown = Math.max(
    0,
    relatedUsers.length - maxAvatarsToDisplay,
  );

  return (
    <div className="flex flex-col gap-1 flex-wrap items-start w-full">
      {relatedUsers.length > 0 && (
        <div className="flex gap-x-1 items-center mb-1 pl-4">
          {leftIcon && (
            <span className="flex items-center justify-center text-red-500 mr-1">
              {leftIcon}
            </span>
          )}
          {relatedUsers.slice(0, maxAvatarsToDisplay).map((user: User, i: number) => (
            <CastAvatar
              user={user}
              key={i}
              className="outline outline-2 outline-white"
            />
          ))}
          {numAvatarsNotShown < 0 && (
            <div className="outline outline-2 outline-white rounded-full size-10 tracking-tighter text-gray-500 flex items-center justify-center bg-gray-200 text-xs font-bold">
              +{numAvatarsNotShown}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        <p className="text-base leading-[1.3] text-left m-0 p-0 pl-4">
          <FormattedUsersText users={relatedUsers} />
          {` ${descriptionSuffix}`}
        </p>
      </div>
    </div>
  );
};

const MentionNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const mentionedByUser = notification.cast?.author ? [notification.cast.author] : [];

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={mentionedByUser}
        descriptionSuffix="mentioned you"
      />
      <div className="ml-4 w-full">
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
    notification.follows?.map((follow) => follow.user) ?? [];

  return (
    <NotificationHeader
      notification={notification}
      relatedUsers={newFollowers}
      descriptionSuffix="followed you"
    />
  );
};

const RecastNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const recastedByUsers = useMemo(() => {
    return (notification?.reactions || [])
      .filter((r) => r.object === "recasts")
      .map((r) => r.user);
  }, [notification?.reactions]);

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={recastedByUsers}
        descriptionSuffix="recasted your cast"
      />
      <div className="ml-4 w-full">
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
  const repliedByUser = notification.cast?.author ? [notification.cast.author] : [];

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={repliedByUser}
        descriptionSuffix="replied to your cast"
      />
      <div className="ml-4 w-full">
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
  const fid = useCurrentFid();
  const likedByUsers = useMemo(() => {
    return (notification?.reactions || [])
      .filter((r) => r.object === "likes")
      .map((r) => r.user);
  }, [notification?.reactions]);

  return (
    <div className="flex flex-col gap-2">
      <NotificationHeader
        notification={notification}
        relatedUsers={likedByUsers}
        descriptionSuffix="liked your cast"
        leftIcon={<FaHeart className="w-4 h-4" aria-label="Like" />}
      />
      <div className="ml-4 w-full">
        <CastBody
          cast={notification.cast!}
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
          onSelectCast={onSelect}
        />
      </div>
    </div>
  );
};

const NOTIFICATION_ROW_TYPE = {
  [NotificationTypeEnum.Mention]: MentionNotificationRow,
  [NotificationTypeEnum.Follows]: FollowNotificationRow,
  [NotificationTypeEnum.Recasts]: RecastNotificationRow,
  [NotificationTypeEnum.Reply]: ReplyNotificationRow,
  [NotificationTypeEnum.Likes]: LikeNotificationRow,
};

const NotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
  isUnseen = false,
}) => {
  const NotificationType = NOTIFICATION_ROW_TYPE[notification.type] || null;

  return NotificationType ? (
    <div
      className={
        isUnseen
          ? "bg-blue-50 transition-colors duration-1000"
          : "bg-transparent transition-colors duration-1000"
      }
    >
      <div className="px-4 py-4 border-b hover:bg-foreground/5 cursor-pointer transition duration-300 ease-out">
        <div className="max-w-2xl">
          <NotificationType notification={notification} onSelect={onSelect} />
        </div>
      </div>
    </div>
  ) : null;
};

const isNotificationUnseen = (
  notification: Notification,
  lastSeenNotificationDate?: moment.Moment | null,
): boolean | undefined => {
  if (lastSeenNotificationDate === undefined) return undefined;
  if (lastSeenNotificationDate === null) return true;

  return moment
    .utc(notification.most_recent_timestamp)
    .isAfter(lastSeenNotificationDate);
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
  const { data, error, fetchNextPage, hasNextPage, isFetching } =
    useNotifications(fid);
  const [ref] = useInView({
    skip: !hasNextPage || isFetching,
    onChange: (_inView) => {
      if (_inView) {
        fetchNextPage();
      }
    },
  });

  const { data: lastSeenNotificationTimestamp } =
    useNotificationsLastSeenCursor(fid, identityPublicKey);

  const { mutate: updateLastSeenCursor } = useMutateNotificationsLastSeenCursor(
    fid,
    identityPublicKey,
  );

  const onTabChange = useCallback((value: string) => {
    setTab(value);
  }, []);

  const onSelectNotification = useCallback(() => {
    // console.log("@TODO: navigateToCastDetail"); // TODO
  }, []);

  const filterByType = useCallback(
    (_notifications: Notification[]): Notification[] => {
      return tab === TAB_OPTIONS.ALL
        ? _notifications
        : _notifications.filter((notification) => notification.type === tab);
    },
    [tab],
  );

  const lastSeenNotificationDate = useMemo<
    moment.Moment | null | undefined
  >(() => {
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

    return moment
      .utc(mostRecentNotificationTimestamp)
      .isAfter(lastSeenNotificationDate);
  }, [tab, mostRecentNotificationTimestamp, lastSeenNotificationDate]);

  const updateNotificationsCursor = useCallback(() => {
    if (shouldUpdateNotificationsCursor && mostRecentNotificationTimestamp) {
      updateLastSeenCursor({
        lastSeenTimestamp: mostRecentNotificationTimestamp,
      });
    }
  }, [
    updateLastSeenCursor,
    mostRecentNotificationTimestamp,
    shouldUpdateNotificationsCursor,
  ]);

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
    },
  );

  return (
    <div className="w-full max-h-screen overflow-auto">
      <Tabs value={tab} onValueChange={onTabChange} className="min-h-full">
        <div className="py-4 px-4 border-b">
          <h1 className="text-xl font-bold mb-6">Notifications</h1>
          <TabsList className="grid w-full grid-cols-6 max-w-2xl">
            <TabsTrigger value={TAB_OPTIONS.ALL}>All</TabsTrigger>
            <TabsTrigger value={TAB_OPTIONS.MENTIONS}>Mentions</TabsTrigger>
            <TabsTrigger value={TAB_OPTIONS.FOLLOWS}>Follows</TabsTrigger>
            <TabsTrigger value={TAB_OPTIONS.RECASTS}>Recasts</TabsTrigger>
            <TabsTrigger value={TAB_OPTIONS.REPLIES}>Replies</TabsTrigger>
            <TabsTrigger value={TAB_OPTIONS.LIKES}>Likes</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={tab} className="mt-0">
          <div className="">
            <Suspense fallback={<div>Loading...</div>}>
              {data?.pages?.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {filterByType(page?.notifications ?? []).map(
                    (notification, pageItemIndex) => {
                      const isUnseen = isNotificationUnseen(
                        notification,
                        delayedLastSeenNotificationDate,
                      );
                      return (
                        <NotificationRow
                          notification={notification}
                          onSelect={onSelectNotification}
                          isUnseen={isUnseen}
                          key={`${pageIndex}-${pageItemIndex}`}
                        />
                      );
                    },
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
  );
}
