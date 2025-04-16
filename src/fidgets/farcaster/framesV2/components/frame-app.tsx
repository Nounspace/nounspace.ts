import React from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import * as Dialog from "@radix-ui/react-dialog";

import { Loader2Icon } from "lucide-react";

import { Button } from "@/common/components/atoms/button";
import { Cross2Icon } from "@radix-ui/react-icons";

import { fallbackFrameContext } from "@frames.js/render";
import {
  useFrameAppInIframe,
  type UseFrameAppInIframeReturn,
} from "@frames.js/render/frame-app/iframe";
import type { UseFrameAppOptions } from "@frames.js/render/use-frame-app";

import type {
  FrameContext,
  FramePrimaryButton,
  ResolveContextFunction,
} from "@frames.js/render/frame-app/types";
import { useConfig } from "wagmi";
import type { Frame } from "frames.js/farcaster-v2/types";
import { PartialFrameV2 } from "@frames.js/render/unstable-types";
import type { ParseFramesV2ResultWithFrameworkDetails } from "frames.js/frame-parsers";
import { createAppClient, QRCode, viemConnector } from "@farcaster/auth-kit";
import { useWagmiProvider } from "@frames.js/render/frame-app/provider/wagmi";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import Image from "next/image";
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

export interface EIP6963ProviderInfo {
  icon: `data:image/${string}`; // RFC-2397
  name: string;
  rdns: string;
  uuid: string;
}

// in debugger we don't want to automatically reject repeated add frame calls
const addFrameRequestsCache = new (class extends Set {
  has(key: string) {
    return false;
  }

  add(key: string) {
    return this;
  }

  delete(key: string) {
    return true;
  }
})();

const appClient = createAppClient({
  ethereum: viemConnector(),
});

type FrameAppProps = {
  context: FrameLaunchedInContext;
  userContext: { fid: number };
  onClose: NonNullable<UseFrameAppOptions["onClose"]>;
  onFrameAppUpdate: (frameApp: UseFrameAppInIframeReturn) => void;
  onViewProfile: NonNullable<UseFrameAppOptions["onViewProfile"]>;
  frameAppNotificationManager: any;
};

