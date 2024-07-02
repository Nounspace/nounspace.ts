"use client";
import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";

export enum AnalyticsEvent {
  SIGN_UP = "Sign Up",
  LINK_FID = "Link FID",
  SAVE_SPACE_THEME = "Save Space Theme",
  SAVE_HOMEBASE_THEME = "Save Homebase Theme",
  ADD_FIDGET = "Add Fidget",
  EDIT_FIDGET = "Edit Fidget",
  CLICK_SPACE_FAIR_LAUNCH = "Click Space Fair Launch",
}

type AnalyticsEventProperties = {
  [AnalyticsEvent.SIGN_UP]: Record<string, never>;
  [AnalyticsEvent.LINK_FID]: Record<string, never>;
  [AnalyticsEvent.SAVE_SPACE_THEME]: Record<string, never>;
  [AnalyticsEvent.SAVE_HOMEBASE_THEME]: Record<string, never>;
  [AnalyticsEvent.ADD_FIDGET]: { fidgetType: string };
  [AnalyticsEvent.EDIT_FIDGET]: { fidgetType: string };
  [AnalyticsEvent.CLICK_SPACE_FAIR_LAUNCH]: Record<string, never>;
};

const segment = new AnalyticsBrowser();

export const analytics = {
  track: <T extends AnalyticsEvent>(
    eventName: T,
    properties?: AnalyticsEventProperties[T],
  ) => {
    segment.track(eventName, properties);
  },
  identify: (id: string) => {
    segment.identify(id);
  },
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const userId = useCurrentSpaceIdentityPublicKey();
  const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;

  useEffect(() => {
    if (writeKey) {
      segment.load({ writeKey }).catch((e) => {
        console.error(e);
      });
    }
  }, [writeKey]);

  useEffect(() => {
    if (userId) {
      analytics.identify(userId);
    }
  }, [userId]);

  useEffect(() => {
    segment.page();

    const handleRouteChange = () => {
      segment.page();
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return children;
};

export default AnalyticsProvider;
