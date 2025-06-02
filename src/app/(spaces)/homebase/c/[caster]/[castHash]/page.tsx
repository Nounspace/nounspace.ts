"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrivateSpace from "../../../PrivateSpace";

const HomebaseCastPage = () => {
  const params = useParams<{ caster: string; castHash: string }>();
  const castHash = decodeURIComponent(params?.castHash ?? "");
  return <PrivateSpace tabName="Feed" castHash={castHash} />;
};

export default HomebaseCastPage;
