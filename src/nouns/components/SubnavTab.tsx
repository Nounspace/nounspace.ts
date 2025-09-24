"use client";
import { cn } from "@nouns/utils/shadcn";
import {
  ComponentProps,
  createContext,
  HTMLAttributes,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SubnavTabsContextInterface {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SubnavTabsContext = createContext<SubnavTabsContextInterface | undefined>(
  undefined,
);

export function useSubnavTabsContext() {
  const context = useContext(SubnavTabsContext);
  if (!context) {
    throw new Error("useSubnavTabsContext must be used within SubnavTabs");
  }
  return context;
}

export function SubnavTabs({
  defaultTab,
  children,
  className,
  ...props
}: {
  defaultTab: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const tabsRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (hasRendered.current) {
      if (tabsRef.current) {
        const top =
          tabsRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ behavior: "smooth", top: top - 64 });
      }
    } else {
      // Disable scroll on initial render
      hasRendered.current = true;
    }
  }, [activeTab]);

  return (
    <SubnavTabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      <div className={cn("", className)} ref={tabsRef} {...props}>
        {children}
      </div>
    </SubnavTabsContext.Provider>
  );
}

export function SubnavTabsList({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-6 flex w-full gap-8 border-b bg-background-primary text-content-secondary label-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SubnavTabsTrigger({
  tab,
  className,
  ...props
}: { tab: string } & Omit<HTMLAttributes<HTMLButtonElement>, "onClick">) {
  const { activeTab, setActiveTab } = useSubnavTabsContext();
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "border-content-primary py-2",
        activeTab == tab && "border-b-2 text-content-primary",
        className,
      )}
      {...props}
    />
  );
}

export function SubnavTabsContent({
  tab,
  className,
  ...props
}: { tab: string } & HTMLAttributes<HTMLDivElement>) {
  const { activeTab } = useSubnavTabsContext();
  return (
    <>{activeTab == tab && <div className={cn("", className)} {...props} />}</>
  );
}
