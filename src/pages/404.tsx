import React, { Suspense } from "react";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";

export default function Custom404() {
  return (
    <Suspense fallback={<div>404</div>}>
      <SpaceNotFound src="/images/404.png" />
    </Suspense>
  );
}
