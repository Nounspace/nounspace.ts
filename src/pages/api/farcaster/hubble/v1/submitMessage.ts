import requestHandler from "@/common/data/api/requestHandler";
import { getInsecureHubRpcClient, HubRpcClient } from "@farcaster/hub-nodejs";
import { NextApiRequest, NextApiResponse } from "next";

// Create a client that connects to a Hub
const hubClient: HubRpcClient = getInsecureHubRpcClient(
  process.env.NEXT_PUBLIC_HUB_HTTP_URL || "https://hub.farcaster.standardcrypto.vc:2283"
);

async function submitMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Submit the message using the hub-nodejs client
    const submitResult = await hubClient.submitMessage(req.body);
    
    if (submitResult.isOk()) {
      // Return success with message hash
      res.status(200).json({
        success: true,
        message: submitResult.value
      });
    } else {
      // Return error details
      res.status(400).json({
        success: false,
        error: submitResult.error.message
      });
    }
  } catch (e) {
    const error = e as Error;
    res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred"
    });
  }
}

export default requestHandler({
  post: submitMessage,
});
