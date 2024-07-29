import React, { useRef, useState } from "react";
import useSearchCasts from "@/common/lib/hooks/useSearchCasts";
import { SearchResultCast } from "@/common/lib/utils/searchcaster";
import Sidebar from "@/common/components/organisms/Sidebar";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { CastRow } from "@/fidgets/farcaster/components/CastRow";
import { useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/atoms/tabs";

enum TabOption {
  ALL = "all",
  MENTIONS = "mentions",
  FOLLOWS = "follows",
}

const NotificationTabs = () => {
  return (
    <Tabs defaultValue={TabOption.ALL} className="w-[800px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value={TabOption.ALL}>All</TabsTrigger>
        <TabsTrigger value={TabOption.MENTIONS}>Mentions</TabsTrigger>
        <TabsTrigger value={TabOption.FOLLOWS}>Follows</TabsTrigger>
      </TabsList>
      <TabsContent value={TabOption.ALL}>All</TabsContent>
      <TabsContent value={TabOption.MENTIONS}>Mentions</TabsContent>
      <TabsContent value={TabOption.FOLLOWS}>Follows</TabsContent>
    </Tabs>
  );
};

export default function NotificationsPage() {
  const portalRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") ?? "";
  const { casts, loading } = useSearchCasts(query, 300, 25);

  return (
    <div className="flex h-full justify-center" style={{ background: "white" }}>
      <div className="flex mx-0 transition-all duration-100 ease-out z-10">
        <Sidebar
          editMode={false}
          enterEditMode={() => {}}
          isEditable={false}
          portalRef={portalRef}
          theme={DEFAULT_THEME}
        />
      </div>
      <div className="flex justify-center h-screen w-full overflow-scroll">
        <div className="pt-2">
          {loading && <p>Loading...</p>}
          <div className="mt-2 flex">
            <NotificationTabs />
          </div>
        </div>
      </div>
    </div>
  );
}

NotificationsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div className="min-h-screen max-w-screen h-screen w-screen max-h-screen bg-[#f9f9f9]">
      {page}
    </div>
  );
};
