"use client";

import React from "react";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import { FEED_TYPES } from "@/fidgets/farcaster/feedConstants";

export const FeedTypeSelector: React.FC<{
  onChange: (value: string) => void;
  value: string;
  className?: string;
}> = ({ onChange, value, className }) => {
  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={FEED_TYPES}
      className={className}
    />
  );
};

export default FeedTypeSelector;
