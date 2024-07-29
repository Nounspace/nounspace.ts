import { WEBSITE_URL } from "@/constants/app";
import React, { Suspense } from "react";

export const metadata = {
  title: "Nounspace",
  description:
    "The customizable web3 social app, built on Farcaster. Create, customize, and explore on nounspace",
  openGraph: {
    siteName: "Nounspace",
    title: "Nounspace",
    type: "website",
    description:
      "The customizable web3 social app, built on Farcaster. Create, customize, and explore on nounspace",
    images: {
      url: `${WEBSITE_URL}/images/nounspace_og.png`,
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
