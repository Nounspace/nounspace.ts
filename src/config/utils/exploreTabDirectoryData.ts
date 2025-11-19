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

const isDirectoryData = (value: unknown): value is DirectoryFidgetData =>
  !!value && typeof value === "object" && Array.isArray((value as DirectoryFidgetData).members);

/**
 * Extract the persisted Directory fidget data from a serialized Tab JSON object.
 * We support both the legacy saved-tab shape (with fidgetInstanceDatums) and the
 * simplified shape that stores DirectoryFidgetData at the root.
 */
export const getDirectoryDataFromTabJson = (
  raw: RawTabData | DirectoryFidgetData | null,
): DirectoryFidgetData | undefined => {
  if (isDirectoryData(raw)) {
    return raw;
  }

  if (!raw?.fidgetInstanceDatums) {
    return undefined;
  }

  const directoryEntry = Object.values(raw.fidgetInstanceDatums).find(
    (value) => value?.fidgetType === "Directory" && value.config?.data,
  );

  const data = directoryEntry?.config?.data;
  return isDirectoryData(data) ? data : undefined;
};
