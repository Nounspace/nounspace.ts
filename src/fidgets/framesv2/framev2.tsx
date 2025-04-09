"use client";

import { fallbackFrameContext } from "@frames.js/render";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import type { MockHubActionContext } from "./lib/mock-hub-utils";
import { protocolConfigurationMap } from "./components/protocol-config-button";
import type {
  ParseFramesWithReportsResult,
  // SupportedParsingSpecification,
  ParseFramesV2ResultWithFrameworkDetails,
} from "frames.js/frame-parsers";
import type {
  CastActionDefinitionResponse,
  FrameDefinitionResponse,
} from "./lib/utils";
import { useAnonymousIdentity } from "@frames.js/render/identity/anonymous";
import { useFarcasterFrameContext } from "@frames.js/render/identity/farcaster";
import {
  useLensFrameContext,
  useLensIdentity,
} from "@frames.js/render/identity/lens";
import {
  useXmtpFrameContext,
  useXmtpIdentity,
} from "@frames.js/render/identity/xmtp";
import { useFarcasterIdentity } from "./hooks/useFarcasterIdentity";
import { ProtocolSelectorProvider } from "./providers/ProtocolSelectorProvider";
import { FrameContextProvider } from "./providers/FrameContextProvider";

import { FrameUI } from "./frame-ui";
import { FrameApp } from "./components/frame-app";
import { useFrame_unstable as useFrame } from "@frames.js/render/unstable-use-frame";
import { useSharedFrameEventHandlers } from "./hooks/useSharedFrameEventHandlers";
import { attribution, CollapsedFrameUI, defaultTheme } from "@frames.js/render";
import { useFrameContext } from "./providers/FrameContextProvider";
import { FrameImageNext } from "@frames.js/render/next";
import { type UseFrameAppInIframeReturn } from "@frames.js/render/frame-app/iframe";
import type { FarcasterSignerInstance } from "@frames.js/render/identity/farcaster";
import { PartialFrameV2 } from "@frames.js/render/unstable-types";
import type { Frame } from "frames.js/farcaster-v2/types";

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

export type ProtocolConfiguration =
  | {
      protocol: "farcaster";
      specification: "farcaster";
    }
  | {
      protocol: "farcaster_v2";
      specification: "farcaster_v2";
    };

// const FALLBACK_URL =
//   process.env.NEXT_PUBLIC_DEBUGGER_DEFAULT_URL || "https://f.bracket.game";

