// Migrated from @mod-protocol/react-editor/use-text-length
// Source: https://github.com/mod-protocol/mod/blob/main/packages/react-editor/src/use-text-length.tsx

import { convertCastPlainTextToStructured } from "../utils/structure-cast";

export function useTextLength({
  getText,
  maxByteLength,
}: {
  getText: () => string;
  maxByteLength: number;
}) {
  const text = getText();

  // Mentions don't occupy space in the cast, so we need to ignore them for our length calculation
  const structuredTextUnits = convertCastPlainTextToStructured({ text });
  const textWithoutMentions = structuredTextUnits.reduce((acc, unit) => {
    if (unit.type !== "mention") acc += unit.serializedContent;
    return acc;
  }, "");

  const lengthInBytes = new TextEncoder().encode(textWithoutMentions).length;

  const eightyFivePercentComplete = maxByteLength * 0.85;

  const getOrangeShade = () => {
    const shade = Math.min(9, 2 + Math.floor((lengthInBytes - eightyFivePercentComplete) / 10));
    return `orange.${shade}00`;
  };

  return {
    length: lengthInBytes,
    isValid: lengthInBytes <= maxByteLength,
    tailwindColor:
      lengthInBytes > maxByteLength
        ? "red"
        : lengthInBytes > eightyFivePercentComplete
        ? getOrangeShade()
        : "gray",
    label:
      lengthInBytes > maxByteLength
        ? `${lengthInBytes - maxByteLength} characters over limit`
        : lengthInBytes > eightyFivePercentComplete
        ? `${maxByteLength - lengthInBytes} characters left`
        : ``,
  };
}