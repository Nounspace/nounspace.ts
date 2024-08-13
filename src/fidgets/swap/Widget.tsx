"use client";
import React from "react";
import type { WidgetConfig, WidgetTheme } from "@lifi/widget";
import { LiFiWidget, WidgetSkeleton } from "@lifi/widget";
import { ClientOnly } from "./ClientOnly";

export function Widget({
  background,
  fontFamily,
  components,
  fontColor,
  secondaryColor,
  themes,
  sellToken,
  buyToken,
  fromChain,
  toChain,
}: {
  background: string;
  fontFamily: string;
  components: string;
  fontColor: string;
  secondaryColor: string;
  themes: WidgetTheme | string;
  sellToken: string;
  buyToken: string;
  fromChain: number;
  toChain: number;
}) {
  const custom_config = {
    hiddenUI: ["poweredBy"],
    fromChain: fromChain || 8453,
    toChain: toChain || 8453,
    fromAmount: 0.069,
    fromToken: sellToken || "",
    toToken: buyToken || "0x0a93a7BE7e7e426fC046e204C44d6b03A302b631",
    theme: {
      typography: {
        fontFamily: fontFamily,
        body1: {
          color: fontColor,
        },
        body2: {
          color: secondaryColor,
        },
      },
      palette: {
        primary: { main: components },
        background: {
          default: background,
          paper: background,
        },
        text: {
          primary: fontColor,
          secondary: secondaryColor,
        },
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: components,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              backgroundColor: components,
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              backgroundColor: components,
            },
          },
        },
        MuiInputCard: {
          styleOverrides: {
            root: {
              backgroundColor: components,
            },
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            subheader: {
              color: secondaryColor,
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              color: fontColor,
            },
          },
        },
      },
    },
  } as Partial<WidgetConfig>;

  const selected_config =
    themes === "Custom"
      ? custom_config
      : ({
          hiddenUI: ["poweredBy"],
          fromChain: fromChain || 8453,
          toChain: toChain || 8453,
          fromAmount: 0.069,
          fromToken: sellToken || "",
          toToken: buyToken || "0x0a93a7BE7e7e426fC046e204C44d6b03A302b631",
          theme: themes || {},
        } as Partial<WidgetConfig>);

  return (
    <div>
      <ClientOnly fallback={<WidgetSkeleton config={selected_config} />}>
        <LiFiWidget config={selected_config} integrator="nounspace" />
      </ClientOnly>
    </div>
  );
}
