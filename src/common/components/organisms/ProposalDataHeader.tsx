"use client";

import React, { useEffect } from "react";
import { useProposalContext } from "@/common/providers/ProposalProvider";
import { format } from "date-fns";
import { Address } from "viem";
import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";

const AddressDisplay = ({ address }: { address: Address }) => {
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  if (!address) {
    return <span className="text-gray-500">Loading...</span>;
  }

  const displayAddress = ensName || 
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <span className="text-blue-500 hover:underline cursor-pointer">
      {displayAddress}
    </span>
  );
};

const ProposalDataHeader: React.FC = () => {
  const { proposalData } = useProposalContext();
  console.log("DEBUG: proposalData", proposalData);
  
  if (!proposalData) {
    return (
      <div className="mt-2 flex items-center justify-between px-3 md:px-4 py-2 w-full border-r border-r-gray-200">
        <div>Loading proposal data...</div>
      </div>
    );
  }

  const { id, title } = proposalData;
  const proposer = proposalData.proposer?.id;
  const signers = proposalData.signers || [];
  
  // Format the created timestamp if available
  const proposalDate = proposalData.createdTimestamp 
    ? new Date(Number(proposalData.createdTimestamp) * 1000) 
    : new Date(); // Default to current date if not available
  
  const formattedDate = format(proposalDate, "MMM d");

  // Set the document title
  useEffect(() => {
    if (proposalData) {
      document.title = `Proposal ${id}: ${title}`;
    }
  }, [proposalData, id, title]);

  return (
    <div className="mt-2 flex flex-col md:flex-row items-start md:items-center justify-between px-3 md:px-4 py-2 w-full border-r-2 border-r-gray-200">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-black">⌐◨-◨ - Proposal {id}</h1>
        <div className="text-sm text-gray-500">
          Proposed by <AddressDisplay address={proposer} /> at {formattedDate}
          {signers && signers.length > 0 && (
            <>
              , sponsored by{" "}
              {signers.map((signer, index) => (
                <React.Fragment key={signer.id}>
                  {index > 0 && ", "}
                  <AddressDisplay address={signer.id} />
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDataHeader;
