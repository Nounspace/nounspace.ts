"use client";
import React from "react";
import { createContext, useContext } from "react";

export const UserSpaceContext = createContext<Promise<any> | null>(null);

export function UserSpaceProvider({
  children,
  userSpacePromise,
}: {
  children: React.ReactNode;
  userSpacePromise: Promise<any>;
}) {
  return (
    <UserSpaceContext.Provider value={userSpacePromise}>
      {children}
    </UserSpaceContext.Provider>
  );
}

export function useUserSpaceContext() {
  const context = useContext(UserSpaceContext);
  if (!context) {
    throw new Error(
      "useUserSpaceContext must be used within a UserSpaceProvider",
    );
  }
  return context;
}
