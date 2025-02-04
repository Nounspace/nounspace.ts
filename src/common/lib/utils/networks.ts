import {
  EtherScanChainName,
  EtherScanChains,
} from "@/constants/etherscanChainIds";
import { undefined } from "zod";

export function getGeckoNetwork(network: EtherScanChainName) {
  return network === "polygon" ? "polygon_pos" : network;
}

export function getNetworkWithId(network?: EtherScanChainName) {
  if (!network) return undefined;
  return {
    id: EtherScanChains[network],
    name: network,
  };
}
