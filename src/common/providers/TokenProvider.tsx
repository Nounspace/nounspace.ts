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
import { ClankerToken, fetchClankerByAddress } from "../data/queries/clanker";

interface MasterToken extends GeckoTokenAttribute, ClankerToken {}

interface TokenContextProps {
  tokenData: MasterToken | null;
  fetchTokenInfo: (address: string) => void;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
  contractAddress?: Address;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({
  children,
  contractAddress,
}) => {
  const [tokenData, setTokenData] = useState<MasterToken | null>(null);

  const fetchTokenInfo = async (address: string) => {
    try {
      console.log("Fetching token data...", address);
      const tokenResponse = await fetchTokenData(address, null);
      const clankerResponse = await fetch(
        `/api/clanker/ca?address=${address}`,
      ).then((res) => res.json());
      const combinedData: MasterToken = {
        address: address,
        name: tokenResponse.tokenName || clankerResponse?.name || "",
        symbol: tokenResponse.tokenSymbol || clankerResponse?.symbol || "",
        decimals: tokenResponse.decimals || 0,
        image_url: tokenResponse.image || clankerResponse?.img_url || "",
        coingecko_coin_id: tokenResponse.coingecko_coin_id || null,
        total_supply: tokenResponse.total_supply || "",
        price_usd: tokenResponse.price || null,
        fdv_usd: tokenResponse.fdv_usd || null,
        total_reserve_in_usd: tokenResponse.total_reserve_in_usd || null,
        volume_usd: {
          h24: tokenResponse.volume_usd?.h24 || null,
        },
        market_cap_usd: tokenResponse.marketCap || null,
        // from clanker
        id: clankerResponse?.id || 0,
        created_at: clankerResponse?.created_at || "",
        tx_hash: clankerResponse?.tx_hash || "",
        contract_address: clankerResponse?.contract_address || "",
        requestor_fid: clankerResponse?.requestor_fid || null,
        img_url: clankerResponse?.img_url || "",
        pool_address: clankerResponse?.pool_address || "",
        cast_hash: clankerResponse?.cast_hash || null,
        type: clankerResponse?.type || null,
        pair: clankerResponse?.pair || null,
      };
      console.log("Token data fetched:", combinedData);
      setTokenData(combinedData);
    } catch (error) {
      console.error("Failed to fetch token data:", error);
    }
  };

  useEffect(() => {
    fetchTokenInfo(contractAddress as Address);
  }, [contractAddress]);

  return (
    <TokenContext.Provider value={{ tokenData, fetchTokenInfo }}>
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
