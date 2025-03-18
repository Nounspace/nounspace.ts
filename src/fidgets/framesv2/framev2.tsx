"use client";
/** requires client because signer is stored in local storage */

// import { Framev2Modal } from "./framev2Modal";
import { Button } from "@/common/components/atoms/button";
// import { Button } from "@/components/ui/button";`
// import { Input } from "@/components/ui/input";
import TextInput from "@/common/components/molecules/TextInput";
import { fallbackFrameContext } from "@frames.js/render";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
// import pkg from "../package.json";
import {
  FrameDebugger,
  FrameLaunchedInContext,
  type FrameDebuggerRef,
} from "./frame-v2";
import { LOCAL_STORAGE_KEYS } from "./constants";
import type { MockHubActionContext } from "./lib/mock-hub-utils";
import {
  type ProtocolConfiguration,
  protocolConfigurationMap,
//   ProtocolConfigurationButton,
} from "./components/protocol-config-button";

// import {
//   ActionDebugger,
//   type ActionDebuggerRef,
// } from "./components/action-debugger";
import type { ParseFramesWithReportsResult } from "frames.js/frame-parsers";
// import type { parseFarcasterFrameV2 } from "frames.js/frame-parsers";

// import { Loader2 } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { ToastAction } from "@/components/ui/toast";
import {
  DebuggerConsoleContextProvider,
  useDebuggerConsole,
} from "./components/debugger-console";
// import { ProfileSelectorModal } from "./components/lens-profile-select";
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
import { FrameAppDebugger } from "./components/frame-app-debugger";

const FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEBUGGER_DEFAULT_URL || "https://f.bracket.game";

