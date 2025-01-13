import axios from "axios";
export interface TokenAttribute {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  coingecko_coin_id: string | null;
  total_supply: string;
  price_usd: string | null;
  fdv_usd: string | null;
  total_reserve_in_usd: string | null;
  volume_usd: {
    h24: string | null;
  };
  market_cap_usd: string | null;
}

interface RelationshipData {
  id: string;
  type: string;
}

interface Relationships {
  top_pools: {
    data: RelationshipData[];
  };
}

export interface GeckoTokenResponse {
  data: {
    id: string;
    type: string;
    attributes: TokenAttribute;
    relationships: Relationships;
  };
  included: {
    id: string;
    type: string;
    attributes: {
      price_change_percentage: {
        h24: string;
      };
      market_cap_usd: string | null;
    };
  }[];
}

async function fetchTotalSupplyFromEtherscan(
  tokenAddress: string,
): Promise<string | null> {
  const apiKey = process.env.ETHERSCAN_API_KEY!;
  const baseUrl = "https://api.etherscan.io/api";
  try {
    const response = await axios.get(baseUrl, {
      params: {
        module: "stats",
        action: "tokensupply",
        contractaddress: tokenAddress,
        apikey: apiKey,
      },
    });
    if (response.data.status === "1") {
      return response.data.result;
    } else {
      console.error(
        "Error fetching total supply from Etherscan:",
        response.data.message,
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching total supply from Etherscan:", error);
    return null;
  }
}

export async function fetchTokenData(
  tokenAddress: string,
  contractImage: string | null,
): Promise<{
  price: string | null;
  image: string | null;
  marketCap: string | null;
  priceChange: string | null;
  tokenName: string | null;
  tokenSymbol: string | null;
}> {
  const baseUrl = "https://api.geckoterminal.com/api/v2";
  const network = "base";

  try {
    const response = await fetch(
      `${baseUrl}/networks/${network}/tokens/${tokenAddress}?include=top_pools`,
      {
        headers: {
          accept: "application/json",
        },
      },
    );
    console.log("Response status:", response.status);
    if (!response.ok) {
      console.error("Error fetching token data:", response.statusText);
      return {
        price: null,
        image: null,
        marketCap: null,
        priceChange: null,
        tokenName: null,
        tokenSymbol: null,
      };
    }

    const result: GeckoTokenResponse = await response.json();
    console.log("GeckoTokenResponse:", result);
    const token = result.data.attributes;
    const priceChange =
      result.included[0]?.attributes.price_change_percentage.h24 || null;
    let marketCap = token.market_cap_usd || null;

    // Check included pools for market cap if not available in token attributes
    if (!marketCap) {
      for (const pool of result.included) {
        if (pool.attributes.market_cap_usd) {
          marketCap = pool.attributes.market_cap_usd;
          break;
        }
      }
    }

    // Calculate market cap if not available
    if (!marketCap && token.price_usd) {
      let totalSupply = token.total_supply;
      console.log("Total supply:", totalSupply);
      if (!totalSupply) {
        console.log("Fetching total supply from Etherscan...");
        totalSupply =
          (await fetchTotalSupplyFromEtherscan(tokenAddress)) || "0";
        console.log("Total supply from Etherscan:", totalSupply);
      }
      if (totalSupply) {
        const adjustedTotalSupply =
          parseFloat(totalSupply) / Math.pow(10, token.decimals);
        marketCap = (
          parseFloat(token.price_usd) * adjustedTotalSupply
        ).toString();
        console.log(
          "Calculated market cap:",
          marketCap,
          "USD",
          token.price_usd,
          adjustedTotalSupply,
        );
      }
    }

    let image = token.image_url;
    if (image === "missing.png") {
      image = contractImage || image;
    }

    console.log("Final result:", {
      price: token.price_usd || null,
      image: image || null,
      marketCap: marketCap,
      priceChange: priceChange,
      tokenName: token.name || null,
      tokenSymbol: token.symbol || null,
    });

    return {
      price: token.price_usd || null,
      image: image || null,
      marketCap: marketCap,
      priceChange: priceChange,
      tokenName: token.name || null,
      tokenSymbol: token.symbol || null,
    };
  } catch (error) {
    console.error("Error fetching token data:", error);
    return {
      price: null,
      image: null,
      marketCap: null,
      priceChange: null,
      tokenName: null,
      tokenSymbol: null,
    };
  }
}