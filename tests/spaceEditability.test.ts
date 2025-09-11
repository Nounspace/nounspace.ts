import { describe, it, expect } from 'vitest';
import { createEditabilityChecker } from '../src/common/utils/spaceEditability';
import type { Address } from 'viem';

describe('space editability', () => {
  it('handles keys with and without 0x prefix', () => {
    const context = {
      currentUserFid: 1,
      spaceOwnerAddress: 'abcdef' as unknown as Address,
      wallets: [{ address: '0xABCDEF' as Address }],
      isTokenPage: true,
    };

    const result = createEditabilityChecker(context);
    expect(result.isEditable).toBe(true);
  });
});
