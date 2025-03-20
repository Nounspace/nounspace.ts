"use client";

import React from "react";
import { useParams } from "next/navigation";
import PrivateSpace from "../PrivateSpace";

const HomebaseTabPage = () => {
  const params = useParams<{ tabname: string }>();
  const tabName = decodeURIComponent(params?.tabname ?? "");

  return <PrivateSpace tabName={tabName} />;
};

export default HomebaseTabPage;
