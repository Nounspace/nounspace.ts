import "@/styles/globals.css";

import React from "react";
import type { AppProps } from "next/app";
import Home from "@/common/ui/templates/Home";
import Head from "next/head";
import Providers from "@/common/providers";
import { useRouter } from "next/router";


export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { pathname } = router;
  
  return (
    <>
      <Head>
        <title>Nounspace</title>
      </Head>
      <Providers>
        { pathname === "/login" ? 
          <Component {...pageProps} /> : 
          // <Home>
            <Component {...pageProps} />
          // </Home>
        }
      </Providers>
    </>
  );
}
