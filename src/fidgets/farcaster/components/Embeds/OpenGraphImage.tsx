import React, { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import { openWindow } from "@/common/lib/utils/navigation";

type OpenGraphMetadata = {
  image?: {
    url: string;
    height?: number;
    width?: number;
  };
  description?: string;
  title?: string;
  publisher?: string;
} | null;

type MetadataResponse = Record<string, OpenGraphMetadata>;

const OpenGraphImage = ({ url }: { url: string }) => {
  const [metadata, setMetadata] = useState<OpenGraphMetadata>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch("/api/opengraph", {
          body: JSON.stringify({ urls: [url] }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata for ${url}: ${response.statusText}`);
        }

        const metadataByUrl = (await response.json()) as MetadataResponse;
        setMetadata(metadataByUrl[url] ?? null);
      } catch (error) {
        console.error(error);
        setMetadata(null);
      }
    };

    fetchMetadata();
  }, [url]);

  if (!metadata) {
    return null;
  }

  return (
    <div onClick={() => openWindow(url)} className="cursor-pointer">
      <Card className="rounded-sm">
        <CardHeader>
          {metadata?.image && metadata?.image?.url && (
            <img
              className="h-full object-cover max-h-48 rounded-md"
              src={metadata.image.url}
              alt={metadata.title ?? metadata.description ?? url}
            />
          )}
          <CardTitle>{metadata.title}</CardTitle>
          <CardDescription>{metadata.description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default OpenGraphImage;
