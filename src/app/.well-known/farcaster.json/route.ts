import { metadata } from '../../../constants/metadata';

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
      name: metadata.APP_NAME || process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      subtitle: metadata.APP_SUBTITLE || process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: metadata.APP_DESCRIPTION || process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      screenshotUrls: [],
      iconUrl: metadata.APP_ICON || process.env.NEXT_PUBLIC_APP_ICON,
      splashImageUrl: metadata.APP_SPLASH_IMAGE || process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: metadata.SPLASH_BACKGROUND_COLOR || process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: metadata.APP_PRIMARY_CATEGORY || process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      tags: [],
      heroImageUrl: metadata.APP_HERO_IMAGE || process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      tagline: metadata.APP_TAGLINE || process.env.NEXT_PUBLIC_APP_TAGLINE,
      ogTitle: metadata.APP_OG_TITLE || process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: metadata.APP_OG_DESCRIPTION || process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: metadata.APP_OG_IMAGE || process.env.NEXT_PUBLIC_APP_OG_IMAGE,
      // use only while testing
      // noindex: 'true',
    }),
  });
}