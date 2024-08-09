import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import { FaPlus } from "react-icons/fa6";
import { map } from "lodash";
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

const TabBar = ({ inEditMode, openFidgetPicker, tabs, currentTab }) => {
  return (
    <div className={"flex flex-row justify-center h-16"}>
      <Tabs
        defaultValue={currentTab}
        className="flex flex-row grow h-16 items-center"
      >
        <TabsList className={tabListClasses}>
          {map(tabs, (tabName: string) => {
            return (
              <div className="mx-4">
                <TabsTrigger value={tabName} className={tabTriggerClasses}>
                  {tabName}
                </TabsTrigger>
              </div>
            );
          })}
        </TabsList>
      </Tabs>

      {inEditMode ? (
        <div className="flex flex-row-reverse">
          <button
            onClick={openFidgetPicker}
            className="flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
          >
            <div className="ml-2">
              <AddFidgetIcon />
            </div>
            <span className="ml-4 mr-2">Fidget</span>
          </button>

          <button
            onClick={openFidgetPicker}
            className="items-center flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
          >
            <div className="ml-2">
              <FaPlus />
            </div>
            <span className="ml-4 mr-2">Tab</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default TabBar;
