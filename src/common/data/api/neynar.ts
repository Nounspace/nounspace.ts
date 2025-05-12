import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export default new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
