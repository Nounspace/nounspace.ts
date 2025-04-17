import React from "react";
import { AlchemyNetwork } from "@/fidgets/ui/gallery";
import { CHAIN_OPTIONS } from "./AlchemyChainSelector";
import Link from "next/link";
import { formatEthereumAddress } from "@/common/lib/utils/ethereum";
import { Address } from "viem";

interface ScanAddressProps {
  address?: Address;
  chain?: AlchemyNetwork;
}

export default function ScanAddress({ address, chain }: ScanAddressProps) {
  const chainData = CHAIN_OPTIONS.find((c) => c.id === chain);

  // //console.log("chainData", chainData, "address", address, "chain", chain);

  if (!address || !chainData) return null;

  const scanUrl = `${chainData.scanUrl}/address/${address}`;

  return (
    <Link
      href={scanUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-700"
    >
      {formatEthereumAddress(address)}
    </Link>
  );
}
