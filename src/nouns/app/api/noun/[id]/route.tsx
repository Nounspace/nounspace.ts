import { getNounById } from "@nouns/data/noun/getNounById";

// Unfortunte workaround for nextjs bug with server actions from tanstack
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auction = await getNounById(params.id);
  return Response.json(auction);
}
