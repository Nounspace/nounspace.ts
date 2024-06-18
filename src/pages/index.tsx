import LoggedInStateManager from "@/common/components/templates/LoggedInStateManager";
import React from "react";

const Index = () => {
  return (
    <LoggedInStateManager>
      <p className="m-4 text-gray-200 text-md">Redirecting...</p>
    </LoggedInStateManager>
  );
};

export default Index;
