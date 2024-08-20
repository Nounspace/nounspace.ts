import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Cross2Icon } from "@radix-ui/react-icons";
import GenericToaster from "./GenericToaster";

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
  setToastState?: (state: boolean) => void;
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
  setToastState, // Pass the state setter
}: ModalProps) => {
  const handleModalClose = () => {
    setOpen(false);
  };

  const handleToastClose = () => {
    if (setToastState) setToastState(false);
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 " onClose={handleModalClose}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {overlay && (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
              </Transition.Child>
            )}

            {toastMessage && toastState && (
              <GenericToaster
                message={toastMessage}
                duration={5000}
                isError={toastMessage.startsWith("Failed")}
              />
            )}

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
                className="data-[state=open]:animate-contentShow fixed bg-background top-[40%]
                left-[50%] w-[100vw] max-w-[600px] translate-x-[-50%] translate-y-[-40%]
                rounded-[6px] p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,
                hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-50 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ borderRadius: "30px" }} // Add border radius here
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
                <div className="text-left">{children}</div>
                {showClose && (
                  <button
                    className="bg-transparent text-card-foreground/80 focus:shadow-background/90 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                    aria-label="Close"
                    onClick={handleModalClose}
                  >
                    <Cross2Icon color="black" />
                  </button>
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
