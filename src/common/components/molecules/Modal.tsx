import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import GenericToaster from "@/common/components/organisms/GenericToaster";

export type ModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  showClose?: boolean;
  focusMode?: boolean;
  toastMessage?: string;
  toastState?: boolean;
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
  toastMessage,
  toastState,
}: ModalProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={mergeClasses(
                  "data-[state=open]:animate-contentShow fixed bg-background top-[40%]",
                  "left-[50%] w-[100vw] max-w-[600px] translate-x-[-50%] translate-y-[-40%] rounded-[6px] p-[25px]",
                  "shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none",
                  "z-50",
                  "pointer-events-auto", // Allow pointer events to pass through to the dropdown
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {title && (
                  <Dialog.Title className="text-card-foreground m-0 text-[17px] font-medium">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-card-foreground/80 mt-[10px] mb-5 text-[15px] leading-normal">
                    {description}
                  </Dialog.Description>
                )}
                {children}
                {showClose && (
                  <button
                    className="bg-transparent text-card-foreground/80 focus:shadow-background/90 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <Cross2Icon color="black" />
                  </button>
                )}
                {toastMessage && toastState !== undefined && (
                  <GenericToaster message={toastMessage} duration={5000} />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
