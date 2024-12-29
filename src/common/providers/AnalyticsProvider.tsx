"use client";
import React, { ReactNode, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import { useCurrentFid } from "@/common/lib/hooks/useCurrentFid";

export enum AnalyticsEvent {
  CONNECT_WALLET = "Connect Wallet",
  SIGN_UP = "Sign Up",
  LINK_FID = "Link FID",
  CREATE_NEW_TAB = "Create New Tab",
  SAVE_SPACE_THEME = "Save Space Theme",
  SAVE_HOMEBASE_THEME = "Save Homebase Theme",
  ADD_FIDGET = "Add Fidget",
  EDIT_FIDGET = "Edit Fidget",
  CLICK_SPACE_FAIR_LAUNCH = "Click Space Fair Launch",
  CHANGE_TAB_NAME = "Change Tab Name",
  MUSIC_UPDATED = "Music Updated",
  CLICK_EXPLORE = "Explore Click",
  CLICK_HOMEBASE = "Click Homebase",
  CLICK_SEARCH = "Click Search",
  CLICK_NOTIFICATIONS = "Click Notifications",
  CLICK_MY_SPACE = "Click My Space",
  CLICK_CAST = "Click Cast",
  CLICK_EXPLORE_CARD = "Click Explore Card",
  CAST = "Cast",
  REPLY = "Reply",
  RECAST = "Recast",
  LIKE = "Like",
  PLAY = "Play",
  PAUSE = "Pause",
}

export type AnalyticsEventProperties = {
  [AnalyticsEvent.CONNECT_WALLET]: { hasNogs: boolean };
  [AnalyticsEvent.SIGN_UP]: Record<string, never>;
  [AnalyticsEvent.LINK_FID]: { fid: number };
  [AnalyticsEvent.CHANGE_TAB_NAME]: Record<string, never>;
  [AnalyticsEvent.SAVE_SPACE_THEME]: Record<string, never>;
  [AnalyticsEvent.SAVE_HOMEBASE_THEME]: Record<string, never>;
  [AnalyticsEvent.ADD_FIDGET]: { fidgetType: string };
  [AnalyticsEvent.CREATE_NEW_TAB]: Record<string, never>;
  [AnalyticsEvent.EDIT_FIDGET]: { fidgetType: string };
  [AnalyticsEvent.CLICK_SPACE_FAIR_LAUNCH]: Record<string, never>;
  [AnalyticsEvent.MUSIC_UPDATED]: { url: string };
  [AnalyticsEvent.CLICK_EXPLORE]: Record<string, never>;
  [AnalyticsEvent.CLICK_HOMEBASE]: Record<string, never>;
  [AnalyticsEvent.CLICK_SEARCH]: Record<string, never>;
  [AnalyticsEvent.CLICK_NOTIFICATIONS]: Record<string, never>;
  [AnalyticsEvent.CLICK_MY_SPACE]: Record<string, never>;
  [AnalyticsEvent.CLICK_CAST]: Record<string, never>;
  [AnalyticsEvent.CLICK_EXPLORE_CARD]: { slug: string };
  [AnalyticsEvent.CAST]: { username: string; castId: string };
  [AnalyticsEvent.REPLY]: { username: string; castId: string };
  [AnalyticsEvent.RECAST]: { username: string; castId: string };
  [AnalyticsEvent.LIKE]: { username: string; castId: string };
  [AnalyticsEvent.PLAY]: { url: string | string[] };
  [AnalyticsEvent.PAUSE]: { url: string | string[] };
};

const segment = new AnalyticsBrowser();

export const analytics = {
  track: <T extends keyof AnalyticsEventProperties>(
    eventName: T,
    properties?: AnalyticsEventProperties[T],
  ) => {
    try {
      segment.track(eventName, properties as Record<string, any>);
    } catch (e) {
      console.error(e);
    }
  },
  identify: (id?: string, properties?: any) => {
    try {
      segment.identify(id, properties);
    } catch (e) {
      console.error(e);
    }
  },
  page: () => {
    try {
      segment.page();
    } catch (e) {
      console.error(e);
    }
  },
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const fid = useCurrentFid();
  const identityPublicKey = useCurrentSpaceIdentityPublicKey();
  const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (writeKey) {
      segment.load({ writeKey }).catch((e) => {
        console.error(e);
      });
    }
  }, [writeKey]);

  useEffect(() => {
    if (identityPublicKey) {
      analytics.identify(identityPublicKey, { fid });
    }
  }, [identityPublicKey, fid]);

  useEffect(() => {
    analytics.page();
  }, [pathname, searchParams]);

  return children;
};

export default AnalyticsProvider;
