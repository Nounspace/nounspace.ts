import { LinkExternal } from "./ui/link";
import { ComponentProps } from "react";

interface ShareToFarcasterProps
  extends Omit<ComponentProps<typeof LinkExternal>, "href"> {
  text: string;
  embeds?: [string] | [string, string];
}

const BASE_COMPOSE_URL = "https://warpcast.com/~/compose";

export default function ShareToFarcaster({
  text,
  embeds,
  ...props
}: ShareToFarcasterProps) {
  const searchParams = new URLSearchParams([
    ["text", text],
    ...(embeds ? embeds.map((embed) => ["embeds[]", embed]) : []),
  ]).toString();

  return (
    <LinkExternal
      href={`${BASE_COMPOSE_URL}?${searchParams?.toString() || ''}`}
      {...props}
    />
  );
}
