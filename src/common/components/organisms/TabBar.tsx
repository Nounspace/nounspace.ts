import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import { FaPlus } from "react-icons/fa6";
import { first, map } from "lodash";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/atoms/tabs";
import {
  tabListClasses,
  tabTriggerClasses,
  tabContentClasses,
} from "@/common/lib/theme/helpers";
import Link from "next/link";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";

const TabBar = ({ hasProfile, inEditMode, openFidgetPicker }) => {
  const { fid } = useFarcasterSigner("navigation");
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  const { loadTabNames, createTab, deleteTab, renameTab } = useAppStore(
    (state) => ({
      loadTabNames: state.homebase.loadTabNames,
      createTab: state.homebase.createTab,
      deleteTab: state.homebase.deleteTab,
      renameTab: state.homebase.renameTab,
    }),
  );

  const currentTab = "profile";
  const [tabNames, setTabNames] = useState([""]);

  useEffect(() => {
    async function getTabs() {
      try {
        const freshTabNames = await loadTabNames();
        setTabNames(freshTabNames);
      } catch (e) {
        console.log("Hit an error: ", e);
      }
    }
    getTabs();
  }, []);

  return (
    <div className={"flex flex-row justify-center h-16"}>
      <Tabs
        defaultValue={currentTab}
        className="flex flex-row grow h-16 items-center"
      >
        <TabsList className={tabListClasses}>
          {map(tabNames, (tabName: string) => {
            return (
              <div className="mx-4">
                <Link
                  href={
                    hasProfile
                      ? `/s/${username}/${tabName}`
                      : `/homebase/${tabName}`
                  }
                >
                  <TabsTrigger value={tabName} className={tabTriggerClasses}>
                    {tabName}
                  </TabsTrigger>
                </Link>
              </div>
            );
          })}
        </TabsList>
      </Tabs>

      {inEditMode ? (
        <div className="flex flex-row">
          <button
            onClick={() => {
              createTab("NEWTAB");
            }}
            className="items-center flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
          >
            <div className="ml-2">
              <FaPlus />
            </div>
            <span className="ml-4 mr-2">Tab</span>
          </button>

          <button
            onClick={openFidgetPicker}
            className="flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
          >
            <div className="ml-2">
              <AddFidgetIcon />
            </div>
            <span className="ml-4 mr-2">Fidget</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default TabBar;
