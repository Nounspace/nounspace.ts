import React, { Suspense } from "react"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          { children }
        </Suspense>
      </body>
    </html>
  );
}
