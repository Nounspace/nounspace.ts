"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ProposalData } from "@/fidgets/community/nouns-dao";

export interface ProposalPageSpaceProps {
  spaceId?: string | null;
  tabName?: string | null;
  proposalId: string | null;
  ownerId?: string | null;
  proposalData?: ProposalData;
  owningIdentities?: string[];
}
const ProposalDefinedSpace = (props: ProposalPageSpaceProps) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* {isMobile ? (
        <MobileContractDefinedSpace {...props} />
      ) : ( */}
      <div className="w-full">
        <DynamicDesktopContractDefinedSpace {...props} />
      </div>
      {/* )} */}
    </>
  );
};

const DynamicDesktopContractDefinedSpace = dynamic(
  () => import("./DesktopProposalDefinedSpace"),
  { ssr: false }
);

export default ProposalDefinedSpace;
