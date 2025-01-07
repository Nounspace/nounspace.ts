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
    };
  }[];
}

export async function fetchTokenData(
  tokenAddress: string,
): Promise<{
  price: string | null;
  image: string | null;
  marketCap: string | null;
  priceChange: string | null;
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
    if (response.ok) {
      const result: GeckoTokenResponse = await response.json();
      const token = result.data.attributes;
      const priceChange =
        result.included[0]?.attributes.price_change_percentage.h24 || null;
      console.log("result:", result);
      return {
        price: token.price_usd || null,
        image: token.image_url || null,
        marketCap: token.market_cap_usd || null,
        priceChange: priceChange,
      };
    } else {
      console.error("Error fetching token data:", response.statusText);
      return { price: null, image: null, marketCap: null, priceChange: null };
    }
  } catch (error) {
    console.error("Error fetching token data:", error);
    return { price: null, image: null, marketCap: null, priceChange: null };
  }
}
