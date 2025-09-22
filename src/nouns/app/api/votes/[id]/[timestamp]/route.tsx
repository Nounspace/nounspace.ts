import { getProposalVotesAfterTimestamp } from "@nouns/data/ponder/governance/getProposalVotesAfterTimestamp";

// Unfortunte workaround for nextjs bug with server actions from tanstack
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string; timestamp: string }> },
) {
  const params = await props.params;
  const votes = await getProposalVotesAfterTimestamp(
    Number(params.id),
    parseInt(params.timestamp),
  );
  return Response.json(votes);
}
