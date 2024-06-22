import React, { useMemo } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import {
  FarcasterFrameContext,
  FrameActionBodyPayload,
  FrameUI,
  fallbackFrameContext,
} from "@frames.js/render";
import type { FrameButton } from "frames.js";
import { useFrame } from "@frames.js/render/use-frame";
import Image from "next/image";
import type { ImgHTMLAttributes } from "react";
import { findIndex } from "lodash";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { createFarcasterSignerFromAuthenticatorManager } from ".";
import {
  CastId,
  FarcasterNetwork,
  FrameActionBody,
  FrameActionMessage,
  Message,
  Signer,
  makeFrameAction,
} from "@farcaster/core";
import { hexToBytes } from "@noble/ciphers/utils";

// Due to issue with FrameImageNext from @frame.js/render/next
// Implement the exact same thing again
function FrameImageNext(
  props: ImgHTMLAttributes<HTMLImageElement> & { src: string },
): React.ReactNode {
  return (
    <Image
      {...props}
      alt={props.alt ?? ""}
      sizes="100vw"
      height={0}
      width={0}
    />
  );
}

const FARCASTER_AUTHENTICATOR_NAME = "farcaster:nounspace";

export type FrameFidgetSettings = {
  url: string;
};

const frameProperties: FidgetProperties = {
  fidgetName: "Frame",
  fields: [
    {
      fieldName: "url",
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
};

async function createFrameActionMessage(
  signer: Signer,
  {
    fid,
    url,
    buttonIndex,
    castId,
    inputText,
    state,
    address,
    transactionId,
  }: {
    fid: number;
    url: Uint8Array;
    buttonIndex: number;
    inputText: Uint8Array | undefined;
    castId: CastId;
    state: Uint8Array | undefined;
    address: Uint8Array | undefined;
    transactionId: Uint8Array | undefined;
  },
): Promise<
  | {
      message: null;
      trustedBytes: null;
    }
  | {
      message: FrameActionMessage | null;
      trustedBytes: string;
    }
> {
  const messageDataOptions = {
    fid,
    network: FarcasterNetwork.MAINNET,
  };

  const message = await makeFrameAction(
    FrameActionBody.create({
      url,
      buttonIndex,
      castId,
      state,
      inputText: inputText !== undefined ? Buffer.from(inputText) : undefined,
      address,
      transactionId,
    }),
    messageDataOptions,
    signer,
  );

  if (message.isErr()) {
    return { message: null, trustedBytes: null };
  }

  const trustedBytes = Buffer.from(
    Message.encode(message._unsafeUnwrap()).finish(),
  ).toString("hex");

  return { message: message.unwrapOr(null), trustedBytes };
}

const Frame: React.FC<FidgetArgs<FrameFidgetSettings>> = async ({
  settings: { url },
}) => {
  const authenticatorManager = useAuthenticatorManager();
  const isLoadingSigner = await useMemo(
    async () =>
      findIndex(
        await authenticatorManager.getInitializedAuthenticators(),
        FARCASTER_AUTHENTICATOR_NAME,
      ) === -1,
    [authenticatorManager],
  );
  const signer = await useMemo(
    async () =>
      await createFarcasterSignerFromAuthenticatorManager(
        authenticatorManager,
        "frame",
      ),
    [authenticatorManager],
  );
  const fid = await useMemo(async () => {
    const methodResult = await authenticatorManager.callMethod(
      "frame",
      FARCASTER_AUTHENTICATOR_NAME,
      "getAccountFid",
    );
    if (methodResult.result === "success") {
      return methodResult.value as number;
    }
    return -1;
  }, [authenticatorManager]);

  const signFrameAction = async ({
    buttonIndex,
    frameContext,
    frameButton,
    target,
    inputText,
    state,
    transactionId,
    url,
  }: {
    target?: string;
    frameButton: FrameButton;
    buttonIndex: number;
    url: string;
    inputText?: string;
    state?: string;
    transactionId?: `0x${string}`;
    frameContext: FarcasterFrameContext;
  }): Promise<{
    body: FrameActionBodyPayload;
    searchParams: URLSearchParams;
  }> => {
    const { message, trustedBytes } = await createFrameActionMessage(signer, {
      fid,
      buttonIndex,
      castId: {
        fid: frameContext.castId.fid,
        hash: hexToBytes(frameContext.castId.hash),
      },
      state: state !== undefined ? Buffer.from(state) : undefined,
      url: Buffer.from(url),
      // it seems the message in hubs actually requires a value here.
      inputText: inputText !== undefined ? Buffer.from(inputText) : undefined,
      address:
        frameContext.address !== undefined
          ? hexToBytes(frameContext.address)
          : undefined,
      transactionId:
        transactionId !== undefined ? hexToBytes(transactionId) : undefined,
    });

    if (!message) {
      throw new Error("hub error");
    }

    const searchParams = new URLSearchParams({
      postType: transactionId ? "post" : frameButton.action,
      postUrl: target ?? "",
    });

    return {
      searchParams,
      body: {
        untrustedData: {
          fid,
          url,
          messageHash: `0x${Buffer.from(message.hash).toString("hex")}`,
          timestamp: message.data.timestamp,
          network: 1,
          buttonIndex: Number(message.data.frameActionBody.buttonIndex),
          castId: {
            fid: frameContext.castId.fid,
            hash: frameContext.castId.hash,
          },
          inputText,
          address: frameContext.address,
          transactionId,
          state,
        },
        trustedData: {
          messageBytes: trustedBytes,
        },
      },
    };
  };

  const frameState = useFrame({
    homeframeUrl: url,
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    frameContext: fallbackFrameContext,
    connectedAddress: undefined,
    dangerousSkipSigning: false,
    signerState: {
      hasSigner: !isLoadingSigner,
      isLoadingSigner,
      signFrameAction,
      onSignerlessFramePress: () =>
        console.error(
          "User is not signed into farcaster and so cannot use frames!",
        ),
    },
  });

  return <FrameUI frameState={frameState} FrameImage={FrameImageNext} />;
};

export default {
  fidget: Frame,
  properties: frameProperties,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;
