import { Londrina_Solid } from "next/font/google";
import localFont from "next/font/local";
import Providers from "@nouns/providers/providers";
import ToastContainer from "@nouns/components/ToastContainer";
import TestnetBanner from "@nouns/components/TestnetBanner";
import Analytics from "@nouns/components/Analytics";
import MainLayout from "@nouns/app/(main)/layout";
import HomePage from "@nouns/app/(main)/(home)/page";

import "@paperclip-labs/whisk-sdk/styles.css";
import "@nouns/theme/globals.css";

const ptRootUiFont = localFont({
  src: [
    {
      path: "./app/fonts/pt-root-ui_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./app/fonts/pt-root-ui_medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./app/fonts/pt-root-ui_bold.woff2",
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

export type EmbeddedNounsAppProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function EmbeddedNounsApp({
  searchParams,
}: EmbeddedNounsAppProps) {
  const resolvedSearchParams = searchParams ?? {};

  return (
    <div className={`${ptRootUiFont.variable} ${londrinaSolidFont.variable}`}>
      <Providers>
        <div className="flex min-h-screen flex-col justify-between border-border-primary">
          <TestnetBanner />
          <MainLayout>
            {/* HomePage expects a promise for search params in the original app */}
            <HomePage searchParams={Promise.resolve(resolvedSearchParams)} />
          </MainLayout>
          <ToastContainer />
        </div>
        <Analytics />
      </Providers>
    </div>
  );
}
