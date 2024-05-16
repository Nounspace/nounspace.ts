import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import React from "react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/common/ui/templates/themeProvider";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import CommandPalette from "@/common/ui/components/CommandPalette";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { rainbowKitTheme, config } from "@/common/ui/templates/rainboxkit";
import Home from "@/common/ui/templates/home";
import Head from "next/head";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  const children = (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          <CommandPalette />
          <Home>
            <Component {...pageProps} />
          </Home>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );

  return (
    <>
      <Head>
        <title>Nounspace</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
}
