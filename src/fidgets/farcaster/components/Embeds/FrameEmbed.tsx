import React, { useEffect, useState } from "react";
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
import { usePrivy } from "@privy-io/react-auth"; // Import usePrivy
import { isUndefined } from "lodash";

// Custom FrameImage component due to an issue with FrameImageNext from @frame.js/render/next
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
  const { user, authenticated, ready } = usePrivy(); // Use Privy to access the user

  const [connectedAddress, setConnectedAddress] = useState<
    `0x${string}` | undefined
  >(undefined);

  useEffect(() => {
    if (ready && authenticated && user) {
      // Retrieve the wallet address from the Privy user object, assuming it's stored in user.wallets[0]
      const rawAddress = user.wallet?.[0]?.address;
      if (rawAddress) {
        const formattedAddress = rawAddress.startsWith("0x")
          ? (rawAddress as `0x${string}`)
          : (`0x${rawAddress}` as `0x${string}`);
        console.log("Connected wallet address from Privy:", formattedAddress);
        setConnectedAddress(formattedAddress);
      } else {
        console.error("No wallet address found in Privy user.");
      }
    } else {
      console.log("User not authenticated or Privy not ready.");
    }
  }, [ready, authenticated, user]);

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

    if (!signer) {
      console.error("No signer available. Cannot proceed with transaction.");
      throw new Error("No signer available.");
    }

    const { message, trustedBytes } = await createFrameActionMessage(signer, {
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
      address: connectedAddress
        ? hexToBytes(connectedAddress.slice(2))
        : undefined,
      transactionId: transactionId
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
          address: connectedAddress,
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
    connectedAddress, // Use address from Privy user
    dangerousSkipSigning: false,
    signerState: {
      hasSigner: !!signer,
      isLoadingSigner,
      signFrameAction,
      onSignerlessFramePress: () =>
        console.error(
          "User is not signed into Farcaster and so cannot use frames!",
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
