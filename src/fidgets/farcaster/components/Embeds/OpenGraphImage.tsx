import React, { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import { openWindow } from "@/common/lib/utils/navigation";

type OpenGraphMetadata = {
  image: {
    url: string;
    height: number;
    width: number;
  };
  description: string;
  title: string;
  publisher: string;
};

const OpenGraphImage = ({ url }: { url: string }) => {
  const [metadata, setMetadata] = useState<OpenGraphMetadata | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      const request = await fetch(
        "https://api.modprotocol.org/api/cast-embeds-metadata/by-url",
        {
          body: JSON.stringify([url]),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const metadata = await request.json();
      setMetadata(metadata[url]);
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
              alt={metadata.title}
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
