import type { NextApiRequest, NextApiResponse } from "next";
import {
  ClankerManagerApiResponse,
  ClankerManagerTokenResult,
  ClankerUncollectedFeesResponse,
  determineClankerVersion,
  fetchEstimatedRewards,
  fetchTokensDeployedByAddress,
  fetchUncollectedFees,
} from "@/common/data/queries/clankerManager";

function parsePage(value: string | string[] | undefined): number {
  if (!value) return 1;
  const parsed = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(parsed, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseAddress(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClankerManagerApiResponse | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const address = parseAddress(req.query.address);
  const rewardRecipient = parseAddress(req.query.rewardRecipient);
  const page = parsePage(req.query.page);

  if (!address) {
    return res.status(400).json({ error: "address query parameter is required" });
  }

  try {
    const tokensResponse = await fetchTokensDeployedByAddress(address, page);

    const enriched: ClankerManagerTokenResult[] = await Promise.all(
      tokensResponse.data.map(async (token) => {
        const version = determineClankerVersion(token.type);
        const requiresRewardRecipient = version === "v4";
        const missingRewardRecipient = requiresRewardRecipient && !rewardRecipient;

        let estimatedRewardsUsd: number | null = null;
        let estimatedRewardsError: string | undefined;

        if (token.pool_address) {
          try {
            const estimated = await fetchEstimatedRewards(token.pool_address);
            estimatedRewardsUsd = Number.isFinite(estimated.userRewards)
              ? Number(estimated.userRewards)
              : null;
          } catch (error) {
            estimatedRewardsError = error instanceof Error ? error.message : "Failed to fetch estimated rewards";
          }
        } else {
          estimatedRewardsError = "Missing pool address";
        }

        let uncollectedFees: ClankerUncollectedFeesResponse | null = null;
        let uncollectedFeesError: string | undefined;

        if (!token.locker_address) {
          uncollectedFeesError = "Locker address unavailable";
        } else if (missingRewardRecipient) {
          uncollectedFeesError = "Reward recipient required for v4 tokens";
        } else {
          try {
            uncollectedFees = await fetchUncollectedFees({
              contractAddress: token.contract_address,
              rewardRecipientAddress: rewardRecipient,
              version,
            });
          } catch (error) {
            uncollectedFeesError =
              error instanceof Error ? error.message : "Failed to fetch uncollected fees";
          }
        }

        return {
          token,
          version,
          estimatedRewardsUsd,
          estimatedRewardsError,
          uncollectedFees,
          uncollectedFeesError,
          requiresRewardRecipient,
          missingRewardRecipient,
        } satisfies ClankerManagerTokenResult;
      }),
    );

    const payload: ClankerManagerApiResponse = {
      data: enriched,
      hasMore: tokensResponse.hasMore,
      total: tokensResponse.total,
      page,
      rewardRecipientAddress: rewardRecipient,
    };

    return res.status(200).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
