import { graphql } from "@nouns/data/generated/cms";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { graphQLFetch } from "../utils/graphQLFetch";

const query = graphql(/* GraphQL */ `
  query GetPosts {
    Posts(sort: "-createdAt") {
      docs {
        id
        slug
        title
        description
        heroImage {
          url
          alt
        }
        updatedAt
        discoverable
      }
    }
  }
`);

export async function getPostOverviews() {
  const data = await await graphQLFetch(
    process.env.CMS_URL!,
    query,
    {},
    {
      next: {
        revalidate: SECONDS_PER_DAY,
        tags: ["get-post-overviews"],
      },
    },
  );

  const posts = data?.Posts?.docs
    ?.filter((post) => post != null)
    .filter((post) => post.discoverable);

  return posts ?? null;
}
