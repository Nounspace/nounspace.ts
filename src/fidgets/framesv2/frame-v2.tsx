import { getFrameHtmlHead, getFrameV2HtmlHead } from "frames.js";

import { Button } from "../../../src/common/components/atoms/button";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import React from "react";
import { useFrame_unstable as useFrame } from "@frames.js/render/unstable-use-frame";
import { attribution, CollapsedFrameUI, defaultTheme } from "@frames.js/render";
import { FrameImageNext } from "@frames.js/render/next";
import {
  BanIcon,
  HomeIcon,
  InfoIcon,
  LayoutGridIcon,
  RefreshCwIcon,
} from "lucide-react";
import { MockHubConfig } from "./lib/mock-hub-config";
import type { MockHubActionContext } from "./lib/mock-hub-utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FrameUI } from "./frame-ui";
import { useDebuggerFrameState } from "./hooks/useDebuggerFrameState";
import { FrameDebuggerRequestCardContent } from "./frame-v2-request-card-content";
import { useSharedFrameEventHandlers } from "./hooks/useSharedFrameEventHandlers";
import { useFarcasterIdentity } from "./hooks/useFarcasterIdentity";
import type {
  ParseFramesV2ResultWithFrameworkDetails,
  ParseFramesWithReportsResult,
} from "frames.js/frame-parsers";
import { useFrameContext } from "./providers/FrameContextProvider";
import { FrameDebuggerFarcasterManifestDetails } from "./frame-v2-farcaster-manifest-details";
import type { Frame } from "frames.js/farcaster-v2/types";
import { PartialFrameV2 } from "@frames.js/render/unstable-types";

export type ProtocolConfiguration =
  | {
      protocol: "farcaster";
      specification: "farcaster";
    }
  | {
      protocol: "farcaster_v2";
      specification: "farcaster_v2";
    }
  | {
      protocol: "lens";
      specification: "openframes";
    }
  | {
      protocol: "xmtp";
      specification: "openframes";
    }
  | {
      protocol: "anonymous";
      specification: "openframes";
    };

// @todo uncomment once triggers are implemented upstream
export type FrameLaunchedInContext =
  /* | {
      context: "trigger";
      triggerConfig: TriggerConfig;
      frame: Frame;
      parseResult: ParseFramesV2ResultWithFrameworkDetails;
    }*/
  {
    context: "button_press";
    frame: Frame | PartialFrameV2;
    parseResult: ParseFramesV2ResultWithFrameworkDetails;
  };

type FrameDebuggerProps = {
  url: string;
  mockHubContext?: Partial<MockHubActionContext>;
  setMockHubContext?: Dispatch<SetStateAction<Partial<MockHubActionContext>>>;
  hasExamples: boolean;
  protocol: ProtocolConfiguration;
  initialFrame?: ParseFramesWithReportsResult;
  onFrameLaunchedInContext: (launchContext: FrameLaunchedInContext) => void;
};

export type FrameDebuggerRef = {
  showConsole(): void;
};

type TabValues = "diagnostics" | "image" | "console" | "request" | "meta";

export const FrameDebugger = React.forwardRef<
  FrameDebuggerRef,
  FrameDebuggerProps
