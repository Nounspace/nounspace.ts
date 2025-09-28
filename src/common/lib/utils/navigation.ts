import { MiniKit } from "@worldcoin/minikit-js";

export const openWindow = (url: string) => {
  if (!url || typeof window === "undefined") return;

  if (MiniKit.isInstalled()) {
    window.location.href = url;
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

export const findParamInHashUrlPath = (url: string, param: string) => {
  return url
    .split("&")
    .find((item) => item.startsWith(param))
    ?.replace(`${param}=`, "");
};
