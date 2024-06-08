export const WARPCAST_API = "https://api.warpcast.com";

const optimismUrl = `https://opt-mainnet.g.alchemy.com/`;
const mainnetUrl = `https://eth-mainnet.g.alchemy.com/`;
const baseUrl = `https://base-mainnet.g.alchemy.com/`;
export function ALCHEMY_API(network: "base" | "opt" | "eth") {
  let url: string;
  if (network === "base") {
    url = baseUrl;
  } else if (network === "opt") {
    url = optimismUrl;
  } else {
    url = mainnetUrl;
  }
  return `${url}`;
}
