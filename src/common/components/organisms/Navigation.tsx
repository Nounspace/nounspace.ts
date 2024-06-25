import React from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import BrandHeader from "../molecules/BrandHeader";
import Player from "@/common/components/organisms/Player";
import { useAppStore } from "@/common/data/stores";

type NavItemProps = {
  label: string;
  active?: boolean;
  Icon: React.FC;
};

type NavProps = {
  isEditable: boolean;
  enterEditMode: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ label, active, Icon }) => {
  return (
    <li>
      <a
        href="#"
        className={mergeClasses(
          "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group",
          active ? "bg-gray-100" : "",
        )}
      >
        <Icon aria-hidden="true" />
        <span className="ms-2">{label}</span>
      </a>
    </li>
  );
};

const Navigation: React.FC<NavProps> = ({ isEditable, enterEditMode }) => {
  const { homebaseConfig } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
  }));

  const userTheme = homebaseConfig?.theme;

  function turnOnEditMode() {
    enterEditMode();
  }

  return (
    <aside
      id="logo-sidebar"
      className="mx-24 my-40 left-4 top-4 bottom-4 z-8 w-9/12 transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex-row h-full">
        <div className="h-full px-4 py-4 overflow-y-auto border border-blue-100 rounded-xl relative bg-card">
          <BrandHeader />
          <div className="text-lg font-medium">
            <ul className="space-y-2">
              <NavItem label="Homebase" Icon={HomeIcon} active={true} />
              <NavItem label="Explore" Icon={ExploreIcon} />
              <NavItem label="Channels" Icon={ChannelsIcon} />
              <NavItem label="Bookmark" Icon={BookmarkIcon} />
            </ul>
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
              <Player url={userTheme?.properties.musicURL} />
              <div className="mt-5 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-0 items-center justify-between">
                {isEditable && (
                  <button
                    onClick={turnOnEditMode}
                    className={mergeClasses(
                      "flex items-center justify-between p-2 text-gray-900",
                      "rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group",
                    )}
                  >
                    <div className="flex items-center">
                      <EditIcon />
                    </div>
                  </button>
                )}
                <button
                  className={mergeClasses(
                    "flex items-center justify-between p-2 text-gray-900 rounded-lg dark:text-white",
                    "hover:bg-gray-100 dark:hover:bg-gray-700 group",
                  )}
                >
                  <div className="flex items-center">
                    <span className="mr-16 ml-16">Cast</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const HomeIcon = () => {
  return (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
      />
    </svg>
  );
};

const ExploreIcon = () => {
  return (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      />
    </svg>
  );
};

const ChannelsIcon = () => {
  return (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7h1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h11.5M7 14h6m-6 3h6m0-10h.5m-.5 3h.5M7 7h3v3H7V7Z"
      />
    </svg>
  );
};

const BookmarkIcon = () => {
  return (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
      />
    </svg>
  );
};

const EditIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.779 17.779L4.361 19.918L6.5 13.5M10.779 17.779L19.143 9.13599C19.7101 8.56839 20.0287 7.79885 20.0287 6.99649C20.0287 6.19413 19.7101 5.42459 19.143 4.85699C18.5754 4.28987 17.8059 3.97131 17.0035 3.97131C16.2011 3.97131 15.4316 4.28987 14.864 4.85699L6.5 13.5M10.779 17.779L6.5 13.5M8.639 15.64L14.8518 9.13599M12.7511 7.04036L17 11.279"
        stroke="#383838"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Navigation;
