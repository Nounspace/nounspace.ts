import React from "react";
import { FidgetSettings } from "..";

export interface ExampleFidgetSettings extends FidgetSettings {
  text: string,
}

export const ExampleFidget: React.FC<ExampleFidgetSettings> = ({
  text
}: ExampleFidgetSettings) => {
  return (
    <h1>{ text }</h1>
  );
};
