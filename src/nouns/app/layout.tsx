import { Londrina_Solid } from "next/font/google";
import localFont from "next/font/local";

import Providers from "@nouns/providers/providers";
import ToastContainer from "@nouns/components/ToastContainer";
import TestnetBanner from "@nouns/components/TestnetBanner";
import Analytics from "@nouns/components/Analytics";
import type { Metadata, Viewport } from "next";

import "@paperclip-labs/whisk-sdk/styles.css";
import "@nouns/theme/globals.css";
import { WithContext, WebSite } from "schema-dts";

const ptRootUiFont = localFont({
  src: [
    {
      path: "./fonts/pt-root-ui_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/pt-root-ui_medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/pt-root-ui_bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pt-root-ui",
});

const londrinaSolidFont = Londrina_Solid({
  weight: ["100", "300", "400", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-londrina-solid",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Nouns.com | Daily Nouns NFT Auctions & Nouns DAO Governance Hub",
  applicationName: "Nouns.com",
  description:
    "Discover, bid, and swap Nouns NFTs. Learn how Nouns DAO funds ideas and how $NOUNS tokens let you own a piece of the Nouns ecosystem.",
  metadataBase: new URL("https://www.nouns.com"),
  openGraph: {
    url: "https://www.nouns.com",
    siteName: "Nouns.com - Discover, Buy, and Swap Nouns from Nouns DAO",
    type: "website",
    locale: "en_US",
    title: "Nouns.com – One Noun Every Day, Forever",
    description:
      "The place for all things Nouns DAO.  Bid, buy, swap, vote and convert Nouns NFTs or $NOUNS tokens.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  appleWebApp: {
    title: "Nouns.com - Discover, Buy, and Swap Nouns from Nouns DAO",
    statusBarStyle: "default",
    capable: true,
  },
  keywords: [
    "Nouns",
    "Nouns DAO",
    "Nouns NFTs",
    "NFT",
    "NFT Auction",
    "Nouns Swap",
    "Nouns Marketplace",
    "Governance",
    "DeFi",
    "Ethereum",
    "NFT Marketplace",
    "Blockchain",
    "Decentralized Exchange",
    "Buy Nouns",
    "Swap Nouns",
    "Web3",
    "Crypto",
    "Paperclip Labs",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nouns.com",
    url: "https://www.nouns.com",
    description:
      "Nouns.com is the go-to platform for buying, selling, and swapping Nouns DAO NFTs.",
    publisher: {
      "@type": "Organization",
      name: "Nouns.com",
      url: "https://www.nouns.com",
      logo: "https://www.nouns.com/app-icon.jpeg",
    },
  };

  return (
    <html
      lang="en"
      className={`${ptRootUiFont.variable} ${londrinaSolidFont.variable} `}
    >
      <body className="overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <div className="flex min-h-screen flex-col justify-between border-border-primary">
            <TestnetBanner />
            {children}
          </div>
          <ToastContainer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
