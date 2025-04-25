import { NeynarV2APIClient } from "@neynar/nodejs-sdk/build/neynar-api/v2";

export default new NeynarV2APIClient(process.env.NEYNAR_API_KEY!);
