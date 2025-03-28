import { http } from "@wagmi/core";
import { ALCHEMY_API } from "./urls";

export const optimismHttp = http(
  `${ALCHEMY_API("opt")}v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
);
export const mainnetHttp = http(
  `${ALCHEMY_API("eth")}v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
);
export const baseHttp = http(
  `${ALCHEMY_API("base")}v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
);
