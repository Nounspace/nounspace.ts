import { LinkExternal } from "@nouns/components/ui/link";
import { Suspense } from "react";
import { Skeleton } from "@nouns/components/ui/skeleton";
import { getClients } from "@nouns/data/ponder/client/getClients";
import ClientStats from "./ClientStats";
import { Metadata } from "next";
import IndexerIssues from "@nouns/components/IndexerIssues";

export const metadata: Metadata = {
  alternates: {
    canonical: "./",
  },
};

export default function ClientsPage() {
  return (
    <>
      <div className="flex flex-col justify-between md:flex-row">
        <div>
          <h4>Client Stats</h4>
          <span>
            Data about clients earning{" "}
            <LinkExternal
              href="https://mirror.xyz/verbsteam.eth/28ONBDu7kti7cYBFBnEKgktxzuelvhuxu_jtGw9YrdU"
              className="underline"
            >
              Client incentives
            </LinkExternal>
            .
          </span>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-[800px] rounded-2xl" />}>
        <ClientsDataWrapper />
      </Suspense>
    </>
  );
}

async function ClientsDataWrapper() {
  const data = await getClients();

  if (data.length == 0) {
    return <IndexerIssues />;
  }

  return <ClientStats clients={data} />;
}

export const revalidate = 43200; // Half day
export const dynamic = "force-static";
