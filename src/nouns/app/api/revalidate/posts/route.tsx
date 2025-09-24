import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("get-posts-by-slug");
  revalidateTag("get-post-overviews");
  return Response.json({success: true});
}
