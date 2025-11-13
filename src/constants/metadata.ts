import { WEBSITE_URL } from "@/constants/app";
import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

export const defaultFrame = {
  version: "next",
  imageUrl: `${WEBSITE_URL}${config.assets.logos.og}`,
  button: {
    title: config.brand.name,
    action: {
      type: "launch_frame",
      url: WEBSITE_URL,
      name: config.brand.displayName,
      splashImageUrl: `${WEBSITE_URL}${config.assets.logos.splash}`,
      splashBackgroundColor: "#FFFFFF",
    }
  }
}

export const metadata = {
  APP_NAME: config.brand.name,
  APP_ICON: `${WEBSITE_URL}${config.assets.logos.icon}`,
  APP_SUBTITLE: config.brand.tagline,
  APP_BUTTON_TITLE: 'Open Space',
  APP_DESCRIPTION: config.brand.description,
  APP_TAGS: config.brand.miniAppTags,
  APP_SPLASH_IMAGE: `${WEBSITE_URL}${config.assets.logos.splash}`,
  SPLASH_BACKGROUND_COLOR: '#FFFFFF',
  APP_PRIMARY_CATEGORY: 'social',
  APP_HERO_IMAGE: `${WEBSITE_URL}${config.assets.logos.splash}`,
  APP_TAGLINE: config.brand.tagline,
  APP_OG_TITLE: config.brand.displayName,
  APP_OG_DESCRIPTION: config.brand.description,
  APP_OG_IMAGE: `${WEBSITE_URL}${config.assets.logos.og}`,
}