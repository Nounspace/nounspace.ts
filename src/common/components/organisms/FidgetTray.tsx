export interface FidgetTrayProps {}
import React from "react";
import { Card, CardFooter } from "../atoms/card";

export const FidgetTray: React.FC<FidgetTrayProps> = ({}) => {
  return (
    <div className="w-full h-full mx-4">
      <div className="inset-x-auto shadow-lg shadow-inner h-full"></div>
    </div>
  );
};

export default FidgetTray;
