"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Address } from "viem";
import { ProposalData } from "@/fidgets/community/nouns-dao";

interface ProposalContextType {
  proposalId: Address;
  proposalData: ProposalData | null;
  setProposalData: (data: ProposalData) => void;
}

const ProposalContext = createContext<ProposalContextType | undefined>(
  undefined
);

interface ProposalProviderProps {
  proposalId: Address;
  defaultProposalData: ProposalData;
  children: ReactNode;
}

export const ProposalProvider: React.FC<ProposalProviderProps> = ({
  proposalId,
  defaultProposalData,
  children,
}) => {
  const [proposalData, setProposalData] =
    useState<ProposalData>(defaultProposalData);

  useEffect(() => {
    setProposalData(defaultProposalData);
  }, [defaultProposalData]);

  return (
    <ProposalContext.Provider
      value={{ proposalId, proposalData, setProposalData }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposalContext = (): ProposalContextType => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error(
      "useProposalContext must be used within a ProposalProvider"
    );
  }
  return context;
};
