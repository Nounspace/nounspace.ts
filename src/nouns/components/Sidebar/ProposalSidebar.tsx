"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  HTMLAttributes,
  ComponentProps,
} from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { PanelRight } from "lucide-react";
import { cn } from "@nouns/utils/shadcn";

const SIDEBAR_WIDTH = 480;

interface SidebarContextProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      <div className="flex w-full min-w-0">{children}</div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick">) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn("", className)}
      onClick={toggleSidebar}
      variant="ghost"
      size="icon"
      {...props}
    >
      <PanelRight size={20} />
    </Button>
  );
}

export function SidebarMainContent({
  className,
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex min-w-0 grow flex-col items-center")} {...props}>
      <SidebarTrigger className="sticky top-[88px] mr-6 mt-[-44px] self-end" />
      {children}
    </div>
  );
}

export function SidebarSideContent({
  className,
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebar();
  return (
    <motion.div
      animate={{ width: isOpen ? SIDEBAR_WIDTH : 0 }}
      className={cn(
        "sticky top-[64px] h-[calc(100dvh-64px)] shrink-0 overflow-hidden border-l",
      )}
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div
        className={cn("h-full overflow-y-auto", className)}
        style={{ minWidth: SIDEBAR_WIDTH }}
        {...props}
      >
        {children}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[64px] bg-gradient-to-t from-white to-transparent" />
    </motion.div>
  );
}
