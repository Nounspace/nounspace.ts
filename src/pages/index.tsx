import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppStore } from "@/common/data/stores";
import { isUndefined } from "lodash";

const Index = () => {
  const router = useRouter();
  const { currentSpaceIdentityPublicKey } = useAppStore((state) => ({
    currentSpaceIdentityPublicKey: state.account.currentSpaceIdentityPublicKey,
  }));

  useEffect(() => {
    isUndefined(currentSpaceIdentityPublicKey)
      ? router.replace("/login")
      : router.replace("/homebase");
  });

  return <p className="m-4 text-gray-200 text-md">Redirecting...</p>;
};

export default Index;
