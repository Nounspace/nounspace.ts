"use client";
import { cn } from "@nouns/utils/shadcn";
import { Avatar, Name } from "@paperclip-labs/whisk-sdk/identity";
import { HTMLAttributes } from "react";
import { Address } from "viem";

interface IdentityProps extends HTMLAttributes<HTMLDivElement> {
  address: Address;
  avatarSize: number;
}

export default function Identity({ address, avatarSize, className, ...props }: IdentityProps) {
  return (
    <div className={cn("flex items-center gap-1 font-bold", className)} {...props}>
      <Avatar address={address} size={avatarSize} />
      <Name address={address} />
    </div>
  );
}
