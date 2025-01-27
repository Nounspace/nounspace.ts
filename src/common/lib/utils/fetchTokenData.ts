export interface GeckoTokenAttribute {
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
  priceChange: string | null;
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
    attributes: GeckoTokenAttribute;
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

export async function fetchTokenData(
  tokenAddress: string,
  contractImage: string | null,
): Promise<GeckoTokenAttribute | null> {
  const baseUrl = "https://api.geckoterminal.com/api/v2";
  const network = "base";

  let priceChange: string | null = null;

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
      return null;
    }

    const result: GeckoTokenResponse = await response.json();
    console.log("GeckoTokenResponse:", result);
    const token = result.data.attributes;

    if (result.included && result.included.length > 0) {
      for (const pool of result.included) {
        if (pool.attributes && pool.attributes.price_change_percentage) {
          priceChange = pool.attributes.price_change_percentage.h24;
          break;
        }
      }
    }

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
      const totalSupply = token.total_supply;
      console.log("Total supply:", totalSupply);
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

    console.log("Token fetch data result:", { token });

    return {
      ...token,
      market_cap_usd: marketCap,
    };
  } catch (error) {
    console.error("Error fetching token data:", error);
    return null;
  }
}
