/* eslint-disable @next/next/no-title-in-document-head */
import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="nounspace" />
        <meta property="og:site_name" content="nounspace" />
        <meta property="og:title" content="nounspace" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="nounspace is a customizable Farcaster client that offers a growing library of mini-apps called Fidgets. Create, customize, and explore on nounspace."
        />
        <meta property="og:image" content="/images/nounspace_og.png" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="737" />
        <meta property="og:url" content="https://app.nounspace.com" />
        <meta property="twitter:card" content="summary_large_image" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon-16x16.png"
        />
        <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
