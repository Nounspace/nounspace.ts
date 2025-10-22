import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

export const BUILDER_DAO =
  "https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-mainnet/stable/gn";
export const NOUNS_DAO =
  "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn";

export const DAO_OPTIONS = config.community.daos;
