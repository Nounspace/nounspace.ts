import React, { useState } from "react";
import { FrameUI, fallbackFrameContext } from "@frames.js/render";
import { signFrameAction } from "@frames.js/render/farcaster";
import { useFrame } from "@frames.js/render/use-frame";
import Image from "next/image";
import type { ImgHTMLAttributes } from "react";
import { isUndefined } from "lodash";
import Modal from "./Modal";
import SignupForNonLocalAccountCard from "../organisms/SignupForNonLocalAccountCard";

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

type FrameArgs = {
  url: string;
};

const Frame = ({ url }: FrameArgs) => {
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const signer = undefined;

  const frameState = useFrame({
    homeframeUrl: url,
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    frameContext: fallbackFrameContext,
    connectedAddress: undefined,
    dangerousSkipSigning: false,
    signerState: {
      hasSigner: !isUndefined(signer),
      signer,
      onSignerlessFramePress: () => {
        setShowSignUpModal(true);
      },
      signFrameAction: signFrameAction,
    },
  });

  return (
    <>
      <Modal open={showSignUpModal} setOpen={setShowSignUpModal}>
        <SignupForNonLocalAccountCard />
      </Modal>
      <FrameUI frameState={frameState} FrameImage={FrameImageNext} />
    </>
  );
};

export default Frame;
