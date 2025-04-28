export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    frame: {
      version: "1",
      name: "Nounspace",
      homeUrl: appUrl,
      iconUrl: `${appUrl}/images/frames/icon.png`,
      splashImageUrl: `${appUrl}/images/frames/splash.png`,
      splashBackgroundColor: "#1C1C1C",
    },
  };

  return Response.json(config);
}
