"use client";

import React from "react";
import { OwnerType } from "@/common/data/api/etherscan";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MobileContractDefinedSpace } from "./MobileSpace";

export interface ContractDefinedSpaceProps {
  spaceId: string | null;
  tabName: string;
  contractAddress: string;
  pinnedCastId?: string;
  ownerId: string | number | null;
  ownerIdType: OwnerType;
}

const ContractDefinedSpace = (props: ContractDefinedSpaceProps) => {
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
      {isMobile ? (
        <MobileContractDefinedSpace contractAddress={props.contractAddress} />
      ) : (
        <div className="w-full">
          <DynamicDesktopContractDefinedSpace {...props} />
        </div>
      )}
    </>
  );
};

const DynamicDesktopContractDefinedSpace = dynamic(
  () => import("./DesktopContractDefinedSpace"),
  { ssr: false },
);

export default ContractDefinedSpace;
