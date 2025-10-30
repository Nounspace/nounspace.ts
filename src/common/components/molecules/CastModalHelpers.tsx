import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useModalContentContainer } from "./Modal";
import {
  CastModalPortalProvider,
} from "@/common/lib/utils/castModalInteractivity";

export const CAST_MODAL_INTERACTIVE_ATTR = "data-cast-modal-interactive";

export const CastModalPortalBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const modalContainer = useModalContentContainer();
  return (
    <CastModalPortalProvider value={modalContainer}>
      {children}
    </CastModalPortalProvider>
  );
};

/**
 * CastDiscardPrompt: accessible nested dialog rendered from inside modal.
 * Props:
 *   open: boolean - whether the discard prompt is open
 *   onClose: () => void - invoked when Cancel or overlay/Escape closes prompt
 *   onDiscard: () => void - invoked when user confirms discard
 * Behavior:
 *   Uses Radix Dialog to trap focus, handle Escape, and present a Portal overlay/content.
 *   Focus will move to the Cancel button when the prompt opens.
 */
export const CastDiscardPrompt: React.FC<{
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
}> = ({ open, onClose, onDiscard }) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (open) {
      // small microtask to ensure focus moves after dialog mount
      setTimeout(() => cancelRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <Dialog.Portal container={undefined}>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[10000] w-[min(560px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none"
          aria-labelledby="cast-discard-title"
          onEscapeKeyDown={() => onClose()}
        >
          <h2 id="cast-discard-title" className="text-lg font-semibold text-gray-900">
            Cancel Cast
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to discard this draft?
          </p>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              ref={cancelRef}
              type="button"
              className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
              onClick={() => {
                onDiscard();
                onClose();
              }}
            >
              Discard
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};