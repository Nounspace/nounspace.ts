import { describe, it, expect } from 'vitest';
import { createEditabilityChecker } from '@/common/utils/spaceEditability';

describe('createEditabilityChecker', () => {
  it('returns editable when keys match', () => {
    const result = createEditabilityChecker({
      currentIdentityPublicKey: 'abc',
      spaceIdentityPublicKey: 'abc',
    });
    expect(result.isEditable).toBe(true);
    expect(result.isLoading).toBe(false);
  });

  it('treats key comparison as case-insensitive', () => {
    const result = createEditabilityChecker({
      currentIdentityPublicKey: 'ABC',
      spaceIdentityPublicKey: 'abc',
    });
    expect(result.isEditable).toBe(true);
  });

  it('ignores leading 0x prefixes when comparing keys', () => {
    const result = createEditabilityChecker({
      currentIdentityPublicKey: '0xabc',
      spaceIdentityPublicKey: 'abc',
    });
    expect(result.isEditable).toBe(true);
  });

  it('trims surrounding whitespace before comparing', () => {
    const result = createEditabilityChecker({
      currentIdentityPublicKey: ' abc ',
      spaceIdentityPublicKey: '\tabc\n',
    });
    expect(result.isEditable).toBe(true);
  });

  it('returns not editable when keys differ', () => {
    const result = createEditabilityChecker({
      currentIdentityPublicKey: 'abc',
      spaceIdentityPublicKey: 'def',
    });
    expect(result.isEditable).toBe(false);
  });

  it('handles unregistered spaces', () => {
    const result = createEditabilityChecker({
      currentIdentityPublicKey: 'abc',
      spaceIdentityPublicKey: null,
    });
    expect(result.isEditable).toBe(false);
  });
});
