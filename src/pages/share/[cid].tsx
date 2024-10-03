import React, { useEffect, useState } from "react";
import { NextPageWithLayout } from "../_app";
import { useRouter } from "next/router";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "@/common/data/api/backend";
import { useAppStore } from "@/common/data/stores/app";
import { isUndefined } from "lodash";
import { signSignable } from "@/common/lib/signedFiles";
import { SharedContentResponse } from "../api/space/shared";

const SharedImport: NextPageWithLayout = () => {
  const router = useRouter();
  const cid = router.query.cid as string;
  const [loadedData, setLoadedData] = useState<object | string>();
  const { getIdentity } = useAppStore((store) => ({
    getIdentity: store.account.getCurrentIdentity,
  }));
  const identity = getIdentity();

  // TO DO:
  // Change this to import the data that is loaded instead of just displaying it
  useEffect(() => {
    if (isUndefined(identity)) {
      setLoadedData("NOT LOGGED IN");
      return;
    }
    const fn = async () => {
      const paramsUnsigned = {
        cid,
        publicKey: identity.rootKeys.publicKey,
      };
      const params = signSignable(paramsUnsigned, identity.rootKeys.privateKey);
      try {
        const result = await axiosBackend.get<SharedContentResponse>(
          "/api/space/shared",
          { params },
        );
        setLoadedData(result.data.value ?? "Empty data");
      } catch (e) {
        setLoadedData("FAILED TO LOAD");
      }
    };
    fn();
  }, [cid, identity]);

  return <div>{stringify(loadedData)}</div>;
};

export default SharedImport;
