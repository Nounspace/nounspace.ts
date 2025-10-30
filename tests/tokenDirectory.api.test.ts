import { describe, expect, it, vi, beforeEach } from "vitest";

import { fetchDirectoryData } from "@/pages/api/token/directory";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";

vi.mock("@/common/lib/utils/fetchTokenData", () => ({
  fetchTokenData: vi.fn(async () => ({ decimals: 0 })),
}));

const mockedFetchTokenData = vi.mocked(fetchTokenData);

describe("token directory API", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = "test-key";
    vi.resetAllMocks();
  });

  it("aggregates NFT owners with neynar profiles", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        owners: [
          {
            ownerAddress: "0x000000000000000000000000000000000000abcd",
            tokenBalances: [
              {
                tokenId: "0x1",
                balance: "0x2d3",
              },
            ],
          },
        ],
        contractMetadata: {
          symbol: "NFTEST",
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
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/nft/v3/test-key/getOwnersForContract"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "X-Alchemy-Token": "test-key",
        }),
      }),
    );
    expect(neynarMock.fetchBulkUsersByEthOrSolAddress).toHaveBeenCalledWith({
      addresses: ["0x000000000000000000000000000000000000abcd"],
    });
    expect(result.tokenSymbol).toBe("NFTEST");
    expect(result.tokenDecimals).toBe(0);
    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({
      address: "0x000000000000000000000000000000000000abcd",
      balanceFormatted: "723",
      followers: 321,
      username: "alice",
      displayName: "Alice",
      pfpUrl: "https://example.com/alice.png",
      lastTransferAt: null,
    });
    expect(result.fetchContext).toEqual({
      network: "base",
      contractAddress: "0x000000000000000000000000000000000000abcd",
    });
    expect(mockedFetchTokenData).not.toHaveBeenCalled();
  });

  it("paginates through NFT owners until page size reached", async () => {
    const firstResponse = {
      ok: true,
      json: async () => ({
        owners: [
          {
            ownerAddress: "0x000000000000000000000000000000000000aaaa",
            tokenBalances: [
              { tokenId: "0x1", balance: "0x1" },
              { tokenId: "0x2", balance: "0x1" },
            ],
          },
        ],
        pageKey: "next-page",
      }),
    };

    const secondResponse = {
      ok: true,
      json: async () => ({
        owners: [
          {
            ownerAddress: "0x000000000000000000000000000000000000bbbb",
            tokenBalances: null,
          },
        ],
      }),
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(firstResponse as any)
      .mockResolvedValueOnce(secondResponse as any);

    const neynarMock = {
      fetchBulkUsersByEthOrSolAddress: vi.fn().mockResolvedValue({}),
    };

    const result = await fetchDirectoryData(
      {
        network: "mainnet",
        contractAddress: "0x000000000000000000000000000000000000aaaa",
        pageSize: 2,
      },
      {
        fetchFn: fetchMock,
        neynarClient: neynarMock as any,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/nft/v3/test-key/getOwnersForContract",
    );
    expect(fetchMock.mock.calls[1][0]).toContain("pageKey=next-page");

    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toMatchObject({
      address: "0x000000000000000000000000000000000000aaaa",
      balanceRaw: "2",
      balanceFormatted: "2",
    });
    expect(result.members[1]).toMatchObject({
      address: "0x000000000000000000000000000000000000bbbb",
      balanceRaw: "0",
      balanceFormatted: "0",
    });
    expect(mockedFetchTokenData).not.toHaveBeenCalled();
  });
});
