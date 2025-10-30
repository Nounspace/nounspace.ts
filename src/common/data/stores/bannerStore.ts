"use client";

import { create } from "zustand";

const loadClosedBanners = (): Set<string> => {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  const data = localStorage.getItem("closedBanners");
  return data ? new Set(JSON.parse(data)) : new Set();
};

const saveClosedBanners = (keys: Set<string>) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem("closedBanners", JSON.stringify(Array.from(keys)));
};

interface BannerState {
  closedBanners: Set<string>;
  isBannerClosed: (key: string) => boolean;
  closeBanner: (key: string) => void;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  closedBanners: loadClosedBanners(),
  isBannerClosed: (key: string) => get().closedBanners.has(key),
  closeBanner: (key: string) => {
    set((state) => {
      const newKeys = new Set(state.closedBanners);
      newKeys.add(key);
      saveClosedBanners(newKeys);
      return { closedBanners: newKeys };
    });
  },
}));
