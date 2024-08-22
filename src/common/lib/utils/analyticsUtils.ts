// src/common/lib/analyticsUtils.ts

import {
  analytics,
  AnalyticsEventProperties,
} from "@/common/providers/AnalyticsProvider";

export const trackAnalyticsEvent = <T extends keyof AnalyticsEventProperties>(
  eventName: T,
  properties?: AnalyticsEventProperties[T],
) => {
  console.log(`${eventName} event tracked with properties:`, properties);
  analytics.track(eventName, properties);
  console.log(`${eventName} event tracked with properties:`, properties);
};
