import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAccountStore } from "@/common/data/stores/accounts";
import { isUndefined } from "lodash";

const Index = () => {
  const router = useRouter();
  const { currentSpaceIdentityPublicKey } = useAccountStore((state) => ({
    currentSpaceIdentityPublicKey: state.currentSpaceIdentityPublicKey,
  }));

  // TO DO: Update redirect to "setup" if the account is logged in
  // sign up is not completed (i.e. hasn't finished adding Farcaster Auth)
  useEffect(() => {
    isUndefined(currentSpaceIdentityPublicKey)
      ? router.replace("/login")
      : router.replace("/homebase");
  });

  return <p className="m-4 text-gray-200 text-md">Redirecting...</p>;
};

export default Index;
