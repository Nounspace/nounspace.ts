"use client";
import React, { useEffect } from "react";

export default function PwaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("Service worker registration failed", err));
    }
  }, []);

  return <>{children}</>;
}
