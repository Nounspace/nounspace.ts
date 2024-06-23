import React, { useEffect } from "react";
import LoggedInStateManager from "@/common/components/templates/LoggedInStateManager";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores";
import SpaceWithLoader from "@/common/components/templates/SpaceWithLoader";

const Homebase: NextPageWithLayout = () => {
  const { homebaseConfig, saveConfig, loadConfig } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
    saveConfig: state.homebase.saveHomebaseConfig,
    loadConfig: state.homebase.loadHomebase,
  }));

  useEffect(() => {
    loadConfig();
  }, []);

  return <SpaceWithLoader config={homebaseConfig} saveConfig={saveConfig} />;
};

Homebase.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <LoggedInStateManager>
      <div
        className="min-h-screen max-w-screen h-screen w-screen p-8"
        style={{ background: "var(--user-theme-background)" }}
      >
        {page}
      </div>
    </LoggedInStateManager>
  );
};

export default Homebase;
