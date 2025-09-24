// Generated CMS types and utilities
export const graphql = (query: string) => query

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  heroImage: {
    url: string
    alt: string
  }
  publishedAt: string
  author: {
    name: string
    bio: string
  }
}

export interface PostOverview {
  id: string
  title: string
  slug: string
  heroImage: {
    url: string
    alt: string
  }
  publishedAt: string
  author: {
    name: string
  }
}

export interface GetPostOverviewsQuery {
  posts: PostOverview[]
}

export interface GetPostBySlugQuery {
  post: Post
}

// Types are already exported as interfaces above

// TypedDocumentString type for GraphQL queries
export type TypedDocumentString<Result, Variables> = string
