import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import SpaceWithLoader from "@/common/components/templates/SpaceWithLoader";

const Homebase: NextPageWithLayout = () => {
  const { homebaseConfig, saveConfig, loadConfig, commitConfig, resetConfig } =
    useAppStore((state) => ({
      homebaseConfig: state.homebase.homebaseConfig,
      saveConfig: state.homebase.saveHomebaseConfig,
      loadConfig: state.homebase.loadHomebase,
      commitConfig: state.homebase.commitHomebaseToDatabase,
      resetConfig: state.homebase.resetHomebaseConfig,
    }));

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <SpaceWithLoader
      config={homebaseConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
    />
  );
};

Homebase.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div
      className="min-h-screen max-w-screen h-screen w-screen"
      style={{ background: "var(--user-theme-background)" }}
    >
      {page}
    </div>
  );
};

export default Homebase;
