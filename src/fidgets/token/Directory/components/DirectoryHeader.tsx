import React from "react";
import { getLastActivityLabel } from "../utils";

export type DirectoryHeaderProps = {
  subheader?: string | null;
  headingTextStyle: React.CSSProperties;
  headingFontFamilyStyle: React.CSSProperties;
  primaryFontColor: string;
  lastUpdatedTimestamp?: string | null;
};

export const DirectoryHeader: React.FC<DirectoryHeaderProps> = ({
  subheader,
  headingTextStyle,
  headingFontFamilyStyle,
  primaryFontColor,
  lastUpdatedTimestamp,
}) => {
  const lastUpdatedLabel = React.useMemo(
    () => getLastActivityLabel(lastUpdatedTimestamp),
    [lastUpdatedTimestamp]
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
      <div className="flex flex-col gap-1">
        <span className="font-semibold" style={headingTextStyle}>
          Community Directory
        </span>
        {subheader && (
          <span
            className="text-xs font-medium"
            style={{
              ...headingFontFamilyStyle,
              color: primaryFontColor,
              opacity: 0.75,
            }}
          >
            {subheader}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        {lastUpdatedLabel && (
          <span className="rounded-full bg-black/5 px-2 py-1 font-medium text-muted-foreground">
            Updated {lastUpdatedLabel}
          </span>
        )}
      </div>
    </div>
  );
};

