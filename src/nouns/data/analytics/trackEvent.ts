"use server";

export async function trackEvent(
  name: string,
  payload: Record<string, string | number>,
) {
  console.log("TRACKING EVENT", name, payload);

  // Plausible
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN) {
    try {
      const resp = await fetch("https://plausible.paperclip.xyz/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN,
          name,
          url: "",
          props: payload,
        }),
      });
      if (!resp.ok) {
        console.error("Event tracking failed", resp.status, await resp.text());
      }
    } catch (e) {
      console.error("Plausible event tracking failed", e);
    }
  }
}
