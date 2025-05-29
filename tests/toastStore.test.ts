import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useToastStore } from '@/common/data/stores/toastStore';
import { JSDOM } from 'jsdom';

describe('toast store', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://test.com' });
    (global as any).window = dom.window as any;
    (global as any).document = dom.window.document;
    (global as any).localStorage = dom.window.localStorage;
    useToastStore.setState({
      isDisplayed: false,
      message: '',
      duration: 5000,
      toastKey: undefined,
      closeForever: undefined,
      closedForeverKeys: new Set(),
    });
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).document;
    delete (global as any).localStorage;
  });

  it('shows and hides a toast', () => {
    const { showToast, hideToast } = useToastStore.getState();
    showToast('hello', 1000);
    expect(useToastStore.getState().isDisplayed).toBe(true);
    expect(useToastStore.getState().message).toBe('hello');
    hideToast();
    expect(useToastStore.getState().isDisplayed).toBe(false);
    expect(useToastStore.getState().message).toBe('');
  });

  it('closeForever prevents future toasts', () => {
    const { showToast, hideToast } = useToastStore.getState();
    showToast('persist', 1000, 'k1', true);
    hideToast();
    expect(useToastStore.getState().closedForeverKeys.has('k1')).toBe(true);
    showToast('persist', 1000, 'k1', true);
    expect(useToastStore.getState().isDisplayed).toBe(false);
    expect(localStorage.getItem('closedForeverToasts')).toContain('k1');
  });
});
