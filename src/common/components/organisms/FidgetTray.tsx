export interface FidgetTrayProps {}
import React from "react";
import { Card, CardFooter } from "../atoms/card";

export const FidgetTray: React.FC<FidgetTrayProps> = ({}) => {
  return (
    <>
      <Card className="inset-x-auto shadow-lg">
        <CardFooter className="gap-2 p-3">
          <div>Fidget Tray</div>
        </CardFooter>
      </Card>
    </>
  );
};

export default FidgetTray;