>(
  (
    {
      hasExamples,
      url,
      mockHubContext,
      setMockHubContext,
      protocol,
      initialFrame,
      onFrameLaunchedInContext,
    },
    ref
  ) => {
    // const { toast } = useToast();
    const farcasterSignerState = useFarcasterIdentity();
    const xmtpSignerState = null; //useXmtpIdentity();
    const lensSignerState = null; //useLensIdentity();
    const anonymousSignerState = null; //useAnonymousIdentity();
    const frameContext = useFrameContext();
    const sharedFrameEventHandlers = useSharedFrameEventHandlers({
      debuggerRef: null,
    });

    const frameState = useFrame({
      ...sharedFrameEventHandlers,
      frame: initialFrame,
      homeframeUrl: url,
      frameActionProxy: "/frames",
      frameGetProxy: "/frames",
      frameStateHook: useDebuggerFrameState,
      extraButtonRequestPayload: { mockData: mockHubContext },
      transactionDataSuffix:
        process.env.NEXT_PUBLIC_FARCASTER_ATTRIBUTION_FID &&
        (protocol.protocol === "farcaster" ||
          protocol.protocol === "farcaster_v2")
          ? attribution(
              parseInt(process.env.NEXT_PUBLIC_FARCASTER_ATTRIBUTION_FID)
            )
          : undefined,
      resolveSigner() {
        return farcasterSignerState.withContext(frameContext.farcaster, {
          specification: protocol.specification,
        });
      },
      onError(error) {
        console.error(error);

        toast({
          title: "Error occurred",
          description: (
            <div className="space-y-2">
              <p>{error.message}</p>
              <p>Please check the console for more information</p>
            </div>
          ),
          variant: "destructive",
          action: <div>ToastAction</div>,
        });
      },
      onLaunchFrameButtonPressed(event) {
        if (event.status === "partial") {
          toast({
            title: "Partial frame loaded",
            description:
              "The frame is invalid, please fix errors before you decide to launch it publicly.",
            variant: "destructive",
            action: undefined,
          });
        }

        onFrameLaunchedInContext({
          context: "button_press",
          frame: event.frame,
          parseResult: event.parseResult,
        });
      },
    });
    const debuggerConsoleTabRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabValues>("diagnostics");
    const router = useRouter();
    const [copySuccess, setCopySuccess] = useState(false);
    const [imageDebuggingEnabled, setImageDebuggingEnabled] = useState(false);

    useEffect(() => {
      if (copySuccess) {
        setTimeout(() => {
          setCopySuccess(false);
        }, 1000);
      }
    }, [copySuccess, setCopySuccess]);

    const { currentFrameStackItem } = frameState;

    const isLoading = currentFrameStackItem?.status === "pending";

    /**
     * This handles the case where the user clicks on the console button in toast,
     * in that case he wants to scroll to the bottom
     * otherwise we should keep the scroll position as is.
     */
    const wantsToScrollConsoleToBottomRef = useRef(false);

    const showConsole = useCallback(() => {
      wantsToScrollConsoleToBottomRef.current = true;
      setActiveTab("console");
    }, []);

    useImperativeHandle(ref, () => {
      return { showConsole };
    }, [showConsole]);

    const handleFrameError = useCallback(
      (e: Error) => {
        toast({
          title: "Unexpected error",
          description: "Please check the console for more information",
          variant: "destructive",
          action: <div>Show console</div>,
        });
        console.error(e);
      },
      [toast, showConsole]
    );

    const isImageDebuggingAvailable = false;

    return (
      <div className="">
        <div className="flex flex-col gap-4 order-0 lg:order-1">
          <div className="w-full flex flex-col gap-1" id="frame-preview">
            <FrameUI
              frameState={frameState}
              allowPartialFrame={true}
              enableImageDebugging={imageDebuggingEnabled}
              onError={handleFrameError}
            />
            {/* display frame url bellow frame */}

            {!isLoading && protocol.specification !== "farcaster_v2" && (
              <>
                {currentFrameStackItem?.request.method === "GET" && (
                  <div className="my-5">
                    <h3 className="font-bold">Preview</h3>
                    <div className="border rounded mt-2">
                      <CollapsedFrameUI
                        frameState={frameState}
                        theme={{ bg: "white" }}
                        FrameImage={FrameImageNext}
                        allowPartialFrame
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  {currentFrameStackItem?.status === "done" &&
                    (currentFrameStackItem.frameResult.specification ===
                      "farcaster" ||
                      currentFrameStackItem.frameResult.specification ===
                        "openframes") &&
                    currentFrameStackItem.frameResult.frame.buttons
                      ?.filter(
                        (button) =>
                          button.target?.startsWith(
                            "https://warpcast.com/~/add-cast-action"
                          ) ||
                          button.target?.startsWith(
                            "https://warpcast.com/~/composer-action"
                          )
                      )
                      .map((button) => {
                        // Link to debug target
                        return (
                          <button
                            key={button.target}
                            className="border text-sm text-gray-800 rounded flex p-2 w-full gap-2"
                            onClick={() => {
                              const url = new URL(button.target!);
                              const params = new URLSearchParams({
                                url: url.searchParams.get("url")!,
                              });

                              router.push(`/?${params.toString()}`);
                            }}
                            style={{
                              flex: "1 1 0px",
                              // fixme: hover style
                              backgroundColor: defaultTheme.buttonBg,
                              borderColor: defaultTheme.buttonBorderColor,
                              color: defaultTheme.buttonColor,
                              cursor: "pointer",
                            }}
                          ></button>
                        );
                      })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FrameDebugger.displayName = "FrameDebugger";

function toast(arg0: {
  title: string;
  description: any;
  variant: any;
  action: any;
}) {
  // Create an alert with the title and description
  console.log(`Toast: ${arg0.title}`);
  console.log(`Description: `, arg0.description);

  // In a real implementation this would show a toast notification UI component
  // For now we'll just log to console since the UI components are commented out
  // This maintains the error reporting functionality in a basic way
}

/*
[Rest of the commented out code remains unchanged]
*/
