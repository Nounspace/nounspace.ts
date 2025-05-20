"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import useIsMobile from "@/common/lib/hooks/useIsMobile";

export default function MobileScrollToTopProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, isMobile]);

  return <>{children}</>;
}
