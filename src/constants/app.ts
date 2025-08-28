export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? typeof window !== "undefined"
      ? window.location.origin
      : `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`
    : process.env.NEXT_PUBLIC_URL || "https://nounspace.com";

export const APP_FID = process.env.NEXT_PUBLIC_APP_FID
  ? Number(process.env.NEXT_PUBLIC_APP_FID)
  : undefined;

export const APP_NAME = 'Nounspace'
export const APP_ICON = 'https://www.nounspace.com/images/frames/icon.png'
export const APP_SUBTITLE = 'The Nounish Homepage'
export const APP_DESCRIPTION = 'A social hub for all things Nouns'
export const APP_SPLASH_IMAGE = 'https://www.nounspace.com/images/frames/splash.png'
export const SPLASH_BACKGROUND_COLOR = '#FFFFFF'
export const APP_PRIMARY_CATEGORY = 'social'
export const APP_HERO_IMAGE = 'https://your-app.vercel.app/og.png'
export const APP_TAGLINE = 'The Nounish Homepage'
export const APP_OG_TITLE = 'Nounspace'
export const APP_OG_DESCRIPTION = 'A social hub for all things Nouns'
export const APP_OG_IMAGE = 'https://www.nounspace.com/images/icon-192x192.png'