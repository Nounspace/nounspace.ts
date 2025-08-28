import { WEBSITE_URL } from "@/constants/app";

export const defaultFrame = {
  version: "next",
  imageUrl: `${WEBSITE_URL}/images/nounspace_og_low.png`,
  button: {
    title: "Open Space",
    action: {
      type: "launch_frame",
      url: WEBSITE_URL,
      name: "Nouns",
      splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
      splashBackgroundColor: "#FFFFFF",
    }
  }
}

export const metadata = {
  APP_NAME: 'Nouns',
  APP_ICON: 'https://www.nounspace.com/images/mini_app_icon.png',
  APP_SUBTITLE: 'A space for Nouns',
  APP_BUTTON_TITLE: 'Open Space',
  APP_DESCRIPTION: 'The social hub for Nouns',
  APP_SPLASH_IMAGE: 'https://www.nounspace.com/images/frames/splash.png',
  SPLASH_BACKGROUND_COLOR: '#FFFFFF',
  APP_PRIMARY_CATEGORY: 'social',
  APP_HERO_IMAGE: 'https://your-app.vercel.app/og.png',
  APP_TAGLINE: 'A space for Nouns',
  APP_OG_TITLE: 'Nouns',
  APP_OG_DESCRIPTION: 'The social hub for Nouns',
  APP_OG_IMAGE: 'https://www.nounspace.com/images/icon-192x192.png',
}