export default function FrameV2Fidget({
  searchParams,
  examples,
}: {
  searchParams: Record<string, string>;
  examples?: React.ReactNode;
}): JSX.Element {
  // const debuggerRef = useRef<FrameDebuggerRef>(null);
  const actionDebuggerRef = null; //useRef<ActionDebuggerRef>(null);
  // const debuggerConsole = useDebuggerConsole();
  const urlInputRef = useRef<HTMLInputElement>(null);
  const selectProtocolButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const [frameV2LaunchContext, setFrameV2LaunchContext] =
    useState<FrameLaunchedInContext | null>(null);

  // Define the onFrameLaunchedInContext function
  const onFrameLaunchedInContext = useCallback(
    (launchContext: FrameLaunchedInContext) => {
      setFrameV2LaunchContext(launchContext);
    },
    []
  );

  /**
   * Parse the URL from the query string. This will also cause debugger to automatically load the frame.
   */
  const url = useMemo(() => {
    try {
      if (!searchParams.url) {
        return undefined;
      }

      const parsedUrl = new URL(searchParams.url);

      return parsedUrl.toString();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, [searchParams.url]);
  const [initialFrame, setInitialFrame] =
    useState<ParseFramesWithReportsResult>();
  const [initialAction, setInitialAction] =
    useState<CastActionDefinitionResponse>();
  const [mockHubContext, setMockHubContext] = useState<
    Partial<MockHubActionContext>
  >({
    enabled: true,
    requesterFollowsCaster: false,
    casterFollowsRequester: false,
    likedCast: false,
    recastedCast: false,
  });
  const account = useAccount();
  const selectedProtocol = "farcaster_v2";
  const protocolConfiguration = protocolConfigurationMap[selectedProtocol];

  const refreshUrl = useCallback(
    (newUrl?: string) => {
      if (!url || !protocolConfiguration?.specification) {
        return;
      }

      const searchParams = new URLSearchParams({
        url: newUrl || url,
        specification: protocolConfiguration?.specification,
        actions: "true",
      });
      const proxiedUrl = `/frames?${searchParams.toString()}`;

      setIsLoading(true);
      fetch(proxiedUrl)
        .then(async (res) => {
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json.message);
          }

          return res.json() as Promise<
            CastActionDefinitionResponse | FrameDefinitionResponse
          >;
        })
        .then((json) => {
          if (json.type === "action") {
            setInitialAction(json);
            setInitialFrame(undefined);
            setFrameV2LaunchContext(null);
          } else if (json.type === "frame") {
            setInitialFrame(json);
            setInitialAction(undefined);
            setFrameV2LaunchContext(null);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [url, protocolConfiguration, null]
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    if (!protocolConfiguration) {
      return;
    }

    refreshUrl(url);
  }, [url, protocolConfiguration, refreshUrl]);

  const farcasterSignerState = useFarcasterIdentity();
  const farcasterFrameContext = useFarcasterFrameContext({
    fallbackContext: fallbackFrameContext,
  });

  const selectProtocolContextValue = useMemo(() => {
    return {
      open() {
        selectProtocolButtonRef.current?.click();
      },
    };
  }, []);

  const frameContextValue = useMemo(() => {
    return {
      farcaster: farcasterFrameContext.frameContext,
    };
  }, [farcasterFrameContext.frameContext]);

  const sharedFrameEventHandlers = useSharedFrameEventHandlers({
    debuggerRef: null,
  });

  const protocol: ProtocolConfiguration = {
    protocol: "farcaster_v2",
    specification: "farcaster_v2",
  };

  const frameContext = useFrameContext();

  const frameState = useFrame({
    ...sharedFrameEventHandlers,
    frame: initialFrame,
    homeframeUrl: url,
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    // frameStateHook: useDebuggerFrameState,
    extraButtonRequestPayload: { mockData: mockHubContext },
    transactionDataSuffix:
      process.env.NEXT_PUBLIC_FARCASTER_ATTRIBUTION_FID &&
      protocol.protocol === "farcaster_v2"
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
    },
    onLaunchFrameButtonPressed(event) {
      if (event.status === "partial") {
        console.log(`
          title: "Partial frame loaded",
          description:
            "The frame is invalid, please fix errors before you decide to launch it publicly.",
          variant: "destructive",
          action: undefined,
        }`);
      }

      onFrameLaunchedInContext({
        context: "button_press",
        frame: event.frame,
        parseResult: event.parseResult,
      });
    },
  });

  const handleFrameError = useCallback((e: Error) => {
    console.error(e);
  }, []);
  const { currentFrameStackItem } = frameState;
  const [appIdCounter, reloadApp] = useReducer((state) => state + 1, 0);
  const [frameApp, setFrameApp] = useState<UseFrameAppInIframeReturn | null>(
    null
  );
  const farcasterSigner: FarcasterSignerInstance = farcasterSignerState;
  const farcasterSignerRef = useRef(farcasterSigner);
  farcasterSignerRef.current = farcasterSigner;
  const userContext = useRef<{ fid: number }>({ fid: -1 });
  const [viewFidProfile, setViewFidProfile] = useState<number | null>(null);

  if (
    farcasterSigner &&
    farcasterSigner.signer &&
    (farcasterSigner.signer?.status === "approved" ||
      userContext.current.fid !== farcasterSigner.signer._id)
  ) {
    userContext.current = {
      fid: farcasterSigner.signer._id as number,
    };
  }

  return (
    <>
      <div className="bg-slate-50 min-h-lvh grid grid-rows-[auto_1fr]">
        {url && (
          <>
            {/* {initialAction && <div></div>} */}

            {initialFrame && !!protocolConfiguration && (
              <div className="">
                <div className="flex flex-col gap-4 order-0 lg:order-1">
                  <div
                    className="w-full flex flex-col gap-1"
                    id="frame-preview"
                  >
                    <FrameUI
                      frameState={frameState}
                      allowPartialFrame={true}
                      enableImageDebugging={false}
                      onError={handleFrameError}
                    />
                    {/* display frame url bellow frame */}

                    {!isLoading &&
                      protocol.specification !== "farcaster_v2" && (
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
                              (currentFrameStackItem.frameResult
                                .specification === "farcaster" ||
                                currentFrameStackItem.frameResult
                                  .specification === "openframes") &&
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
                                        borderColor:
                                          defaultTheme.buttonBorderColor,
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
            )}

            {initialFrame &&
              !!protocolConfiguration &&
              frameV2LaunchContext && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[300px_500px_1fr] p-4 gap-4 bg-slate-50 max-w-full w-full">
                  <div className="flex flex-col gap-4 order-0 lg:order-1">
                    <FrameApp
                      key={appIdCounter}
                      frameAppNotificationManager={
                        null // frameAppNotificationManager
                      }
                      userContext={userContext.current}
                      onClose={() => {
                        setFrameV2LaunchContext(null);
                      }}
                      onViewProfile={async (params) =>
                        setViewFidProfile(params.fid)
                      }
                      onFrameAppUpdate={setFrameApp}
                      context={frameV2LaunchContext}
                    />
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
}
