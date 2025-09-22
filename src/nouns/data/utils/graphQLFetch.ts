import { GraphQLError } from "graphql";
import { TypedDocumentString as SubgraphTypedDocumentString } from "../generated/gql/graphql";
import { TypedDocumentString as PonderTypedDocumentString } from "../generated/ponder/graphql";
import { TypedDocumentString as CmsTypedDocumentString } from "../generated/cms/graphql";
import { safeFetch } from "@nouns/utils/safeFetch";

type GraphQLResponse<Data> = { data: Data } | { errors: GraphQLError[] };

export interface CacheConfig {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export async function graphQLFetch<Result, Variables>(
  url: string,
  query:
    | SubgraphTypedDocumentString<Result, Variables>
    | PonderTypedDocumentString<Result, Variables>
    | CmsTypedDocumentString<Result, Variables>,
  variables?: Variables,
  cacheConfig?: CacheConfig,
): Promise<Result | null> {
  const result = await safeFetch<GraphQLResponse<Result>>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: cacheConfig?.cache,
    next: cacheConfig?.next,
  });

  if (!result) {
    return null;
  }

  if ("errors" in result) {
    console.error(
      "GraphQL Error:",
      `${url} - ${result.errors[0].message} - ${query} - ${JSON.stringify(variables)}`,
    );
    return null;
  }

  return result.data;
}

export async function graphQLFetchWithFallback<Result, Variables>(
  url: { primary: string; fallback: string },
  query:
    | SubgraphTypedDocumentString<Result, Variables>
    | PonderTypedDocumentString<Result, Variables>,
  variables?: Variables,
  cacheConfig?: CacheConfig,
): Promise<Result | null> {
  let result = await graphQLFetch(url.primary, query, variables, cacheConfig);

  if (!result) {
    console.log("Graphql primary failed, trying fallback...");
    result = await graphQLFetch(url.fallback, query, variables, cacheConfig);
  }

  return result;
}
