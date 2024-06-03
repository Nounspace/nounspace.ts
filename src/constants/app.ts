export const WEBSITE_URL = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ? `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}` : process.env.NEXT_PUBLIC_URL;
export const APP_FID = process.env.NEXT_PUBLIC_APP_FID ? Number(process.env.NEXT_PUBLIC_APP_FID) : undefined;
export const APP_MNENOMIC = process.env.APP_MNENOMIC;