import "@/styles/globals.css";

import React from "react";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";
import Providers from "@/common/providers";

export type NextPageWithLayout<P = any, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <title>Nounspace</title>
      </Head>
      <Providers>{getLayout(<Component {...pageProps} />)}</Providers>
    </>
  );
}
