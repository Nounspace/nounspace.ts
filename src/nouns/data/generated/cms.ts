// Mock implementation for @nouns/data/generated/cms
export const cms = {
  getPosts: () => Promise.resolve([]),
  getPost: () => Promise.resolve(null),
};
export const graphql = (query: string) => query;
