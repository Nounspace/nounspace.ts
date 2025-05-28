import { WEBSITE_URL } from "@/constants/app";
import React from "react";
import "@/styles/globals.css";
import Providers from "@/common/providers";
import Sidebar from "@/common/components/organisms/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";
import { defaultFrame } from "@/common/lib/frames/metadata";

export const metadata = {
  title: "Nounspace",
  description:
    "The customizable web3 social app, built on Farcaster. Create, customize, and explore on Nounspace",
  openGraph: {
    siteName: "Nounspace",
    title: "Nounspace",
    type: "website",
    description:
      "The customizable web3 social app, built on Farcaster. Create, customize, and explore on Nounspace",
    images: {
      url: `${WEBSITE_URL}/images/nounspace_og_low.png`,
      type: "image/png",
      width: 1200,
      height: 737,
    },
    url: WEBSITE_URL,
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
  other: {
    "fc:frame": JSON.stringify(defaultFrame),
  },
};

// TO DO: Add global cookie check for a signature of a timestamp (within the last minute)
// And a public key. If valid, we can prerender as if it is that user signed in
// This will allow us to prerender some logged in state since we will know what user it is

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="fc:frame" content={JSON.stringify(defaultFrame)} />
      </Head>
      <body>
        <SpeedInsights />
        <Providers>{sidebarLayout(children)}</Providers>
      </body>
    </html>
  );
}

const sidebarLayout = (page: React.ReactNode) => {
  return (
    <>
      <div className="min-h-screen max-w-screen h-screen w-screen">
        <div className="flex w-full h-full">
          <div className="shrink-0 transition-all duration-100 ease-out z-10">
            <Sidebar />
          </div>
          <div className="flex-1">
            {page}
          </div>
        </div>
      </div>
    </>
  );
};
