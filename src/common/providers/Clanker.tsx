import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { ClankerToken } from "../data/queries/clanker";
import { Address } from "viem";

interface ClankerContextProps {
  clankerData: ClankerToken | null;
  fetchClanker: (address: string) => void;
}

const ClankerContext = createContext<ClankerContextProps | undefined>(
  undefined,
);

interface ClankerProviderProps {
  children: ReactNode;
  contractAddress: Address;
}

export const ClankerProvider: React.FC<ClankerProviderProps> = ({
  children,
  contractAddress,
}) => {
  const [clankerData, setClankerData] = useState<ClankerToken | null>(null);

  const fetchClanker = async (address: string) => {
    try {
      // console.log("Fetching clanker...", address);
      const response = await axios.get(`/api/clanker/ca?address=${address}`);
      setClankerData(response.data);
    } catch (error) {
      console.error("Failed to fetch clanker data:", error);
    }
  };

  useEffect(() => {
    fetchClanker(contractAddress);
  }, [contractAddress]);

  return (
    <ClankerContext.Provider value={{ clankerData, fetchClanker }}>
      {children}
    </ClankerContext.Provider>
  );
};

export const useClanker = (): ClankerContextProps => {
  const context = useContext(ClankerContext);
  if (!context) {
    throw new Error("useClanker must be used within a ClankerProvider");
  }
  return context;
};
