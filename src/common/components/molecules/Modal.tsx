import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

export type ModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  showClose?: boolean;

  // The modality of the dialog. When set to true, interaction with outside elements
  // will be disabled and only dialog content will be visible to screen readers.
  focusMode?: boolean;
};

const Modal = ({
  open,
  setOpen,
  title,
  description,
  children,
  focusMode = true,
  showClose = true,
  overlay = true,
}: ModalProps) => (
  <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Portal>
      {overlay && open && (
        <Dialog.Overlay className="bg-muted/95 data-[state=open]:animate-overlayShow fixed inset-0 z-infinity" />
      )}
      <Dialog.Content
        className={mergeClasses(
          "data-[state=open]:animate-contentShow fixed bg-background top-[40%]",
          "left-[50%] w-[100vw] max-w-[600px] translate-x-[-50%] translate-y-[-40%] rounded-[10px] p-[25px]",
          "shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none",
          "z-infinity",
        )}
        onMouseDown={(e) => e.stopPropagation()} // Fixes issue causing grid items to remain draggable behind open modal
      >
        {
          <Dialog.Title
            className={
              title
                ? "text-card-foreground m-0 text-[17px] font-medium"
                : "invisible"
            }
          >
            {title}
          </Dialog.Title>
        }
        {
          <Dialog.Description
            className={
              description
                ? "text-card-foreground/80 mt-[10px] mb-5 text-[15px] leading-normal"
                : "invisible"
            }
          >
            {description}
          </Dialog.Description>
        }
        {children}
        {showClose ? (
          <Dialog.Close asChild>
            <button
              className=" text-gray-400 text-card-foreground/80 bg-background/90 focus:shadow-background/90 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        ) : null}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default Modal;
