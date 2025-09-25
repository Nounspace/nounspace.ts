"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { ProposalData } from "@/app/(spaces)/p/[proposalId]/utils";

interface ProposalContextProps {
  proposalData: ProposalData | null;
  fetchProposalInfo: (proposalId: string) => Promise<void>;
  isLoading: boolean;
}

const ProposalContext = createContext<ProposalContextProps | undefined>(undefined);

interface ProposalProviderProps {
  children: ReactNode;
  proposalId: string;
  defaultProposalData?: ProposalData;
}

export const fetchProposalData = async (proposalId: string): Promise<ProposalData | null> => {
  try {
    const response = await fetch(`/api/proposal/${proposalId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch proposal: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch proposal data:", error);
    return null;
  }
};

export const ProposalProvider: React.FC<ProposalProviderProps> = ({
  children,
  proposalId,
  defaultProposalData,
}) => {
  const [proposalData, setProposalData] = useState<ProposalData | null>(
    defaultProposalData || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchProposalInfo = useCallback(async (proposalId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await fetchProposalData(proposalId);
      setProposalData(data);
    } catch (error) {
      console.error("Failed to fetch proposal data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Loads if defaultProposalData is not provided
  useEffect(() => {
    if (!defaultProposalData) {
      fetchProposalInfo(proposalId);
    }
  }, [proposalId, fetchProposalInfo]);

  return (
    <ProposalContext.Provider value={{ proposalData, fetchProposalInfo, isLoading }}>
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposal = (): ProposalContextProps => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposal must be used within a ProposalProvider");
  }
  return context;
};
