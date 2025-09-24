"use client";
import { formatEther, zeroAddress } from "viem";
import Settle from "./Settle";
import { Auction } from "@nouns/data/auction/types";
import { formatNumber } from "@nouns/utils/format";
import { AuctionDetailTemplate } from "./AuctionDetailsTemplate";
import { Button } from "../ui/button";
import { LinkExternal, LinkShallow } from "../ui/link";
import { CHAIN_CONFIG } from "@nouns/config";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Icon from "../ui/Icon";
import { mainnet } from "viem/chains";
import { BidHistoryDialog } from "./BidHistoryDialog";
import { Client } from "@nouns/data/ponder/client/getClients";
import Image from "next/image";
import { Avatar, Name } from "@paperclip-labs/whisk-sdk/identity";

export function EndedAuction({
  auction,
  clients,
}: {
  auction: Auction;
  clients: Client[];
}) {
  const winningBid = auction.bids[0];
  const client = clients.find((client) => client.id == winningBid?.clientId);

  const address = auction.nounderAuction
    ? CHAIN_CONFIG.addresses.noundersMultisig
    : (auction.bids[0]?.bidderAddress ?? zeroAddress);

  return (
    <>
      <AuctionDetailTemplate
        item1={{
          title: "Winning bid",
          value: auction.nounderAuction
            ? "n/a"
            : formatNumber({
                input: Number(
                  formatEther(
                    winningBid ? BigInt(winningBid.amount) : BigInt(0),
                  ),
                ),
                unit: "ETH",
              }),
        }}
        item2={{
          title: "Won by",
          value: (
            <div className="flex flex-row items-center gap-2">
              <LinkExternal
                href={
                  CHAIN_CONFIG.chain.blockExplorers?.default.url +
                  `/address/${address}`
                }
                className="flex min-w-0 items-center gap-2"
              >
                <div className="relative">
                  <Avatar
                    address={address}
                    size={36}
                    className="!h-[20px] !w-[20px] md:!h-[36px] md:!w-[36px]"
                  />
                  {client?.icon && (
                    <Image
                      src={client.icon}
                      width={16}
                      height={16}
                      alt="Auction client"
                      className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-background-primary md:h-[16px] md:w-[16px]"
                    />
                  )}
                </div>
                <Name address={address} />
              </LinkExternal>
              {auction.nounderAuction && (
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="circleInfo"
                      className="fill-content-secondary"
                      size={20}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-wrap bg-background-dark text-center">
                    All Noun auction proceeds go to the Nouns Treasury. The
                    founders ('Nounders'), are compensated with Nouns. Every
                    10th Noun for the first 5 years goes to their multisig
                    wallet.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ),
        }}
      />

      {auction.state == "ended-unsettled" && <Settle />}
      {auction.state == "ended-settled" && (
        <div className="flex w-full flex-col gap-2 md:flex-row md:gap-4">
          <LinkShallow
            searchParam={{ name: "nounId", value: auction.nounId }}
            className="md:w-[200px]"
            variant="secondary"
            size="default"
          >
            Noun profile
          </LinkShallow>

          <LinkExternal
            href={`${CHAIN_CONFIG.chain.blockExplorers?.default.url}/token/${CHAIN_CONFIG.addresses.nounsToken}?a=${auction.nounId}`}
            className="flex w-full hover:brightness-100 md:w-[200px]"
          >
            <Button variant="secondary" className="w-full">
              Etherscan
            </Button>
          </LinkExternal>
        </div>
      )}
      {auction.bids.length > 0 && (
        <BidHistoryDialog
          nounId={auction.nounId}
          bids={auction.bids}
          clients={clients}
        >
          Bid history ({auction.bids.length})
        </BidHistoryDialog>
      )}
    </>
  );
}
