"use client";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";
import { Avatar, Name } from "@paperclip-labs/whisk-sdk/identity";
import clsx from "clsx";
import { useModal } from "../mocks/connectkit";
import { CHAIN_CONFIG } from "@nouns/config";

interface WalletButtonProps {
  disableMobileShrink?: boolean;
}

export default function WalletButton({
  disableMobileShrink,
}: WalletButtonProps) {
  const { isConnected, address, chain } = useAccount();
  const { setOpen: setOpenConnectModal, openSwitchNetworks } = useModal();

  if (!isConnected || !address) {
    return (
      <Button
        onClick={() => setOpenConnectModal(true)}
        variant="secondary"
        className="py-[10px]"
      >
        Connect
      </Button>
    );
  }

  if (chain?.id != CHAIN_CONFIG.chain.id) {
    return (
      <Button variant="negative" onClick={openSwitchNetworks}>
        Wrong Network
      </Button>
    );
  }

  return (
    <div className="flex flex-row gap-2">
      <Button
        variant="secondary"
        onClick={() => setOpenConnectModal(true)}
        className="flex flex-row gap-2 px-4 py-[6px]"
      >
        <Avatar address={address} size={32} />
        <Name
          address={address}
          className={clsx(
            "label-md md:block",
            !disableMobileShrink && "hidden",
          )}
        />
      </Button>
    </div>
  );
}
