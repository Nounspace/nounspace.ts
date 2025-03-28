"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnalyticsEvent } from "@/common/providers/AnalyticsProvider"; // Import analytics
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";

const ExploreCard = ({ post }) => {
  return (
    <Link
      onClick={() => {
        trackAnalyticsEvent(AnalyticsEvent.CLICK_EXPLORE_CARD, {
          slug: post.slug,
        });
      }}
      href={`/s/${post.slug}`}
      className="block border border-gray-300 rounded-lg overflow-hidden bg-[#FCFFF4] hover:shadow-md transition-all duration-100 ease-out hover:-translate-y-1"
    >
      <div className="h-36 w-full bg-gray-200 overflow-hidden relative">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover object-center"
        />
      </div>
      <div className="p-3">
        <h2 className="text-lg font-bold">@{post.title}</h2>
      </div>
    </Link>
  );
};

export default ExploreCard;
