import { loadPosthogAnalytics } from "@/common/lib/analytics";
import CommandPalette from "@/common/ui/components/CommandPalette";
import Home from "@/common/ui/templates/home";
import { rainbowKitTheme, config } from "@/common/ui/templates/rainboxkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from "posthog-js/react";
import React from "react"
import { WagmiProvider } from "wagmi";

export const metadata = {
  title: 'Nounspace',
  description: 'Nounspace is a client for Farcaster',
  openGraph: {
    siteName: "Nounspace",
    title: "Nounspace",
    type: "website",
    description: "Nounspace is a client for Farcaster",
    images: {
      url: `${process.env.NEXT_PUBLIC_URL}/images/nounspace_og.png`,
      type: "image/png",
      width: 1200,
      height: 737,
    },
    url: process.env.NEXT_PUBLIC_URL,
  },
  icons: {
    icon: [
      {
        url: "/images/favicon.ico",
      },
      {
        url: "/images/favicon-32x32.png",
        sizes: "32x32",
      },
      {
        url: "/images/favicon-16x16.png",
        sizes: "16x16",
      },
    ],
    apple: "/images/apple-touch-icon.png",
  },
}

const posthog = loadPosthogAnalytics();

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider client={posthog}>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider theme={rainbowKitTheme}>
                <CommandPalette />
                <Home>
                  { children }
                </Home>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </PostHogProvider>  
      </body>
    </html>
  );
}
