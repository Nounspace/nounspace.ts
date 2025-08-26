import requestHandler from "@/common/data/api/requestHandler";
import { getInsecureHubRpcClient, HubRpcClient } from "@farcaster/hub-nodejs";
import { NextApiRequest, NextApiResponse } from "next";

// Create a client that connects to a Hub
const hubClient: HubRpcClient = getInsecureHubRpcClient(
  process.env.NEXT_PUBLIC_HUB_HTTP_URL || "https://hub.farcaster.standardcrypto.vc:2283"
);

async function submitMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate the message using the hub-nodejs client
    const validateResult = await hubClient.validateMessage(req.body);
    
    if (validateResult.isOk()) {
      // Return success with validated message
      res.status(200).json({
        valid: true,
        message: validateResult.value
      });
    } else {
      // Return error details
      res.status(400).json({
        valid: false,
        error: validateResult.error.message
      });
    }
  } catch (e) {
    const error = e as Error;
    res.status(500).json({
      valid: false,
      error: error.message || "Unknown error occurred"
    });
  }
}

export default requestHandler({
  post: submitMessage,
});
