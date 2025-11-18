import type { DirectoryFidgetData } from "@/fidgets/token/Directory/types";

type RawTabData = {
  fidgetInstanceDatums?: Record<
    string,
    {
      fidgetType?: string;
      config?: {
        data?: DirectoryFidgetData;
      };
    }
  >;
} | null;

/**
 * Extract the persisted Directory fidget data from a serialized Tab JSON object.
 * We only care about the data payload; other layout/theme properties are ignored.
 */
export const getDirectoryDataFromTabJson = (
  raw: RawTabData,
): DirectoryFidgetData | undefined => {
  if (!raw?.fidgetInstanceDatums) {
    return undefined;
  }

  const directoryEntry = Object.values(raw.fidgetInstanceDatums).find(
    (value) => value?.fidgetType === "Directory" && value.config?.data,
  );

  return directoryEntry?.config?.data;
};
