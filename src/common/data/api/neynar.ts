import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export default new NeynarAPIClient({apiKey: process.env.NEYNAR_API_KEY!});
