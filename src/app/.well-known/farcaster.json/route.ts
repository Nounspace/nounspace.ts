import { WEBSITE_URL } from "../../../constants/app";

console.log("WEBSITE_URL", WEBSITE_URL);

export async function GET() {
  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjE5NjMyOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDMwM0JlMDNiMkExQjVlMkViQjQzZEQ0NkEyYWFDZjk1YzJhQTVBODQifQ",
      payload:
        "eyJkb21haW4iOiJlY29tbWVyY2UtdmFyaWFuY2UtYnJvb2tseW4tZmVycnkudHJ5Y2xvdWRmbGFyZS5jb20ifQ",
      signature:
        "MHg5NzRjY2JkMmJiZjEyOGM0ZjBlOWY5NDZhYmEyZDBlMzk2ZGQ3MzU0ZmE4NjBkNGM1MzQ0MGEwMzZmNzdiMjZiMjlkNzczNGFjYmYzMjU0N2ZjZjQ1ODExZDk1NGFiMWRlMGY3MDUyYmY4NTA3ODgxYjdjM2VkNTU1NDI1MzEzYjFi",
    },
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
