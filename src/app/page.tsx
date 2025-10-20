import React from "react";
import type { Metadata } from "next";

import HomePage from "./home/HomePage";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nounspace — Explore Nouns",
    description:
      "Nounspace is a customizable social platform built by and for the Nouns DAO community. Create and share content and mini apps on Farcaster. Explore the nouniverse, bid on Nouns, participate in governance, and engage with the community. Customize your very own space and dashboard with Themes, Mini Apps, and Tabs.",
    alternates: { canonical: "https://nounspace.com/" },
    openGraph: {
      title: "Nounspace",
      description:
        "A customizable Farcaster client for Nouns DAO with spaces, themes, tabs, and fidgets.",
      url: "https://nounspace.com/",
      siteName: "Nounspace",
      images: [{ url: "https://nounspace.com/og.png" }],
    },
    twitter: { card: "summary_large_image", site: "@thenounspace" },
  };
}

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Nounspace</h1>
      <p className="sr-only">
        Explore Farcaster spaces, themes, tabs, and fidgets with the Nounspace community.
      </p>
      <HomePage defaultTabName="Nouns" />
    </>
  );
}
