import { createRequire } from "module";
import type { NextApiRequest, NextApiResponse } from "next";

const require = createRequire(import.meta.url);
const ogs = require("open-graph-scraper") as (
  options: { url: string; timeout?: number }
) => Promise<{
  error: boolean;
  result: OgObject & { error?: string };
}>;

type OgImageCandidate =
  | undefined
  | null
  | {
      url?: string;
      height?: number | string;
      width?: number | string;
    };

type OgImageCollection = OgImageCandidate | OgImageCandidate[];

type OgJsonLdRecord = {
  name?: string;
  publisher?: { name?: string } | { "@type"?: string; name?: string };
};

type OgJsonLd = OgJsonLdRecord | OgJsonLdRecord[] | null | undefined;

type OgObject = {
  ogImage?: OgImageCollection;
  twitterImage?: OgImageCollection;
  ogTitle?: string;
  twitterTitle?: string;
  dcTitle?: string;
  jsonLD?: OgJsonLd;
  ogDescription?: string;
  twitterDescription?: string;
  dcDescription?: string;
  description?: string;
  ogSiteName?: string;
  twitterSite?: string;
};

type OpenGraphImage = {
  url: string;
  height?: number;
  width?: number;
};

type OpenGraphResponse = {
  image?: OpenGraphImage;
  description?: string;
  title?: string;
  publisher?: string;
} | null;

type ResponsePayload = Record<string, OpenGraphResponse>;

const asNumber = (value?: string | number | null): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const extractImage = (
  ogImage: OgImageCollection,
  fallbackImage?: OgImageCollection
): OpenGraphImage | undefined => {
  const candidate =
    (Array.isArray(ogImage) ? ogImage[0] : ogImage) ??
    (Array.isArray(fallbackImage) ? fallbackImage[0] : fallbackImage);

  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  const { url } = candidate;

  if (!url || typeof url !== "string") {
    return undefined;
  }

  return {
    url,
    width: asNumber(candidate.width ?? null),
    height: asNumber(candidate.height ?? null),
  };
};

const sanitizeUrls = (input: unknown): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.filter((url): url is string => typeof url === "string" && url.length > 0);
  }

  if (typeof input === "object" && "urls" in input) {
    return sanitizeUrls((input as { urls?: unknown }).urls);
  }

  return [];
};

const extractJsonLdRecord = (jsonLd: OgJsonLd): OgJsonLdRecord | undefined => {
  if (!jsonLd) {
    return undefined;
  }

  if (Array.isArray(jsonLd)) {
    return jsonLd.find((record) => !!record);
  }

  return jsonLd;
};

const extractJsonLdName = (jsonLd: OgJsonLd): string | undefined => {
  const record = extractJsonLdRecord(jsonLd);

  if (!record) {
    return undefined;
  }

  return typeof record.name === "string" ? record.name : undefined;
};

const extractPublisher = (jsonLd: OgJsonLd): string | undefined => {
  const record = extractJsonLdRecord(jsonLd);

  if (!record) {
    return undefined;
  }

  const publisher = record.publisher;

  if (!publisher || typeof publisher !== "object") {
    return undefined;
  }

  if ("name" in publisher && publisher.name) {
    return typeof publisher.name === "string" ? publisher.name : undefined;
  }

  return undefined;
};

const buildMetadata = (result: OgObject): OpenGraphResponse => {
  const image = extractImage(result.ogImage, result.twitterImage ?? result.ogImage);
  const title =
    result.ogTitle ??
    result.twitterTitle ??
    result.dcTitle ??
    extractJsonLdName(result.jsonLD);
  const description =
    result.ogDescription ??
    result.twitterDescription ??
    result.dcDescription ??
    result.description ??
    undefined;
  const publisher =
    result.ogSiteName ??
    result.twitterSite ??
    extractPublisher(result.jsonLD);

  if (!image && !title && !description && !publisher) {
    return null;
  }

  return {
    image,
    title,
    description,
    publisher,
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponsePayload | { error: string }>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const urls = sanitizeUrls(req.body);

  if (urls.length === 0) {
    return res.status(400).json({ error: "Request body must include an array of urls" });
  }

  const entries = await Promise.all(
    urls.map(async (url) => {
      try {
        const scrapeResult = await ogs({ url, timeout: 10_000 });

        if (scrapeResult.error) {
          console.error(
            `Failed to fetch Open Graph metadata for ${url}:`,
            scrapeResult.result.error ?? scrapeResult.result
          );
          return [url, null] as const;
        }

        return [url, buildMetadata(scrapeResult.result)] as const;
      } catch (error) {
        console.error(`Failed to fetch Open Graph metadata for ${url}:`, error);
        return [url, null] as const;
      }
    })
  );

  return res.status(200).json(Object.fromEntries(entries));
};

export default handler;