export function FrameApp({
  context,
  onClose,
  onFrameAppUpdate,
  onViewProfile,
  userContext,
  frameAppNotificationManager,
}: FrameAppProps) {
  const config = useConfig();
  const [isAppReady, setIsAppReady] = useState(false);
  const [primaryButton, setPrimaryButton] = useState<{
    button: FramePrimaryButton;
    callback: () => void;
  } | null>(null);

  const [
    farcasterSignInAbortControllerAndURL,
    setFarcasterSignInAbortControllerURL,
  ] = useState<{ controller: AbortController; url: URL } | null>(null);
  const provider = useWagmiProvider({
    debug: true,
  });

  // const frameAppNotificationManagerPromiseRef = useRef(
  //   frameAppNotificationManager.promise
  // );

  const resolveContext: ResolveContextFunction = useCallback(
    async ({ signal }) => {
      const location: FrameContext["location"] =
        context.context === "button_press"
          ? { type: "launcher" }
          : {
              type: "cast_embed",
              embed: "",
              cast: fallbackFrameContext.castId,
            };

      setIsModalOpen(true); // Updates the global store

      try {
        const clientInfoResponse = await fetch("/client-info", {
          signal,
        });

        if (!clientInfoResponse.ok) {
          throw new Error("Failed to fetch client info");
        }

        const parseClientInfo = z.object({
          fid: z.number().int(),
        });

        const clientInfo = parseClientInfo.parse(
          await clientInfoResponse.json()
        );

        // const { manager } = await frameAppNotificationManagerPromiseRef.current;
        const clientFid = clientInfo.fid;

        return {
          client: {
            clientFid,
            added: false,
            // manager.state?.frame.status === "added",
            notificationDetails:
              // manager.state?.frame.status === "added"
              // ? manager.state.frame.notificationDetails ?? undefined
              // :
              undefined,
          },
          location,
          user: userContext,
        };
      } catch (e) {
        console.error(e);
        return {
          client: {
            clientFid: -1,
            added: false,
          },
          location,
          user: userContext,
        };
      }
    },
    [context, userContext]
  );

  const frameApp = useFrameAppInIframe({
    debug: true,
    source: context.parseResult,
    context: resolveContext,
    provider,
    proxyUrl: "/frames",
    addFrameRequestsCache,

    onReady(options) {
      console.info("sdk.actions.ready() called", { options });
      setIsAppReady(true);
    },

    onClose() {
      console.info("sdk.actions.close() called");
    },

    onOpenUrl(url) {
      console.info("sdk.actions.openUrl() called", { url });
      window.open(url, "_blank");
    },

    onPrimaryButtonSet(button, buttonCallback) {
      console.info("sdk.actions.setPrimaryButton() called", { button });
      setPrimaryButton({
        button,
        callback: () => {
          console.info("primary button clicked");
          buttonCallback();
        },
      });
    },

    async onAddFrameRequested(parseResult) {
      console.info("sdk.actions.addFrame() called");
      if (frameAppNotificationManager.status === "pending") {
        console.log("Notifications manager not ready");
        return false;
      }

      if (frameAppNotificationManager.status === "error") {
        console.error("Notifications manager error");
        return false;
      }

      const webhookUrl = parseResult.manifest?.manifest.frame?.webhookUrl;

      if (!webhookUrl) {
        console.error("Webhook URL not found");
        return false;
      }

      const consent = window.confirm(
        "Do you want to add the frame to the app?"
      );

      if (!consent) {
        return false;
      }

      try {
        const result =
          await frameAppNotificationManager.data.manager.addFrame();

        return {
          added: true,
          notificationDetails: result,
        };
      } catch (e) {
        console.error("Failed to add frame", e);
        throw e;
      }
    },

    onEIP6963RequestProviderRequested({ endpoint }) {
      if (!config._internal.mipd) {
        return;
      }

      config._internal.mipd.getProviders().map((providerInfo) => {
        endpoint.emit({
          event: "eip6963:announceProvider",
          info: providerInfo.info as EIP6963ProviderInfo,
        });
      });
    },

    async onSignIn({ nonce, notBefore, expirationTime, frame }) {
      console.info("sdk.actions.signIn() called", {
        nonce,
        notBefore,
        expirationTime,
      });
      let abortTimeout: NodeJS.Timeout | undefined;

      try {
        const frameUrl = frame.frame.button?.action?.url;

        if (!frameUrl) {
          throw new Error("Frame is malformed, action url is missing");
        }

        const createChannelResult = await appClient.createChannel({
          nonce,
          notBefore,
          expirationTime,
          siweUri: frameUrl,
          domain: new URL(frameUrl).hostname,
        });

        if (createChannelResult.isError) {
          throw (
            createChannelResult.error ||
            new Error("Failed to create sign in channel")
          );
        }

        const abortController = new AbortController();

        setFarcasterSignInAbortControllerURL({
          controller: abortController,
          url: new URL(createChannelResult.data.url),
        });

        const signInTimeoutReason = "Sign in timed out";

        abortTimeout = setTimeout(() => {
          abortController.abort(signInTimeoutReason);
        }, 30000);

        let status: Awaited<ReturnType<typeof appClient.status>> | undefined;

        const POLLING_INTERVAL = 1000;
        const MAX_RETRIES = 30;
        let retryCount = 0;

        while (retryCount < MAX_RETRIES) {
          if (abortController.signal.aborted) {
            if (abortTimeout) {
              clearTimeout(abortTimeout);
            }

            if (abortController.signal.reason === signInTimeoutReason) {
              throw new Error(abortController.signal.reason);
            }
          }

          status = await appClient.status({
            channelToken: createChannelResult.data.channelToken,
          });

          if (!status.isError && status.data.state === "completed") {
            break;
          }

          retryCount++;
          await new Promise((r) => setTimeout(r, POLLING_INTERVAL));
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error("Polling timeout exceeded");
        }

        clearTimeout(abortTimeout);

        if (!status) throw new Error("Signature or message is missing");
        const { message, signature } = status.data;

        if (!(signature && message)) {
          throw new Error("Signature or message is missing");
        }

        return {
          signature,
          message,
        };
      } finally {
        clearTimeout(abortTimeout);
        setFarcasterSignInAbortControllerURL(null);
      }
    },

    async onViewProfile(params) {
      console.info("sdk.actions.viewProfile() called", params);
      onViewProfile(params);
    },
  });

  const onFrameAppUpdateRef = useRef(onFrameAppUpdate);
  onFrameAppUpdateRef.current = onFrameAppUpdate;

  useEffect(() => {
    onFrameAppUpdateRef.current(frameApp);
  }, [frameApp]);

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseClick = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {!!farcasterSignInAbortControllerAndURL && (
        <Dialog.Root
          open
          onOpenChange={() => {
            farcasterSignInAbortControllerAndURL.controller.abort(
              "User closed sign in dialog"
            );
          }}
        >
          <Dialog.Content className="max-w-[300px]">
            <div className="flex flex-col gap-4 justify-center items-center">
              <h2 className="text-xl font-semibold">Sign in with Farcaster</h2>
              <QRCode
                uri={farcasterSignInAbortControllerAndURL.url.toString()}
              />
              <span className="text-muted-foreground text-sm">or</span>
              <Button variant="ghost">Copy failed</Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      )}

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Overlay className="bg-muted/95 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
        <Dialog.Content
          className={mergeClasses(
            "data-[state=open]:animate-contentShow fixed bg-background top-[40%]",
            "left-[50%] w-[100vw] max-w-[600px] translate-x-[-50%] translate-y-[-40%] rounded-[10px] p-[25px]",
            "shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none",
            "z-50"
          )}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Frame Preview</h2>
            <button
              onClick={handleCloseClick}
              className="text-white hover:text-gray-200"
            >
              <Cross2Icon />
            </button>
          </div>

          <div
            className="flex flex-col gap-1 w-[full] h-[695px] relative overflow-auto"
            id="frame-app-preview"
          >
            {frameApp.status === "pending" ||
              (!isAppReady && (
                <div
                  className="bg-white flex items-center justify-center absolute top-0 bottom-0 left-0 right-0"
                  style={{
                    backgroundColor:
                      context.frame.button.action.splashBackgroundColor,
                  }}
                >
                  {context.frame.button.action.splashImageUrl && (
                    <div className="w-[200px] h-[200px] relative">
                      <Image
                        alt={`${name} splash image`}
                        src={context.frame.button.action.splashImageUrl}
                        width={200}
                        height={200}
                      />
                      {/* <div className="absolute bottom-0 right-0">
                        <Loader2Icon
                          className="animate-spin text-primary"
                          size={40}
                        />
                      </div> */}
                    </div>
                  )}
                </div>
              ))}
            <div className="flex flex-col items-center justify-center w-full h-full">
              {frameApp.status === "success" && (
                <iframe
                  className="w-full h-full border-none rounded-lg"
                  sandbox="allow-forms allow-scripts allow-same-origin"
                  {...frameApp.iframeProps}
                />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
