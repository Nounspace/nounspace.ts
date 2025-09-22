import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@nouns/components/ui/dialogBase";
import { Bid } from "@nouns/data/auction/types";
import { formatEther } from "viem";
import { ReactNode } from "react";
import { LinkExternal } from "../ui/link";
import { CHAIN_CONFIG } from "@nouns/config";
import { formatNumber } from "@nouns/utils/format";
import { Client } from "@nouns/data/ponder/client/getClients";
import Image from "next/image";
import { Avatar, Name } from "../../mocks/whisk-sdk-identity";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@nouns/components/ui/DrawerDialog";

interface BidHistoryDialogProps {
  nounId: string;
  bids: Bid[];
  children: ReactNode;
  clients: Client[];
}

export function BidHistoryDialog({
  children,
  nounId,
  bids,
  clients,
}: BidHistoryDialogProps) {
  return (
    <DrawerDialog>
      <DrawerDialogTrigger className="flex self-center text-content-secondary underline label-sm clickable-active hover:brightness-75 md:self-start">
        {children}
      </DrawerDialogTrigger>
      <DrawerDialogContent className="md:max-h-[80vh] md:max-w-[min(425px,95vw)]">
        <DrawerDialogContentInner className="p-0">
          <DrawerDialogTitle className="shadow-bottom-only w-full p-6 pb-2 heading-4">
            Bids for Noun {nounId}
          </DrawerDialogTitle>
          <div className="flex w-full flex-col overflow-y-auto">
            {bids.map((bid, i) => {
              const date = new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(Number(bid.timestamp) * 1000);

              const client = clients.find(
                (client) => client.id == bid.clientId,
              );

              return (
                <LinkExternal
                  key={i}
                  className="flex w-full min-w-0 items-center justify-between gap-2 px-6 py-3 label-lg hover:bg-background-secondary hover:brightness-100"
                  href={`${CHAIN_CONFIG.chain.blockExplorers?.default.url}/tx/${bid.transactionHash}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="relative">
                      <Avatar address={bid.bidderAddress} size={40} />
                      {client?.icon && (
                        <Image
                          src={client.icon}
                          width={16}
                          height={16}
                          alt="Nouns DAO Client"
                          className="absolute bottom-0 right-0 rounded-full bg-background-primary"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <Name address={bid.bidderAddress} />
                      <span className="text-content-secondary paragraph-sm">
                        {date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="shrink-0 pl-6 text-content-secondary">
                      {formatNumber({
                        input: Number(formatEther(BigInt(bid.amount))),
                        unit: "Ξ",
                      })}
                    </span>
                  </div>
                </LinkExternal>
              );
            })}
          </div>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
