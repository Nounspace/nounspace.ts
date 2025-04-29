import { NextRequest, NextResponse } from "next/server";

// Optionally: import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/frame-node";
// import { saveNotificationToken, removeNotificationToken } from "@/common/data/notifications";

/**
 * Farcaster Mini App Webhook endpoint
 * Handles POST events from Farcaster clients (frame_added, frame_removed, notifications_enabled, notifications_disabled)
 * See: https://github.com/farcasterxyz/frames-v2-demo/blob/main/src/app/api/webhook/route.ts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Optionally: verify event signature here using parseWebhookEvent/verifyAppKeyWithNeynar
    // const event = await parseWebhookEvent(body, verifyAppKeyWithNeynar);

    // The event body is expected to be:
    // { header: string, payload: string, signature: string }
    // The payload (after decoding) contains { event: string, ... }

    // For now, just log and return 200
    console.log("Received Farcaster webhook event", body);

    // TODO: decode payload, handle event types, persist notification tokens, etc.
    // Example:
    // if (event.payload.event === "frame_added" && event.payload.notificationDetails) {
    //   await saveNotificationToken(event.payload.notificationDetails);
    // }
    // if (event.payload.event === "frame_removed") {
    //   await removeNotificationToken(...);
    // }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling webhook event", error);
    return NextResponse.json({ error: "Invalid webhook event" }, { status: 400 });
  }
}
