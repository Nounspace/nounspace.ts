// Migrated from @mod-protocol/react-ui-shadcn/cast-length-ui-indicator
// Source: https://github.com/mod-protocol/mod/blob/main/packages/react-ui-shadcn/src/components/cast-length-ui-indicator.tsx

import React from "react";
import { useTextLength } from "../hooks/useTextLength";

interface CastLengthUIIndicatorProps {
  getText: () => string;
}

export function CastLengthUIIndicator({ getText }: CastLengthUIIndicatorProps) {
  const { length: _length, tailwindColor: _tailwindColor } = useTextLength(getText);

  // For now, we'll return null since the original component doesn't render anything visible
  // You can customize this to show the character count if needed
  return null;
}
