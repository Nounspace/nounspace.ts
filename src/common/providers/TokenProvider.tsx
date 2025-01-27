import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Address } from "viem";
import {
  fetchTokenData,
  GeckoTokenAttribute,
} from "../lib/utils/fetchTokenData";
import { ClankerToken } from "../data/queries/clanker";

export interface MasterToken {
  geckoData: GeckoTokenAttribute | null;
  clankerData: ClankerToken | null;
}

interface TokenContextProps {
  tokenData: MasterToken | null;
  fetchTokenInfo: (address: string) => void;
  isLoading: boolean;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
  contractAddress?: Address;
  defaultTokenData?: MasterToken;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({
  children,
  contractAddress,
  defaultTokenData,
}) => {
  const [tokenData, setTokenData] = useState<MasterToken | null>(
    defaultTokenData || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchTokenInfo = async (address: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching token data...", address);
      const tokenResponse = await fetchTokenData(address, null);
      const clankerResponse = await fetch(
        `/api/clanker/ca?address=${address}`,
      ).then((res) => res.json());

      const combinedData: MasterToken = {
        geckoData: tokenResponse,
        clankerData: clankerResponse,
      };
      console.log("Token data fetched:", combinedData);
      setTokenData(combinedData);
    } catch (error) {
      console.error("Failed to fetch token data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loads if defaultTokenData is not provided
  useEffect(() => {
    if (!defaultTokenData) {
      fetchTokenInfo(contractAddress as Address);
    }
  }, []);

  return (
    <TokenContext.Provider value={{ tokenData, fetchTokenInfo, isLoading }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = (): TokenContextProps => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};
