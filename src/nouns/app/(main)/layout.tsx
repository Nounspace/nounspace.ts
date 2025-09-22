import { Header } from "@nouns/components/Header";
import Footer from "@nouns/components/Footer";
import MobileNav from "@nouns/components/Nav/MobileNav";
import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import { getSecondaryFloorListing } from "@nouns/data/noun/getSecondaryNounListings";
import NounDialog from "@nouns/components/dialog/NounDialog";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex grow items-start justify-center">{children}</main>
      <Footer />
      <MobileNav />
      <Suspense fallback={null}>
        <NounsDialogWrapper />
      </Suspense>
    </>
  );
}

async function NounsDialogWrapper() {
  const [allNouns, secondaryFloorListing] = await Promise.all([
    getAllNouns(),
    getSecondaryFloorListing(),
  ]);
  return (
    <NounDialog
      nouns={allNouns}
      secondaryFloorListing={secondaryFloorListing}
    />
  );
}
