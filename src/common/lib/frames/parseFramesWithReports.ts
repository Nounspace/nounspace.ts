// Local type definition based on frames.js/dist/parseFramesWithReports.d.ts
export type ParseFramesWithReportsOptions = {
  html: string;
  frameUrl: string;
  fallbackPostUrl: string;
  fromRequestMethod?: "GET" | "POST";
  parseSettings?: {
    farcaster_v2?: {
      parseManifest?: boolean;
      strict?: boolean;
    };
  };
};

export async function parseFramesWithReports(options: ParseFramesWithReportsOptions): Promise<any> {
  // Copy the actual implementation here from frames.js/dist/parseFramesWithReports.js
  throw new Error("parseFramesWithReports not implemented. Please copy implementation from frames.js.");
}
