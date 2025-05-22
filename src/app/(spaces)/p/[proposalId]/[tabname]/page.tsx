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

  // Fetch proposer FID using Neynar bulk-by-address endpoint
  let proposerFid: number | null = null;
  try {
    const apiKey = process.env.NEYNAR_API_KEY || "<api-key>"; // Replace with your actual key or env var
    const address = proposalData?.proposer?.id;
    if (address) {
      const res = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
        { method: "GET", headers: { "x-api-key": apiKey } }
      );
      const data = await res.json();
      if (data && data[address] && data[address].length > 0) {
        proposerFid = data[address][0].fid;
      }
    }
  } catch (err) {
    console.error("[DEBUG] Error fetching proposer FID from Neynar:", err);
  }
  const props = {
    ...proposalData,
    proposalId,
    proposerFid,
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

