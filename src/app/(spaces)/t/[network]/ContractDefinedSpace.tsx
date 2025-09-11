"use client"

import React from "react"
import { OwnerType } from "@/common/data/api/etherscan"
import dynamic from "next/dynamic"

export interface ContractDefinedSpaceProps {
  spaceId: string | null
  tabName: string
  contractAddress: string
  pinnedCastId?: string
  ownerId: string | number | null
  ownerIdType: OwnerType
  owningIdentities?: string[]
}

const ContractDefinedSpace = ({ 
  owningIdentities = [], 
  ...otherProps 
}: ContractDefinedSpaceProps) => {

  return (
    <div className="w-full">
      <DynamicDesktopContractDefinedSpace 
        owningIdentities={owningIdentities}
        {...otherProps} 
      />
    </div>
  )
}

const DynamicDesktopContractDefinedSpace = dynamic(
  () => import("./DesktopContractDefinedSpace"),
  { ssr: false }
)

export default ContractDefinedSpace
