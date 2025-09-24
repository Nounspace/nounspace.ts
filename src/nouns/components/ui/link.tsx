"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnchorHTMLAttributes, ComponentProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";

export function LinkExternal({
  includeReferrer,
  ...props
}: { includeReferrer?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      target="_blank"
      rel={`noopener ${includeReferrer ? "" : "noreferrer"}`}
      className={twMerge("transition-all hover:brightness-75", props.className)}
    />
  );
}

export function LinkRetainSearchParams(
  props: React.ComponentProps<typeof Link>,
) {
  const searchParams = useSearchParams();
  return <Link {...props} href={`${props.href}?${searchParams?.toString() || ''}`} />;
}

interface LinkShallowProps extends ComponentProps<typeof Button> {
  searchParam: { name: string; value: string | null };
}

export function LinkShallow({
  searchParam,
  children,
  variant,
  size,
  className,
  ...props
}: LinkShallowProps) {
  const searchParams = useSearchParams();

  return (
    <Button
      onClick={() => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (searchParam.value === null) {
          params.delete(searchParam.name);
        } else {
          params.set(searchParam.name, searchParam.value);
        }
        window.history.pushState(null, "", `?${params.toString()}`);
      }}
      className={className}
      variant={variant ?? "unstyled"}
      size={size ?? "fit"}
      {...props}
    >
      {children}
    </Button>
  );
}
