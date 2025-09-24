import { unstable_cache } from "next/cache";

export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const response = await fetch(url, options);

    // Check if the response status is OK (status code 200-299)
    if (!response.ok) {
      throw Error(
        `Http error: ${url} - ${response.status}, ${response.statusText}`,
      );
    }

    // Parse the response as JSON
    const data: T = await response.json();
    return data;
  } catch (error) {
    // Catch any network errors or exceptions thrown by fetch
    // throw Error(`Network error: ${url} - ${error}`);
    console.error("Fetch error:", url, options, error);
    return null;
  }
}

type Callback = (...args: any[]) => Promise<any>;
export function safeUnstableCache<T extends Callback>(
  cb: T,
  keyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  },
) {
  return async function (...args: Parameters<T>) {
    try {
      return await unstable_cache(cb, keyParts, options)(...args);
    } catch (e) {
      console.error(`safeUnstableCache error ${e}`);
      return null;
    }
  } as (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null>;
}
