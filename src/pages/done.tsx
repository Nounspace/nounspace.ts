import { useAccountStore } from "@/common/data/stores/accounts";
import { SpaceIdentity } from "@/common/data/stores/accounts/indentityStore";
import { bytesToHex } from "@noble/ciphers/utils";
import stringify from "fast-json-stable-stringify";
import React, { useEffect, useState } from "react";

export default function Done() {
  const {
    getCurrentIdentity,
    currentIdentityPublicKey,
  } = useAccountStore((state) => ({
    getCurrentIdentity: state.getCurrentIdentity,
    currentIdentityPublicKey: state.currentSpaceIdentityPublicKey,
  }));

  const [identity, setIdentity] = useState<SpaceIdentity | undefined>();

  useEffect(() => {
    setIdentity(getCurrentIdentity());
  }, [currentIdentityPublicKey]);

  return (
    <div className="w-full max-w-full min-h-screen">
      <div
        className="relative w-full h-screen flex-col items-center grid lg:max-w-none lg:grid-cols lg:px-0"
      >
        <div className="relative h-full flex-col bg-muted p-10 text-foreground flex">
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-900 via-gray-700 to-stone-500" />
          <div className="relative z-20 mt-16 lg:mt-24">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-4xl lg:text-2xl font-semibold tracking-tight text-gray-100">
                  Account Setup! Here are some details:
                </h1>
              </div>
              <div className="self-center text-gray-100"> 
                Current Identity PK: { currentIdentityPublicKey }
              </div>
              <div className="self-center text-gray-100"> 
                Current Identity Info: { stringify(identity) || "" }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>    
  );
}