import React from "react";
import { Branch as DismissableLayerBranch } from "@radix-ui/react-dismissable-layer";

const CAST_MODAL_INTERACTIVE_SELECTOR = '[data-cast-modal-interactive="true"]';
const CAST_MODAL_ADDITIONAL_INTERACTIVE_SELECTORS = [
  "[data-radix-popover-content-wrapper]",
  "[cmdk-root]",
] as const;

const CAST_MODAL_INTERACTIVE_SELECTORS = [
  CAST_MODAL_INTERACTIVE_SELECTOR,
  ...CAST_MODAL_ADDITIONAL_INTERACTIVE_SELECTORS,
] as const;

const isHTMLElement = (
  node: EventTarget | null | undefined,
): node is HTMLElement => node instanceof HTMLElement;

const matchesInteractiveRegion = (element?: HTMLElement | null) =>
  !!element &&
  CAST_MODAL_INTERACTIVE_SELECTORS.some(
    (selector) => !!element.closest(selector),
  );

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

type CastModalInteractiveBranchProps = React.ComponentPropsWithoutRef<
  typeof DismissableLayerBranch
>;

export const CastModalInteractiveBranch = React.forwardRef<
  HTMLDivElement,
  CastModalInteractiveBranchProps
>(({ children, ...props }, forwardedRef) =>
  React.createElement(
    DismissableLayerBranch,
    {
      ...props,
      ref: forwardedRef,
    },
    children,
  ),
);

CastModalInteractiveBranch.displayName = "CastModalInteractiveBranch";
