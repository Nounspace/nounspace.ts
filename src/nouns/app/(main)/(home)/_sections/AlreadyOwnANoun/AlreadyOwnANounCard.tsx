"use client";
import NavButton from "@nouns/components/NavButton";
import Icon from "@nouns/components/ui/Icon";
import { cn } from "@nouns/utils/shadcn";
import Link from "next/link";
import { HTMLAttributes, ReactNode, useRef } from "react";

interface AlreadyOwnANounCardProps extends HTMLAttributes<HTMLDivElement> {
  href: string;
  iconSrc: string;
  buttonLabel: string;
  description: string;
  cta: ReactNode;
  children: ReactNode;
}

export default function AlreadyOwnANounCard({
  href,
  iconSrc,
  buttonLabel,
  description,
  cta,
  className,
  children,
  ...props
}: AlreadyOwnANounCardProps) {
  const hoverRef = useRef<HTMLDivElement>(null);

  return (
    <Link href={href} className="w-full flex-1">
      <div
        ref={hoverRef}
        className={cn(
          "relative flex h-full justify-between gap-4 overflow-hidden rounded-[32px] transition-all hover:brightness-90",
          className,
        )}
        {...props}
      >
        <div className="flex max-w-[360px] shrink-0 flex-col gap-4 p-8 md:p-10">
          <NavButton
            variant="secondary"
            iconSrc={iconSrc}
            className="w-fit overflow-hidden rounded-full border-none stroke-content-primary px-4 label-lg hover:bg-white"
            hoverRef={hoverRef}
          >
            {buttonLabel}
          </NavButton>
          <h5>{description}</h5>
          <div className="flex gap-1 text-semantic-accent label-lg">
            {cta}
            <Icon icon="arrowRight" className="fill-semantic-accent" />
          </div>
        </div>
        {children}
      </div>
    </Link>
  );
}
