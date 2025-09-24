import { getNogsForNoun } from "@nouns/data/nogs/getNogsForNoun";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const nogs = await getNogsForNoun(params.id);
  return Response.json(nogs);
}
