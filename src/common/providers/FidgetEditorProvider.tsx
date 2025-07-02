"use client";

import React, { createContext, useContext, useState } from "react";

export interface FidgetEditorContextType {
  selectedFidgetID: string;
  setSelectedFidgetID: (id: string) => void;
  currentFidgetSettings: React.ReactNode;
  setCurrentFidgetSettings: (node: React.ReactNode) => void;
}

const FidgetEditorContext = createContext<FidgetEditorContextType | null>(null);

export const FidgetEditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedFidgetID, setSelectedFidgetID] = useState("");
  const [currentFidgetSettings, setCurrentFidgetSettings] = useState<React.ReactNode>(null);

  return (
    <FidgetEditorContext.Provider
      value={{
        selectedFidgetID,
        setSelectedFidgetID,
        currentFidgetSettings,
        setCurrentFidgetSettings,
      }}
    >
      {children}
    </FidgetEditorContext.Provider>
  );
};

export const useFidgetEditorContext = () => useContext(FidgetEditorContext);
