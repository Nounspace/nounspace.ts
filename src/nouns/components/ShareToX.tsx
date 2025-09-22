import { LinkExternal } from "./ui/link";
import { ComponentProps } from "react";

interface ShareToFarcasterProps
  extends Omit<ComponentProps<typeof LinkExternal>, "href"> {
  text: string;
  url?: string;
}

const BASE_COMPOSE_URL = "https://twitter.com/intent/tweet";

export default function ShareToX({
  text,
  url,
  ...props
}: ShareToFarcasterProps) {
  const searchParams = new URLSearchParams({
    text,
    ...(url ? { url } : {}),
  }).toString();

  return (
    <LinkExternal
      href={`${BASE_COMPOSE_URL}?${searchParams.toString()}`}
      {...props}
    />
  );
}
