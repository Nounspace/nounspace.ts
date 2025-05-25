export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import { ProposalProvider } from "@/common/providers/ProposalProvider";
import ProposalDefinedSpace from "../ProposalDefinedSpace";
import { loadProposalData } from "../utils";

export default async function WrapperProposalPrimarySpace({ params }) {
  const proposalId = params?.proposalId as string;
  const proposalData = await loadProposalData(proposalId || "0");

  // Fetch proposer FID using our API route
  let fid: number | null = null;
  try {
    const address = proposalData?.proposer?.id;
    if (address) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const res = await fetch(
        `${baseUrl}/api/farcaster/proposer-fid?address=${encodeURIComponent(address)}`,
        {
          method: "GET",
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (res.ok) {
        const data = await res.json();
        fid = data.proposerFid;
      } else {
        console.error(
          "[DEBUG] API error fetching proposer FID:",
          res.status,
          res.statusText
        );
      }
    }
  } catch (err) {
    console.error("[DEBUG] Error fetching proposer FID:", err);
  }
  // Only pass the props ProposalDefinedSpace actually expects
  const props = {
    proposalId,
    fid,
  };

  return (
    <ProposalProvider
      proposalId={proposalId as Address}
      defaultProposalData={proposalData}
    >
      <ProposalDefinedSpace {...props} />
    </ProposalProvider>
  );
}
