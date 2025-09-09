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
  const { currentIdentityPublicKey, spaceIdentityPublicKey } = context;

  if (!currentIdentityPublicKey) {
    return { isEditable: false, isLoading: false };
  }

  if (!spaceIdentityPublicKey) {
    return { isEditable: false, isLoading: false };
  }

  return {
    isEditable: currentIdentityPublicKey === spaceIdentityPublicKey,
    isLoading: false,
  };
};
