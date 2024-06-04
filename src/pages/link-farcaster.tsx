import { AuthenticatorInitializer, AuthenticatorRef } from "@/authenticators";
import { FarcasterSignerAuthenticatorMethods } from "@/authenticators/farcaster/neynar";
import NounspaceFarcasterAuthenticator, { NounspaceDeveloperManagedSignerData } from "@/authenticators/farcaster/neynar/NounspaceManagedSignerAuthenticator";
import { useIsMounted } from "@/common/lib/hooks/useIsMounted";
import React, { useEffect, useRef, useState } from "react";

export default function LinkFarcaster() {
  const authenticatorRef = useRef<
    AuthenticatorRef<
      NounspaceDeveloperManagedSignerData,
      FarcasterSignerAuthenticatorMethods<NounspaceDeveloperManagedSignerData>
    >
  >(null);
  const [data, saveData] = useState<NounspaceDeveloperManagedSignerData>({});
  const [done, setDone] = useState(false);
  const [AuthComponent, setAuthComponent] = useState<AuthenticatorInitializer<NounspaceDeveloperManagedSignerData>>();
  const isMounted = useIsMounted();
  
  async function saveDataAsync(data: NounspaceDeveloperManagedSignerData) {
    return saveData(data);
  }

  useEffect(() => {
    setAuthComponent(() => authenticatorRef.current?.initializer);
  });

  return (
      <div className="w-full max-w-full min-h-screen">
        <div
          className="relative w-full h-screen flex-col items-center grid lg:max-w-none lg:grid-cols-2 lg:px-0"
        >
          <div className="relative h-full flex-col bg-muted p-10 text-foreground flex">
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-900 via-gray-700 to-stone-500" />
            <div className="relative z-20 mt-16 lg:mt-24">
              <NounspaceFarcasterAuthenticator ref={authenticatorRef} data={data} saveData={saveDataAsync} />
              {
                isMounted() ? (
                  !done && AuthComponent ?
                  <AuthComponent data={data} saveData={saveDataAsync} done={() => setDone(true)}/> :
                  "SUCCESSFULLY CONNECTED FARCASTER"
                ) : "Loading..."
              }
            </div>
          </div>
        </div>
      </div>
  );
}
