/* eslint-disable @next/next/no-img-element */
import React, { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/common/components/atoms/dialog";

interface ExpandOnClickProps {
  children: React.ReactNode;
}

const ExpandOnClick: React.FC<ExpandOnClickProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    setIsOpen(true);
  }, []);

  const onOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  return (
    <>
      <div
        onClick={handleOpen}
        className="cursor-pointer size-full max-h-[inherit]"
      >
        {children}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="p-0 bg-transparent border-none shadow-none max-w-[max-content]"
          onOpenAutoFocus={onOpenAutoFocus}
          showCloseButton={false}
        >
          <div className="max-w-[calc(100vw-88px)] max-h-[calc(100vh-88px)] rounded-lg overflow-hidden">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpandOnClick;
