import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';
import useGraphqlQuery from '@/common/lib/hooks/useGraphqlQuery';

describe('useGraphqlQuery', () => {
  let container: HTMLElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    (global as any).window = dom.window as any;
    (global as any).document = dom.window.document;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    vi.restoreAllMocks();
    delete (global as any).window;
    delete (global as any).document;
  });

  it('fetches and returns data', async () => {
    const responseData = { hello: 'world' };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: responseData }),
    } as any);

    let result: ReturnType<typeof useGraphqlQuery>;

    function Test() {
      result = useGraphqlQuery({ url: '/graphql', query: 'query { hello }' });
      return null;
    }

    await act(async () => {
      root.render(<Test />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result!.loading).toBe(false);
    expect(result!.data).toEqual(responseData);
    expect(result!.error).toBeNull();
  });

  it('skips fetch when skip is true', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    let result: ReturnType<typeof useGraphqlQuery>;

    function Test() {
      result = useGraphqlQuery({ url: '/graphql', query: 'query', skip: true });
      return null;
    }

    await act(async () => {
      root.render(<Test />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result!.data).toBeNull();
  });
});
