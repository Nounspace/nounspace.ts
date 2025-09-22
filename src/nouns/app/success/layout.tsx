import { NounsDotComLogoLink } from "@nouns/components/NounsDotComLogoLink";
import { Button } from "@nouns/components/ui/button";
import { Slottable } from "@radix-ui/react-slot";
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex grow flex-col items-center justify-start">
      <header className="item-center flex w-full justify-between px-4 py-2 shadow-bottom-only md:px-10">
        <NounsDotComLogoLink />
        <Button variant="secondary" className="py-[10px]" asChild>
          <Slottable>
            <Link href="/" className="label-md">
              Exit
            </Link>
          </Slottable>
        </Button>
      </header>
      <div className="p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[40px] md:p-8 md:pb-[calc(env(safe-area-inset-bottom)+32px)] md:pt-[10vh]">
        {children}
      </div>
    </div>
  );
}
