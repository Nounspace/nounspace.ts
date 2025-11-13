import type { CsvTypeOption } from "../types";

/**
 * Parses CSV content and extracts values based on the specified type
 */
export function parseCsv(raw: string, type: CsvTypeOption): string[] {
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) return [];
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rows.length === 0) return [];

  const split = (line: string) => {
    // naive CSV split with basic quote handling
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result.map((v) => v.replace(/^"|"$/g, ""));
  };

  const headerColsRaw = split(rows[0]);
  const headerCols = headerColsRaw.map((c) => c.toLowerCase());
  let colIndex = 0;
  let hasHeader = false;
  const candidates: Record<CsvTypeOption, string[]> = {
    address: ["address", "eth", "wallet"],
    fid: ["fid", "id"],
    username: ["username", "handle", "fc"],
  };
  const headerMatch = (value: string) =>
    candidates[type].includes(value.trim().toLowerCase());

  if (headerCols.length > 1) {
    const idx = headerCols.findIndex((c) => headerMatch(c));
    if (idx >= 0) {
      colIndex = idx;
      hasHeader = true;
    }
  } else if (headerCols.length === 1 && headerMatch(headerCols[0])) {
    hasHeader = true;
  }

  const items: string[] = [];
  for (let i = hasHeader ? 1 : 0; i < rows.length; i++) {
    const cols = split(rows[i]);
    const rawVal = (cols[colIndex] || "").trim();
    if (!rawVal) continue;
    if (type === "username") {
      items.push(rawVal.replace(/^@/, ""));
    } else {
      items.push(rawVal);
    }
  }
  if (items.length === 0) {
    const fallbackRows = rows.slice(hasHeader ? 1 : 0);
    fallbackRows.forEach((row) => {
      const value = row.trim();
      if (!value) return;
      if (type === "username") {
        items.push(value.replace(/^@/, ""));
      } else {
        items.push(value);
      }
    });
  }
  return items;
}

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

