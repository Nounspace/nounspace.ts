import { graphql } from "@nouns/data/generated/cms";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { graphQLFetch } from "../utils/graphQLFetch";

const query = graphql(/* GraphQL */ `
  query GetPostBySlug($slug: String!) {
    Posts(where: { slug: { equals: $slug } }) {
      docs {
        id
        title
        description
        heroImage {
          url
          alt
        }
        content
        keywords {
          value
        }
        createdAt
        updatedAt
      }
    }
  }
`);

export async function getPostBySlug(slug: string) {
  const data = await await graphQLFetch(
    process.env.CMS_URL!,
    query,
    { slug },
    {
      next: {
        revalidate: SECONDS_PER_DAY,
        tags: ["get-posts-by-slug"],
      },
    },
  );

  return (data as any)?.Posts?.docs?.[0] ?? null;
}
