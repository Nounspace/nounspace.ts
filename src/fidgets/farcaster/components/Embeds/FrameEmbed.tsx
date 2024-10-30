import React, { useEffect } from "react";
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
import { useFarcasterSigner } from "@/fidgets/farcaster/index";
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
import { isUndefined, slice } from "lodash";
import { log, error } from "console";
import { getAddress } from "viem";

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
      inputText:
        inputText !== undefined
          ? new Uint8Array(Buffer.from(inputText))
          : undefined,
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

const FrameEmbed: React.FC<{ url: string; showError?: boolean }> = ({
  url,
  showError = true,
}) => {
  const { signer, isLoadingSigner, fid } = useFarcasterSigner("frame");
  // Inside the component or hook where you manage wallet connection
  console.log("fuck", signer, isLoadingSigner);

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
    console.log("Starting signFrameAction with the following parameters:", {
      buttonIndex,
      frameContext,
      frameButton,
      target,
      inputText,
      state,
      transactionId,
      url,
    });

    const { message, trustedBytes } = await createFrameActionMessage(signer!, {
      fid,
      buttonIndex,
      castId: {
        fid: frameContext.castId.fid,
        hash: hexToBytes(frameContext.castId.hash.slice(2)),
      },
      state:
        state !== undefined
          ? new Uint8Array(Buffer.from(state).buffer)
          : undefined,
      url: new Uint8Array(Buffer.from(url)),
      inputText:
        inputText !== undefined
          ? Uint8Array.from(Buffer.from(inputText))
          : undefined,
      address:
        frameContext.address !== undefined
          ? hexToBytes(frameContext.address.slice(2))
          : undefined,
      transactionId:
        transactionId !== undefined
          ? hexToBytes(transactionId.slice(2))
          : undefined,
    });

    console.log("Message generated:", message);
    console.log("Trusted bytes for transaction:", trustedBytes);

    if (!message) {
      console.error("Failed to create frame action message");
      throw new Error("hub error");
    }

    const searchParams = new URLSearchParams({
      postType: transactionId ? "post" : frameButton.action,
      postUrl: target ?? "",
    });

    console.log("Transaction search parameters:", searchParams.toString());

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

  if (
    !isUndefined(frameState.currentFrameStackItem) &&
    frameState.currentFrameStackItem.status === "done" &&
    frameState.currentFrameStackItem.frameResult.status === "failure" &&
    !showError
  ) {
    return null;
  }

  return (
    <FrameUI
      frameState={frameState}
      FrameImage={FrameImageNext}
      enableImageDebugging
    />
  );
};

export default FrameEmbed;
