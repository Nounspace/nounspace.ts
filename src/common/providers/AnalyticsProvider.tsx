"use client";
import React, { ReactNode, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import { useCurrentFid } from "@/common/lib/hooks/useCurrentFid";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";

const segment = new AnalyticsBrowser();

export const analytics = {
  track: (eventName: AnalyticsEvent, properties?: Record<string, any>) => {
    try {
      segment.track(eventName, properties);
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
  return (
    <Suspense fallback={null}>
      <AnalyticsProviderContent>{children}</AnalyticsProviderContent>
    </Suspense>
  );
};

const AnalyticsProviderContent: React.FC<{ children: ReactNode }> = ({
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
