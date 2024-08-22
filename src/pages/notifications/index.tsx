import React, { useState, useMemo, useCallback, useEffect } from "react";
import useNotifications from "@/common/lib/hooks/useNotifications";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { FaCircleExclamation } from "react-icons/fa6";
import {
  Notification,
  NotificationTypeEnum,
  User,
} from "@neynar/nodejs-sdk/build/neynar-api/v2";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/atoms/tabs";
import { Alert, AlertDescription } from "@/common/components/atoms/alert";
import {
  CastAvatar,
  PriorityLink,
  CastBody,
  CastRow,
} from "@/fidgets/farcaster/components/CastRow";
import Loading from "@/common/components/molecules/Loading";
import { useInView } from "react-intersection-observer";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import {
  useNotificationsLastSeenCursor,
  useMutateNotificationsLastSeenCursor,
} from "@/common/lib/hooks/useNotificationsLastSeenCursor";
import moment from "moment";
import useDelayedValueChange from "@/common/lib/hooks/useDelayedValueChange";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { formatTimeAgo } from "@/common/lib/utils/date";

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
}: {
  notification: Notification;
  relatedUsers: User[];
  descriptionSuffix: string;
  maxAvatarsToDisplay?: number;
}) => {
  const numAvatarsNotShown = Math.max(
    0,
    relatedUsers.length - maxAvatarsToDisplay,
  );

  const relativeDateString = useMemo(() => {
    return formatTimeAgo(
      moment.utc(notification.most_recent_timestamp).toDate(),
    );
  }, [notification.most_recent_timestamp]);

  return (
    <div className="flex gap-2 flex-wrap">
      {relatedUsers.length > 0 ? (
        <div className="flex gap-x-1 pl-[20px]">
          {relatedUsers
            .slice(0, maxAvatarsToDisplay)
            .map((user: User, i: number) => (
              <CastAvatar
                user={user}
                key={i}
                className="ml-[-20px] outline outline-2 outline-white"
              />
            ))}
          {numAvatarsNotShown < 0 ? (
            <div className="ml-[-20px] outline outline-2 outline-white rounded-full size-10 tracking-tighter text-gray-500 flex items-center justify-center bg-gray-200 text-xs font-bold">
              +{numAvatarsNotShown}
            </div>
          ) : null}
        </div>
      ) : null}
      <div>
        <p className="text-base leading-[1.3]">
          <FormattedUsersText users={relatedUsers} />
          {` ${descriptionSuffix}`}
        </p>
        {relativeDateString && (
          <p className="tracking-tight text-sm leading-[1.3] truncate gap-1 text-foreground/60 font-normal">
            {relativeDateString}
          </p>
        )}
      </div>
    </div>
  );
};

const MentionNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  return (
    <CastRow
      cast={notification.cast!}
      key={notification.cast!.hash}
      showChannel={false}
      isFocused={false}
      isReply={false}
      hasReplies={false}
      onSelect={onSelect}
      hideReactions={false}
      className="border-b-0 px-0 py-0 hover:bg-transparent"
    />
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
  );
};

const ReplyNotificationRow: NotificationRowProps = ({
  notification,
  onSelect,
}) => {
  const fid = useCurrentFid();
  const replyHasReplies = (notification?.cast?.replies?.count ?? 0) > 0;
  const { data: replyingTo } = useLoadFarcasterUser(fid ?? -1);
  const replyingToUsername = replyingTo?.users?.length
    ? replyingTo.users[0].username
    : undefined;

  return (
    <CastRow
      cast={notification.cast!}
      key={notification.cast!.hash}
      showChannel={false}
      isFocused={false}
      isReply={true}
      hasReplies={replyHasReplies}
      onSelect={onSelect}
      hideReactions={false}
      replyingToUsername={replyingToUsername}
      className="border-b-0 p-0 hover:bg-transparent"
      castTextStyle={{
        fontSize: "16px",
      }}
    />
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
      />
      <CastBody
        cast={notification.cast!}
        channel={null}
        isEmbed={false}
        showChannel={false}
        hideEmbeds={false}
        castTextStyle={{}}
        hideReactions={false}
        renderRecastBadge={false}
        userFid={fid}
        isDetailView={false}
        onSelectCast={onSelect}
      />
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
  const [tab, setTab] = useState<string>(TAB_OPTIONS.ALL);
  const fid = useCurrentFid();
  const identityPublicKey = useCurrentSpaceIdentityPublicKey();
  const { data, error, fetchNextPage, hasNextPage, isFetching } =
    useNotifications(fid);
  const [ref, inView] = useInView({
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
    console.log("@TODO: navigateToCastDetail"); // TODO
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
