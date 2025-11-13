import React from "react";
import type { DirectorySource } from "../types";

export type EmptyStateProps = {
  source: DirectorySource;
  headingTextStyle: React.CSSProperties;
  secondaryTextStyle: React.CSSProperties;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  source,
  headingTextStyle,
  secondaryTextStyle,
}) => {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground"
      style={secondaryTextStyle}
    >
      {source === "tokenHolders" ? (
        <>
          <p className="font-medium" style={headingTextStyle}>
            Connect a contract address to build the directory.
          </p>
          <p className="max-w-[40ch] text-xs text-muted-foreground/80">
            Provide an ERC-20 token or NFT contract address and network to surface the
            holders with Farcaster profiles.
          </p>
        </>
      ) : source === "farcasterChannel" ? (
        <>
          <p className="font-medium" style={headingTextStyle}>
            Enter a Farcaster channel name to build the directory.
          </p>
          <p className="max-w-[40ch] text-xs text-muted-foreground/80">
            Example: nouns, purple. The filter selects Members, Followers, or both.
          </p>
        </>
      ) : (
        <>
          <p className="font-medium" style={headingTextStyle}>
            Upload a CSV to build the directory.
          </p>
          <p className="max-w-[40ch] text-xs text-muted-foreground/80">
            Choose Type (Address, FID, or Farcaster username), then use Upload CSV in settings.
          </p>
        </>
      )}
    </div>
  );
};

