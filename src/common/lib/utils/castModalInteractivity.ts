const CAST_MODAL_INTERACTIVE_SELECTOR = '[data-cast-modal-interactive="true"]';

const isHTMLElement = (
  node: EventTarget | null | undefined,
): node is HTMLElement => node instanceof HTMLElement;

const matchesInteractiveRegion = (element?: HTMLElement | null) =>
  !!element?.closest?.(CAST_MODAL_INTERACTIVE_SELECTOR);

export const eventIsFromCastModalInteractiveRegion = (
  event?: Event,
  fallbackTarget?: EventTarget | null,
): boolean => {
  if (isHTMLElement(fallbackTarget) && matchesInteractiveRegion(fallbackTarget)) {
    return true;
  }

  if (!event) {
    return false;
  }

  const target = event.target;
  if (isHTMLElement(target) && matchesInteractiveRegion(target)) {
    return true;
  }

  const composedPath =
    typeof (event as any)?.composedPath === "function"
      ? (event as any).composedPath()
      : [];

  return composedPath.some((node) =>
    isHTMLElement(node) && matchesInteractiveRegion(node as HTMLElement),
  );
};
