import { getSecondaryTopOffer } from "@nouns/data/noun/getSecondaryNounListings";

// Unfortunte workaround for nextjs bug with server actions from tanstack
export async function GET() {
  const secondaryTopOffer = await getSecondaryTopOffer();
  return Response.json(secondaryTopOffer);
}
