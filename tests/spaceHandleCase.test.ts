import { describe, expect, it, vi, beforeEach } from "vitest";
import { getUserMetadata } from "@/app/(spaces)/s/[handle]/utils";
import neynar from "@/common/data/api/neynar";

vi.mock("@/common/data/api/neynar", () => ({
  default: {
    lookupUserByUsername: vi.fn(),
  },
}));

describe("getUserMetadata", () => {
  const lookupUserByUsername = vi.mocked(neynar.lookupUserByUsername);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes handles to lowercase before looking up user metadata", async () => {
    lookupUserByUsername.mockResolvedValue({
      user: {
        fid: 123,
        username: "moruf88",
        display_name: "Moruf",
        pfp_url: "https://example.com/pfp.png",
        profile: {
          bio: { text: "Testing bio" },
        },
      },
    } as any);

    const metadata = await getUserMetadata("MoRuf88");

    expect(lookupUserByUsername).toHaveBeenCalledWith({ username: "moruf88" });
    expect(metadata).toEqual({
      fid: 123,
      username: "moruf88",
      displayName: "Moruf",
      pfpUrl: "https://example.com/pfp.png",
      bio: "Testing bio",
    });
  });
});
