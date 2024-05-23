import { useAccountStore } from "@/common/data/stores/accounts";
import { Button } from "@/common/ui/atoms/button";
import Spinner from "@/common/ui/atoms/spinner";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { isUndefined } from "lodash";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Login() {
  const router = useRouter();
  const { ready, authenticated, logout: privyLogout } = usePrivy();
  const {
    currentSpaceIdentityPublicKey,
    logout: accountStoreLogout,
  } = useAccountStore((state) => ({
    currentSpaceIdentityPublicKey: state.currentSpaceIdentityPublicKey,
    logout: state.logout,
  }));
  const { login } = useLogin({
    onComplete: (_user, isNewUser, wasAlreadyAuthenticated) => {
      // Add User to Local Store if not already present
      if (!wasAlreadyAuthenticated) {
        if (isNewUser) {
          // Trigger creating use store data
          // redirect to the new user tutorial
        } 
        router.push("/setup");
      }
    },
    onError: () => {
      setErrored(true);
    },
  });
  const [errored, setErrored] = useState(false);

  function logout() {
    privyLogout();
    // Logout from store as well
    accountStoreLogout();
  }

  const proceedToHomebase = (
    <>
      <Button
        onClick={() => router.push(isUndefined(currentSpaceIdentityPublicKey) ? "/setup" : "/homebase")}
        size="lg"
        className="p-6 text-black bg-white"
        type="button"
        variant="ghost"
      > Proceed </Button>
      <Button
        onClick={logout}
        size="lg"
        className="p-6 text-white bg-transparent hover:bg-white hover:text-black border border-white hover:border-transparent"
        type="button"
        variant="outline"
      > Logout </Button>
    </>
  );

  const loginButton = (
    <>
      <Button
        onClick={login}
        size="lg"
        className="p-6 text-black bg-white"
        type="button"
        variant="ghost"
      > Sign In or Create Account </Button>
      {
        errored ? 
        <div className="bg-red">
          An error occurred signing you in. Please try again or contact support if the problem persists
        </div>
        : <></>
      }
    </>
  );

  return (
      <div className="w-full max-w-full min-h-screen">
        <div
          className="relative w-full h-screen flex-col items-center grid lg:max-w-none lg:grid-cols-2 lg:px-0"
        >
            <div className="relative h-full flex-col bg-muted p-10 text-foreground flex">
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-900 via-gray-700 to-stone-500" />
              <div className="relative z-20 mt-16 lg:mt-24">
                <div className="text-center">
                  <h1 className="bg-gradient-to-tl from-white via-stone-200 to-stone-500 bg-clip-text text-center text-5xl font-bold leading-tight tracking-tight text-transparent drop-shadow-sm dark:from-white dark:via-gray-200 dark:to-stone-500 md:text-7xl md:leading-[6rem] lg:leading-[1.1]">
                    <p className="inline-block">
                      <span>A Creative Farcaster</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="42"
                        height="42"
                        viewBox="0 0 1024 1024"
                        fill="#8A63D2"
                        className="mx-4 bg-gray-100 rounded-lg inline-block items-center"
                      >
                        <rect width="1024" height="1024" fill="none" />
                        <path d="M308.786 227H715.928V308.429L817.714 308.429L797.357 389.857H777V715.571C788.247 715.571 797.357 724.681 797.357 735.928V756.286C808.604 756.286 817.714 765.396 817.714 776.643V797H614.143V776.643C614.143 765.396 623.253 756.286 634.5 756.286L634.5 735.928C634.5 724.681 643.61 715.571 654.857 715.571L654.857 550.97C654.795 472.322 591.019 408.586 512.357 408.586C433.672 408.586 369.883 472.359 369.857 551.038L369.857 715.571C381.104 715.571 390.214 724.681 390.214 735.928V756.286C401.462 756.286 410.571 765.396 410.571 776.643V797H207V776.643C207 765.396 216.11 756.286 227.357 756.286L227.357 735.928C227.357 724.681 236.467 715.571 247.714 715.571L247.714 389.857H227.357L207 308.429L308.786 308.429V227Z" />
                      </svg>
                      <span>Experience</span>
                    </p>
                  </h1>
                  <div className="mx-auto mt-20 flex max-w-2xl lg:mr-10 lg:ml-0 lg:mt-12 lg:max-w-none lg:flex-none xl:mr-32">
                    <div className="mx-auto max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                      <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                        <img
                          src="/images/app-screenshot.png"
                          alt="App screenshot"
                          width={2432}
                          height={1442}
                          className="w-full max-w-[18rem] md:max-w-[38rem] lg:max-w-[30rem] xl:max-w-[36rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div
            id="login-form"
            className="bg-gray-900 h-full w-full p-8 py-20 lg:py-36"
          >
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-5xl lg:text-3xl font-semibold tracking-tight text-gray-100">
                  { ready && authenticated ? "Welcome Back!" : "Welcome to Nounspace" }
                </h1>
              </div>
              {
                ready ? (authenticated ? proceedToHomebase : loginButton) :
                <div className="self-center"> 
                  <Spinner className="size-12"/> 
                </div>
              }
            </div>
          </div>
        </div>
      </div>
  );
}
