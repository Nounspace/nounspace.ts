"use client";
import { ClipboardCopy } from "@nouns/components/ClipboardCopy";
import { Copy } from "lucide-react";
import { Address } from "viem";

const ITEMS: { name: string; link: string; address: Address }[] = [
  {
    name: "Base Token Address",
    link: "https://basescan.org/address/0x0a93a7be7e7e426fc046e204c44d6b03a302b631",
    address: "0x0a93a7be7e7e426fc046e204c44d6b03a302b631",
  },
  {
    name: "Mainnet Token Address",
    link: "https://etherscan.io/address/0x5c1760c98be951a4067df234695c8014d8e7619c#code",
    address: "0x5c1760c98be951a4067df234695c8014d8e7619c",
  },
];

export default function Ticker() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-14 px-6 md:px-10">
      <h2>The Ticker is $NOUNS</h2>
      <div className="flex w-full max-w-[640px] flex-col gap-4">
        {ITEMS.map((item) => (
          <ClipboardCopy
            className="flex w-full min-w-0 justify-between rounded-[16px] border px-6 py-4 transition-all hover:cursor-pointer hover:bg-background-secondary hover:brightness-100"
            key={item.name}
            copyContent={item.address}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="label-md">{item.name}</h3>
              <div className="overflow-hidden text-ellipsis underline">
                {item.address}
              </div>
            </div>
            <Copy className="stroke-content-secondary" size={24} />
          </ClipboardCopy>
        ))}
      </div>
    </section>
  );
}
