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
import { useLoadFarcasterConversation } from "@/common/data/queries/farcaster";

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
  maxAvatarsToDisplay = 5,
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

  return (
    <div>
      {relatedUsers.length > 0 ? (
        <div className="flex gap-x-1 flex-wrap mb-1">
          {relatedUsers
            .slice(0, maxAvatarsToDisplay)
            .map((user: User, i: number) => (
              <CastAvatar user={user} key={i} className="size-8" />
            ))}
          {numAvatarsNotShown > 0 ? (
            <div className="rounded-full size-8 tracking-tighter text-gray-500 flex items-center justify-center bg-gray-200 text-xs font-bold">
              +{numAvatarsNotShown}
            </div>
          ) : null}
        </div>
      ) : null}
      <p>
        <FormattedUsersText users={relatedUsers} />
        {` ${descriptionSuffix}`}
      </p>
    </div>
  );
};

const MentionNotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const mentionedByUsers = useMemo(() => {
    return notification?.cast?.author ? [notification?.cast?.author] : [];
  }, [notification?.cast?.author?.username]);

  // TODO
  const navigateToCastDetail = useCallback((castHash: string) => {
    console.log("@TODO: navigateToCastDetail");
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p>
        <FormattedUsersText users={mentionedByUsers} /> mentioned you
      </p>
      <CastRow
        cast={notification.cast!}
        key={notification.cast!.hash}
        showChannel={false}
        isFocused={false}
        isReply={false}
        hasReplies={false}
        onSelect={navigateToCastDetail}
        hideReactions={false}
        className="border-b-0 px-0 pb-0 pt-1 hover:bg-transparent"
      />
    </div>
  );
};

const FollowNotificationRow = ({
  notification,
}: {
  notification: Notification;
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

const RecastNotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const recastedByUsers = useMemo(() => {
    return (notification?.reactions || [])
      .filter((r) => r.object === "recasts")
      .map((r) => r.user);
  }, [notification?.reactions]);

  // TODO
  const navigateToCastDetail = useCallback((castHash: string) => {
    console.log("@TODO: navigateToCastDetail");
  }, []);

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
        isFocused={true}
        isEmbed={false}
        isReply={false}
        hasReplies={false}
        onSelect={navigateToCastDetail}
        hideReactions={false}
        className="border-b-0 px-0 pb-0 hover:bg-transparent"
        castTextStyle={{
          fontSize: "16px",
        }}
      />
    </div>
  );
};

const ReplyNotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const fid = useCurrentFid();
  const repliedByUsers = useMemo(() => {
    return notification?.cast?.author ? [notification?.cast?.author] : [];
  }, [notification?.cast?.author?.username]);

  const { data: conversatioData } = useLoadFarcasterConversation(
    notification.cast!.hash,
    fid ?? -1,
  );

  const parentCasts =
    conversatioData?.conversation?.chronological_parent_casts ?? [];
  const parentCast =
    parentCasts.length > 0 ? parentCasts[parentCasts.length - 1] : null;

  const replyHasReplies = (notification?.cast?.replies?.count ?? 0) > 0;

  // TODO
  const navigateToCastDetail = useCallback((castHash: string) => {
    console.log("@TODO: navigateToCastDetail");
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p>
        <FormattedUsersText users={repliedByUsers} />
        {` replied to your cast`}
      </p>
      {parentCast && (
        <CastRow
          cast={parentCast}
          key={parentCast.hash}
          showChannel={false}
          isFocused={false}
          isReply={parentCasts.length > 1}
          hasReplies={true}
          onSelect={navigateToCastDetail}
          hideReactions={false}
          className="border-b-0 px-0 hover:bg-transparent"
          maxLines={1}
          hideEmbeds={false}
        />
      )}
      <CastRow
        cast={notification.cast!}
        key={notification.cast!.hash}
        showChannel={false}
        isFocused={true}
        isReply={true}
        hasReplies={replyHasReplies}
        onSelect={navigateToCastDetail}
        hideReactions={false}
        className="border-b-0 p-0"
        castTextStyle={{
          fontSize: "16px",
        }}
      />
    </div>
  );
};

const LikeNotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const fid = useCurrentFid();
  const likedByUsers = useMemo(() => {
    return (notification?.reactions || [])
      .filter((r) => r.object === "likes")
      .map((r) => r.user);
  }, [notification?.reactions]);

  // TODO
  const navigateToCastDetail = useCallback((castHash: string) => {
    console.log("@TODO: navigateToCastDetail");
  }, []);

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
        hideReactions={true}
        renderRecastBadge={false}
        userFid={fid}
        isDetailView={false}
        onSelectCast={navigateToCastDetail}
        maxLines={1}
      />
    </div>
  );
};

const NOTIFICATION_COMPONENT_BY_TYPE = {
  [NotificationTypeEnum.Mention]: MentionNotificationRow,
  [NotificationTypeEnum.Follows]: FollowNotificationRow,
  [NotificationTypeEnum.Recasts]: RecastNotificationRow,
  [NotificationTypeEnum.Reply]: ReplyNotificationRow,
  [NotificationTypeEnum.Likes]: LikeNotificationRow,
};

const TAB_OPTIONS = {
  ALL: "all",
  MENTIONS: NotificationTypeEnum.Mention,
  FOLLOWS: NotificationTypeEnum.Follows,
  RECASTS: NotificationTypeEnum.Recasts,
  REPLIES: NotificationTypeEnum.Reply,
  LIKES: NotificationTypeEnum.Likes,
};

const NotificationRow = ({ notification }: { notification: Notification }) => {
  const NotificationType =
    NOTIFICATION_COMPONENT_BY_TYPE[notification.type] || null;

  return NotificationType ? (
    <div className="px-4 py-3 border-b hover:bg-foreground/5 cursor-pointer transition duration-300 ease-out">
      <NotificationType notification={notification} />
    </div>
  ) : null;
};

export default function NotificationsPage() {
  const [tab, setTab] = useState<string>(TAB_OPTIONS.ALL);
  const [ref, inView] = useInView();
  const fid = useCurrentFid();
  const { data, error, fetchNextPage, hasNextPage, isFetching } =
    useNotifications(fid);

  console.log(`NOTIFICATIONS:`, data);

  const onTabChange = useCallback((value: string) => {
    setTab(value);
  }, []);

  const filterByType = useCallback(
    (_notifications: Notification[]): Notification[] => {
      return tab === TAB_OPTIONS.ALL
        ? _notifications
        : _notifications.filter((notification) => notification.type === tab);
    },
    [tab],
  );

  useEffect(() => {
    if (inView && !isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isFetching, hasNextPage]);

  return (
    <div className="w-full max-h-screen overflow-auto">
      <Tabs
        value={tab}
        onValueChange={onTabChange}
        className="max-w-screen-sm mx-auto border-x min-h-full"
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-6">Notifications</h1>
          <TabsList className="grid w-full grid-cols-6">
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
                    return (
                      <NotificationRow
                        notification={notification}
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
            <div ref={ref} className="h-[200px]">
              {isFetching && (
                <div className="h-full w-full bg-foreground/5 flex flex-col justify-center items-center">
                  <Loading />
                </div>
              )}
              {!isFetching && !hasNextPage && (
                <p>{`You've reached the end of this list.`}</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
