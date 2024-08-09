import "@/styles/globals.css";

import React from "react";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";
import Providers from "@/common/providers";
import Sidebar from "@/common/components/organisms/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";

export type NextPageWithLayout<P = any, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const sidebarLayout = (page: React.ReactElement) => {
  return (
    <>
      <div className="min-h-screen max-w-screen h-screen w-screen">
        <div className="flex w-full h-full">
          <div className="flex mx-auto transition-all duration-100 ease-out z-10">
            <Sidebar />
          </div>
          {page}
        </div>
      </div>
    </>
  );
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? sidebarLayout;

  return (
    <>
      <SpeedInsights />
      <Head>
        <title>Nounspace</title>
      </Head>
      <Providers>{getLayout(<Component {...pageProps} />)}</Providers>
    </>
  );
}
