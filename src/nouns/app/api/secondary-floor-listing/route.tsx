import { getSecondaryFloorListing } from "@nouns/data/noun/getSecondaryNounListings";

// Unfortunte workaround for nextjs bug with server actions from tanstack
export async function GET() {
  const secondaryFloorListing = await getSecondaryFloorListing();
  return Response.json(secondaryFloorListing);
}
