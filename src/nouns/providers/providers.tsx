"use client";
import { ToastProvider } from "./toast";
import { TooltipProvider } from "@nouns/components/ui/tooltip";
import { TransactionListenerProvider } from "./TransactionListener";
import WhiskSdkProvider from "./WhiskSdkProvider";
import TanstackQueryProvider from "./TanstackQueryProvider";
import { WagmiProvider } from "wagmi";
import { Avatar } from "@paperclip-labs/whisk-sdk/identity";
import { ConnectKitProvider, Types } from "connectkit";
import { wagmiConfig } from "./wagmi-config";
import Link from "next/link";

const CustomAvatar = ({ address, size }: Types.CustomAvatarProps) => {
  if (!address) return null;

  return <Avatar address={address} size={size} />;
};
function Disclaimer() {
  return (
    <div>
      By connecting your wallet, you agree to the{" "}
      <Link href="/terms">Terms & Conditions</Link>.
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TanstackQueryProvider>
      <WagmiProvider config={wagmiConfig}>
        <WhiskSdkProvider>
          <ConnectKitProvider
            options={{
              customAvatar: CustomAvatar,
              disclaimer: <Disclaimer />,
            }}
            theme="nouns"
          >
            <ToastProvider>
              <TransactionListenerProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </TransactionListenerProvider>
            </ToastProvider>
          </ConnectKitProvider>
        </WhiskSdkProvider>
      </WagmiProvider>
    </TanstackQueryProvider>
  );
}
