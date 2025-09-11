export type EditabilityCheck = {
  isEditable: boolean;
  isLoading: boolean;
};

export type EditabilityContext = {
  /** Public key of the identity currently being used by the viewer */
  currentIdentityPublicKey?: string | null;
  /** Public key recorded for the space being viewed */
  spaceIdentityPublicKey?: string | null;
};

/**
 * Determine whether the current viewer can customise the space.
 *
 * A space is editable only when the viewer's identity matches the
 * identity recorded for the space. Unregistered spaces will simply
 * return `isEditable: false`.
 */
export const createEditabilityChecker = (
  context: EditabilityContext,
): EditabilityCheck => {
  const normalizeKey = (key?: string | null) =>
    typeof key === "string" && key.trim().length > 0
      ? key
          .trim()
          .replace(/^0x/i, "")
          .toLowerCase()
      : null;

  const currentKey = normalizeKey(context.currentIdentityPublicKey);
  const spaceKey = normalizeKey(context.spaceIdentityPublicKey);

  if (!currentKey || !spaceKey) {
    return { isEditable: false, isLoading: false };
  }

  return {
    isEditable: currentKey === spaceKey,
    isLoading: false,
  };
};
