import { WEBSITE_URL } from "@/constants/app";
import React from "react";
import "@/styles/globals.css";
import Providers from "@/common/providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { defaultFrame } from "@/common/lib/frames/metadata";
import ClientMobileHeaderWrapper from "@/common/components/organisms/ClientMobileHeaderWrapper";
import ClientSidebarWrapper from "@/common/components/organisms/ClientSidebarWrapper";
import type { Metadata } from "next"; // Migrating next/head

export const metadata: Metadata = {
  title: "Nounspace",
  description: "The customizable web3 social app, built on Farcaster. Create, customize, and explore on Nounspace",
  openGraph: {
    siteName: "Nounspace",
    title: "Nounspace",
    type: "website",
    description: "The customizable web3 social app, built on Farcaster. Create, customize, and explore on Nounspace",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <div className="min-h-screen max-w-screen w-screen flex flex-col">
        {/* App Navigation Bar */}
        <div className="w-full flex-shrink-0 md:hidden">
          <ClientMobileHeaderWrapper />
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex w-full h-full flex-grow">
          <div className="transition-all duration-100 ease-out z-50 hidden md:block flex-shrink-0">
            <ClientSidebarWrapper />
          </div>
          {page}
        </div>
      </div>
    </>
  );
};
