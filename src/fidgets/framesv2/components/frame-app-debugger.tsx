import React from "react";
import "@farcaster/auth-kit/styles.css";
// import { Button } from "@/components/ui/button";
import type { FrameLaunchedInContext } from "./frame-debugger";
// import { WithTooltip } from "./with-tooltip";
// import { RefreshCwIcon } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
import { type UseFrameAppInIframeReturn } from "@frames.js/render/frame-app/iframe";
import { useReducer, useRef, useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { cn } from "@/lib/utils";
// import { DebuggerConsole } from "./debugger-console";
import type { FarcasterSignerInstance } from "@frames.js/render/identity/farcaster";
// import { FrameAppDebuggerNotifications } from "./frame-app-debugger-notifications";
import {
  FrameAppNotificationsManagerProvider,
  useFrameAppNotificationsManager,
} from "../providers/FrameAppNotificationsManagerProvider";
// import { FrameAppDebuggerViewProfileDialog } from "./frame-app-debugger-view-profile-dialog";
import { FrameApp } from "./frame-app";

type TabValues = "events" | "console" | "notifications";

type FrameAppDebuggerProps = {
  context: FrameLaunchedInContext;
  farcasterSigner: FarcasterSignerInstance;
  onClose: () => void;
};

export function FrameAppDebugger({
  context,
  farcasterSigner,
  onClose,
}: FrameAppDebuggerProps) {
  const [appIdCounter, reloadApp] = useReducer((state) => state + 1, 0);
  const [frameApp, setFrameApp] = useState<UseFrameAppInIframeReturn | null>(
    null
  );
  const farcasterSignerRef = useRef(farcasterSigner);
  farcasterSignerRef.current = farcasterSigner;

  const userContext = useRef<{ fid: number }>({ fid: -1 });

  if (
    (farcasterSigner.signer?.status === "approved" ||
      farcasterSigner.signer?.status === "impersonating") &&
    userContext.current.fid !== farcasterSigner.signer.fid
  ) {
    userContext.current = {
      fid: farcasterSigner.signer.fid,
    };
  }

  const frameAppNotificationManager = useFrameAppNotificationsManager({
    farcasterSigner,
    context,
  });
  const debuggerConsoleTabRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabValues>("notifications");
  const [viewFidProfile, setViewFidProfile] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[300px_500px_1fr] p-4 gap-4 bg-slate-50 max-w-full w-full">
        <div className="flex flex-col gap-4 order-0 lg:order-1">
          <FrameApp
            key={appIdCounter}
            frameAppNotificationManager={frameAppNotificationManager}
            userContext={userContext.current}
            onClose={onClose}
            onViewProfile={async (params) => setViewFidProfile(params.fid)}
            onFrameAppUpdate={setFrameApp}
            context={context}
          />
        </div>
      </div>
    </>
  );
}
