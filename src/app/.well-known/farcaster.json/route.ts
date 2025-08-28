import { APP_NAME, APP_ICON, APP_SUBTITLE, APP_DESCRIPTION, APP_SPLASH_IMAGE, SPLASH_BACKGROUND_COLOR, APP_PRIMARY_CATEGORY, APP_HERO_IMAGE, APP_TAGLINE, APP_OG_TITLE, APP_OG_DESCRIPTION, APP_OG_IMAGE } from '../../../constants/app';

function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: '1',
      name: APP_NAME || process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      subtitle: APP_SUBTITLE || process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: APP_DESCRIPTION || process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      screenshotUrls: [],
      iconUrl: APP_ICON || process.env.NEXT_PUBLIC_APP_ICON,
      splashImageUrl: APP_SPLASH_IMAGE || process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: SPLASH_BACKGROUND_COLOR || process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: APP_PRIMARY_CATEGORY || process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      tags: [],
      heroImageUrl: APP_HERO_IMAGE || process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      tagline: APP_TAGLINE || process.env.NEXT_PUBLIC_APP_TAGLINE,
      ogTitle: APP_OG_TITLE || process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: APP_OG_DESCRIPTION || process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: APP_OG_IMAGE || process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      // use only while testing
      // noindex: 'true',
    }),
  });
}