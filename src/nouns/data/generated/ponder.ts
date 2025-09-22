// Mock implementation for @nouns/data/generated/ponder
export const ponder = {
  getClients: () => Promise.resolve([]),
  getDailyFinancialSnapshots: () => Promise.resolve([]),
  getTreasurySummary: () => Promise.resolve({}),
  getExecutedProposalsCount: () => Promise.resolve(0),
};
export const graphql = (query: string) => query;

// Mock GraphQL types
export const ClientsQuery = {} as any;
export const FinancialSnapshotsQuery = {} as any;
export const TreasurySummaryQuery = {} as any;
export const ExecutedProposalsCountQuery = {} as any;
