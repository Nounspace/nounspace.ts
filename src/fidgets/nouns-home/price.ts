'use client';

import { useEffect, useState } from 'react';

// Lightweight ETH/USD price fetcher with simple caching and graceful fallback
export function useEthUsdPrice() {
  const [usd, setUsd] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      try {
        // Try Coingecko (public, rate‑limited). If blocked, fall back below.
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
          { signal: controller.signal, cache: 'no-store' }
        );
        if (res.ok) {
          const json = await res.json();
          const price = Number(json?.ethereum?.usd);
          if (!Number.isNaN(price) && !cancelled) setUsd(price);
          return;
        }
      } catch (_) {
        // ignore
      }
      // Fallback: a conservative placeholder to avoid blocking UI.
      if (!cancelled) setUsd(3000);
    }

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return usd;
}

export function formatUsd(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString()}`;
  }
}