export default function FrameV2Fidget({
  searchParams,
  examples,
}: {
  searchParams: Record<string, string>;
  examples?: React.ReactNode;
}): JSX.Element {
  const debuggerRef = useRef<FrameDebuggerRef>(null);
  const actionDebuggerRef = null;//useRef<ActionDebuggerRef>(null);
  const debuggerConsole = useDebuggerConsole();
  // const { toast } = useToast();
  const urlInputRef = useRef<HTMLInputElement>(null);
  const selectProtocolButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [protocolConfiguration, setProtocolConfiguration] =
    useState<ProtocolConfiguration | null>(null);
  const [frameV2LaunchContext, setFrameV2LaunchContext] =
    useState<FrameLaunchedInContext | null>(null);
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

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.SELECTED_PROTOCOL,
    "farcaster_v2"
  );

  const selectedProtocol = "farcaster_v2";
  // const protocolConfiguration = protocolConfigurationMap[selectedProtocol];

  useEffect(() => {
    const selectedProtocol = "farcaster_v2";
    // localStorage.getItem(
      // LOCAL_STORAGE_KEYS.SELECTED_PROTOCOL  
  // });

    if (selectedProtocol) {
      setProtocolConfiguration(
        protocolConfigurationMap[selectedProtocol]
      );
    }

    console.log(
      ` pkg.name, Version pkg.version`
    );
    console.log(
      "%c" +
        "*You'll find console.log statements from your frames in the server logs in your terminal, not here.*",
      "font-weight:bold;"
    );
  }, []);

  // useEffect(() => {
  //   if (protocolConfiguration)
  //     localStorage.setItem(
  //       LOCAL_STORAGE_KEYS.SELECTED_PROTOCOL,
  //       protocolConfiguration.protocol
  //     );
  // }, [protocolConfiguration]);

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
          // toast({
          //   title: "Error loading url",
          //   description: "Please check the console for more information",
          //   variant: "destructive",
          //   action: debuggerRef.current ? (
          //       "Show console"
          //   ) : undefined,
          // });
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
    //   toast({
    //     title: "Select Protocol",
    //     description: "Please select a protocol to debug the URL",
    //     variant: "destructive",
    //     action: (
    //       // <ToastAction
    //       //   altText="Select"
    //       //   onClick={() => {
    //       //     selectProtocolButtonRef.current?.click();
    //       //   }}
    //       //   type="button"
    //       // >
    //       //   Select
    //       // </ToastAction>
    //     ),
    //   });
      return;
    }

    debuggerConsole.clear();
    refreshUrl(url);
  }, [url, protocolConfiguration, refreshUrl, null, debuggerConsole]);

  const farcasterSignerState = useFarcasterIdentity();
  const xmtpSignerState = useXmtpIdentity();
  const lensSignerState = useLensIdentity();
  const anonymousSignerState = useAnonymousIdentity();
  const farcasterFrameContext = useFarcasterFrameContext({
    fallbackContext: fallbackFrameContext,
  });
  const xmtpFrameContext = useXmtpFrameContext({
    fallbackContext: {
      conversationTopic: "test",
      participantAccountAddresses: account.address
        ? [account.address, zeroAddress]
        : [zeroAddress],
    },
  });
  const lensFrameContext = useLensFrameContext({
    fallbackContext: {
      pubId: "0x01-0x01",
    },
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
      xmtp: xmtpFrameContext.frameContext,
      lens: lensFrameContext.frameContext,
      anonymous: {},
    };
  }, [
    farcasterFrameContext.frameContext,
    xmtpFrameContext.frameContext,
    lensFrameContext.frameContext,
  ]);

  return (
    <ProtocolSelectorProvider value={selectProtocolContextValue}>
      <FrameContextProvider value={frameContextValue}>
        <DebuggerConsoleContextProvider value={debuggerConsole}>
          <div className="bg-slate-50 min-h-lvh grid grid-rows-[auto_1fr]">
            {/* <div className="flex flex-row gap-4 border-b p-2 px-4 items-center h-full bg-white">
               <form
                className="flex flex-row"
                onSubmit={(e) => {
                  e.preventDefault();

                  const newUrl =
                    new FormData(e.currentTarget).get("url")?.toString() || "";

                  if (!newUrl) {
                    // toast({
                    //   title: "Missing URL",
                    //   description: "Please provide a URL to debug",
                    //   variant: "destructive",
                    //   action: (
                    //     // <ToastAction
                    //     //   altText="Fix"
                    //     //   onClick={() => {
                    //     //     urlInputRef.current?.focus();
                    //     //   }}
                    //     //   type="button"
                    //     // >
                    //     //   Fix
                    //     // </ToastAction>
                    //   ),
                    // });
                    return;
                  }

                  try {
                    const parsedUrl = new URL(newUrl);

                    if (
                      parsedUrl.protocol !== "http:" &&
                      parsedUrl.protocol !== "https:"
                    ) {
                      throw new Error("Invalid protocol");
                    }

                    if (!protocolConfiguration) {
                      // toast({
                      //   title: "Select Protocol",
                      //   description:
                      //     "Please select a protocol to debug the URL",
                      //   variant: "destructive",
                      //   action: (
                      //     // <ToastAction
                      //     //   altText="Select"
                      //     //   onClick={() => {
                      //     //     selectProtocolButtonRef.current?.click();
                      //     //   }}
                      //     //   type="button"
                      //     // >
                      //     //   Select
                      //     // </ToastAction>
                      //   ),
                      // });
                      return;
                    }

                    if (searchParams.url === parsedUrl.toString()) {
                      location.reload();
                    }

                    router.push(
                      `?url=${encodeURIComponent(parsedUrl.toString())}`
                    );
                  } catch (e) {
                    // toast({
                    //   title: "Invalid URL",
                    //   description:
                    //     "URL must start with http:// or https:// and be in valid format",
                    //   variant: "destructive",
                    //   action: (
                    //     // <ToastAction
                    //     //   altText="Fix"
                    //     //   onClick={() => {
                    //     //     urlInputRef.current?.focus();
                    //     //   }}
                    //     //   type="button"
                    //     // >
                    //     //   Fix
                    //     // </ToastAction>
                    //   ),
                    // });

                    return;
                  }
                }}
              >
                <TextInput
                  type="text"
                  name="url"
                  ref={urlInputRef}
                  className="w-[400px] px-2 py-1 border border-gray-400 rounded-l rounded-r-none"
                  defaultValue={url ?? FALLBACK_URL}
                  value={url ?? FALLBACK_URL}
                  placeholder="Enter URL"
                />
                <Button
                  className="rounded-l-none"
                  disabled={isLoading}
                  type="submit"
                >
                  {/* {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )} * /}
                  Load
                </Button>
              </form> */}

              {/* <ProtocolConfigurationButton
                onChange={(spec) => {
                  setProtocolConfiguration(spec);
                }}
                value={protocolConfiguration}
                farcasterSignerState={farcasterSignerState}
                xmtpSignerState={xmtpSignerState}
                anonymousSignerState={anonymousSignerState}
                farcasterFrameContext={farcasterFrameContext}
                xmtpFrameContext={xmtpFrameContext}
                ref={selectProtocolButtonRef}
                lensFrameContext={lensFrameContext}
                lensSignerState={lensSignerState}
              ></ProtocolConfigurationButton> 

              <div className="ml-auto">
                {/* <ConnectButton showBalance={false}></ConnectButton> * /}
              </div>
            </div> */}
            {url ? (
              <>
                {initialAction && (
                  <div>
                    {/* <ActionDebugger
                      actionMetadataItem={initialAction}
                      refreshUrl={refreshUrl}
                      mockHubContext={mockHubContext}
                      setMockHubContext={setMockHubContext}
                      hasExamples={!!examples}
                      ref={actionDebuggerRef}
                    /> */}
                  </div>
                )}

                {initialFrame && !!protocolConfiguration && (
                  <FrameDebugger
                    // use key so the frame debugger state is completely reset when protocol changes
                    key={protocolConfiguration.protocol}
                    url={url}
                    mockHubContext={mockHubContext}
                    setMockHubContext={setMockHubContext}
                    protocol={protocolConfiguration}
                    ref={debuggerRef}
                    hasExamples={!!examples}
                    onFrameLaunchedInContext={setFrameV2LaunchContext}
                  />
                )}

                {initialFrame &&
                  !!protocolConfiguration &&
                  frameV2LaunchContext && (
                    <FrameAppDebugger
                      context={frameV2LaunchContext}
                      farcasterSigner={farcasterSignerState}
                      onClose={() => {
                        setFrameV2LaunchContext(null);
                      }}
                    />
                  )}
              </>
            ) : (
              examples
            )}
          </div>
          {/* {lensSignerState.showProfileSelector && (
            <ProfileSelectorModal
              profiles={lensSignerState.availableProfiles}
              onSelect={lensSignerState.handleSelectProfile}
              show={lensSignerState.showProfileSelector}
              onClose={lensSignerState.closeProfileSelector}
            />
          )} */}
        </DebuggerConsoleContextProvider>
      </FrameContextProvider>
    </ProtocolSelectorProvider>
  );
}
