import { WEBSITE_URL } from "../../../constants/app";

console.log("WEBSITE_URL", WEBSITE_URL);

export async function GET() {
  const config = {
    // accountAssociation: {
      // header: "",
      // payload: "",
      // signature: "",
    // },
    frame: {
      version: "1",
      name: "Nounspace",
      homeUrl: WEBSITE_URL,
      iconUrl: `${WEBSITE_URL}/images/frames/icon.png`,
      splashImageUrl: `${WEBSITE_URL}/images/frames/splash.png`,
      webhookUrl: `${WEBSITE_URL}/api/farcaster/webhook`,
      splashBackgroundColor: "#FFFFFF",
    },
  };

  return Response.json(config);
}
