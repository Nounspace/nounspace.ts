import { describe, expect, it, vi, beforeEach } from "vitest";

import { fetchDirectoryData } from "@/pages/api/token/directory";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";

vi.mock("@/common/lib/utils/fetchTokenData", () => ({
  fetchTokenData: vi.fn(async () => ({ decimals: 8 })),
}));

const mockedFetchTokenData = vi.mocked(fetchTokenData);

describe("token directory API", () => {
  beforeEach(() => {
    process.env.COVALENT_API_KEY = "test-key";
    vi.resetAllMocks();
  });

  it("aggregates holders with neynar profiles", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updated_at: "2024-06-01T00:00:00Z",
          contract_ticker_symbol: "TEST",
          contract_decimals: 6,
          items: [
            {
              address: "0x000000000000000000000000000000000000abcd",
              balance: "1234500",
              last_transferred_at: "2024-05-31T12:00:00Z",
              quote: 42,
            },
          ],
        },
      }),
    });

    const neynarMock = {
      fetchBulkUsersByEthOrSolAddress: vi.fn().mockResolvedValue({
        "0x000000000000000000000000000000000000abcd": [
          {
            fid: 123,
            username: "alice",
            display_name: "Alice",
            follower_count: 321,
            pfp_url: "https://example.com/alice.png",
          },
        ],
      }),
    };

    const result = await fetchDirectoryData(
      {
        network: "base",
        contractAddress: "0x000000000000000000000000000000000000ABCD",
        pageSize: 10,
      },
      {
        fetchFn: fetchMock,
        neynarClient: neynarMock as any,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(neynarMock.fetchBulkUsersByEthOrSolAddress).toHaveBeenCalledWith({
      addresses: ["0x000000000000000000000000000000000000abcd"],
    });
    expect(result.tokenSymbol).toBe("TEST");
    expect(result.tokenDecimals).toBe(6);
    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({
      address: "0x000000000000000000000000000000000000abcd",
      balanceFormatted: "1.2345",
      followers: 321,
      username: "alice",
      displayName: "Alice",
      pfpUrl: "https://example.com/alice.png",
      balanceQuoteUSD: 42,
    });
    expect(result.fetchContext).toEqual({
      network: "base",
      contractAddress: "0x000000000000000000000000000000000000abcd",
    });
    expect(mockedFetchTokenData).not.toHaveBeenCalled();
  });

  it("falls back to fetchTokenData when decimals missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          updated_at: "2024-06-01T00:00:00Z",
          contract_ticker_symbol: null,
          contract_decimals: null,
          items: [
            {
              address: "0x000000000000000000000000000000000000aaaa",
              balance: "100000000",
            },
          ],
        },
      }),
    });

    mockedFetchTokenData.mockResolvedValueOnce({ decimals: 8 } as any);

    const neynarMock = {
      fetchBulkUsersByEthOrSolAddress: vi.fn().mockResolvedValue({}),
    };

    const result = await fetchDirectoryData(
      {
        network: "polygon",
        contractAddress: "0x000000000000000000000000000000000000aaaa",
        pageSize: 5,
      },
      {
        fetchFn: fetchMock,
        neynarClient: neynarMock as any,
      },
    );

    expect(result.tokenDecimals).toBe(8);
    expect(mockedFetchTokenData).toHaveBeenCalled();
    expect(result.members[0].balanceFormatted).toBe("1");
  });
});
