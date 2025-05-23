import { describe, it, expect } from 'vitest';
import { generateContractMetadataHtml } from '@/common/lib/utils/generateContractMetadataHtml';
import { MasterToken } from '@/common/providers/TokenProvider';

describe('generateContractMetadataHtml', () => {
  it('creates metadata with price', () => {
    const tokenData: MasterToken = {
      network: 'mainnet',
      geckoData: { symbol: 'TEST', price_usd: 1.23 } as any,
      clankerData: { symbol: 'T' } as any,
    };

    const metadata = generateContractMetadataHtml('0xabc', tokenData);

    expect(metadata.title).toBe('T - $1.23 USD');
    expect(metadata.openGraph?.title).toBe(metadata.title);
    expect(metadata.openGraph?.url).toBe('https://nounspace.com/t/mainnet/0xabc');
    expect(metadata.twitter?.title).toBe(metadata.title);
  });

  it('handles missing price data', () => {
    const tokenData: MasterToken = {
      network: 'base',
      geckoData: null,
      clankerData: { symbol: 'B' } as any,
    };

    const metadata = generateContractMetadataHtml('0xdef', tokenData);

    expect(metadata.title).toBe('B');
    expect(metadata.openGraph?.url).toBe('https://nounspace.com/t/base/0xdef');
  });
});
