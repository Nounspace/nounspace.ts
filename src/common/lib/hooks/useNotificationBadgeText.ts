import { useMemo } from "react";
import moment from "moment";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import useNotifications from "@/common/lib/hooks/useNotifications";
import useNotificationsLastSeenCursor from "@/common/lib/hooks/useNotificationsLastSeenCursor";
import useCurrentSpaceIdentityPublicKey from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";

/**
 * Computes notification badge count based on the first page of notifications and a
 * lastSeenNotificationCursor timestamp. If the number of unseen notifications
 * exceeds the first page, then "n+" is returned, where n is the page size.
 *
 * @returns {string | null} Notification badge count as a string, or null if none/loading.
 */
export const useNotificationBadgeText = (): string | null => {
  const fid = useCurrentFid();
  const identityPublicKey = useCurrentSpaceIdentityPublicKey();
  const { data, isFetched: isPageFetched, hasNextPage } = useNotifications(fid);
  const { data: lastSeenCursor, isFetched: isCursorFetched } =
    useNotificationsLastSeenCursor(fid, identityPublicKey);

  const isFetched = isPageFetched && isCursorFetched;

  return useMemo(() => {
    const hasNotifs = data?.pages?.length && data.pages[0].notifications.length;
    const hasCursor = typeof lastSeenCursor === "string";
    const firstPage = hasNotifs ? data.pages[0].notifications : [];

    if (!isFetched || !hasNotifs) {
      return null;
    }

    if (!hasCursor && hasNextPage) {
      return `${firstPage.length}+`;
    }

    if (!hasCursor && !hasNextPage) {
      return `${firstPage.length}`;
    }

    const lastSeenCursorDate = moment.parseZone(lastSeenCursor);
    let firstPageUnseenCount = 0;

    for (let i = 0; i < firstPage.length; i++) {
      const notifDate = moment.utc(firstPage[i].most_recent_timestamp);
      const notifSeen = notifDate.isSameOrBefore(lastSeenCursorDate);
      if (notifSeen) break;
      firstPageUnseenCount++;
    }

    if (firstPageUnseenCount === firstPage.length && hasNextPage) {
      return `${firstPage.length}+`;
    }

    if (firstPageUnseenCount > 0) {
      return `${firstPageUnseenCount}`;
    }

    return null;
  }, [data, lastSeenCursor, isFetched, hasNextPage]);
};

export default useNotificationBadgeText;
