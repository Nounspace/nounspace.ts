import { WEBSITE_URL } from "@/constants/app";

export const defaultFrame = {
  version: "next",
  imageUrl: `${WEBSITE_URL}/images/nounspace_og_low.png`,
  button: {
    title: "Start Nounspace",
    action: {
      type: "launch_frame",
      url: WEBSITE_URL,
      name: "Nounspace",
      splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
      splashBackgroundColor: "#FFFFFF",
    }
  }
}