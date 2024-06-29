import React, { useCallback, useMemo, useState } from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import BrandHeader from "../molecules/BrandHeader";
import Player from "@/common/components/organisms/Player";
import { useAppStore, useLogout } from "@/common/data/stores/app";
import Modal from "../molecules/Modal";
import CreateCast from "@/fidgets/farcaster/components/CreateCast";
import Link from "next/link";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { CgLogIn, CgLogOut, CgProfile } from "react-icons/cg";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import { IoMdRocket } from "react-icons/io";
import { Button } from "../atoms/button";

type NavItemProps = {
  label: string;
  active?: boolean;
  Icon: React.FC;
  href: string;
  disable?: boolean;
  openInNewTab?: boolean;
};

type NavProps = {
  isEditable: boolean;
  enterEditMode: () => void;
};

const NavItem: React.FC<NavItemProps> = ({
  label,
  active,
  Icon,
  href,
  disable = false,
  openInNewTab = false,
}) => {
  return (
    <li>
      <Link
        href={disable ? "#" : href}
        className={mergeClasses(
          "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full",
          active ? "bg-gray-100" : "",
        )}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        target={openInNewTab ? "_blank" : undefined}
      >
        <Icon aria-hidden="true" />
        <span className="ms-2">{label}</span>
      </Link>
    </li>
  );
};

const Navigation: React.FC<NavProps> = ({ isEditable, enterEditMode }) => {
  const { homebaseConfig, setModalOpen, getIsLoggedIn } = useAppStore(
    (state) => ({
      setModalOpen: state.setup.setModalOpen,
      homebaseConfig: state.homebase.homebaseConfig,
      getIsLoggedIn: state.getIsAccountReady,
    }),
  );
  const logout = useLogout();

  const userTheme = homebaseConfig?.theme;

  function turnOnEditMode() {
    enterEditMode();
  }

  const openModal = () => setModalOpen(true);

  const [showCastModal, setShowCastModal] = useState(false);
  function openCastModal() {
    setShowCastModal(true);
  }
  const { fid } = useFarcasterSigner("navigation");
  const isLoggedIn = getIsLoggedIn();
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);
  const CurrentUserImage = useCallback(
    () =>
      user && user.pfp_url ? (
        <img
          className="aspect-square rounded-full w-6 h-6"
          src={user.pfp_url}
        />
      ) : (
        <CgProfile />
      ),
    [user],
  );

  return (
    <aside
      id="logo-sidebar"
      className="w-full transition-transform -translate-x-full sm:translate-x-0 border-r-2 bg-white"
      aria-label="Sidebar"
    >
      <Modal
        open={showCastModal}
        setOpen={setShowCastModal}
        focusMode
        showClose={false}
      >
        <CreateCast />
      </Modal>
      <div className="pt-12 pb-12 h-full md:block hidden">
        <div className="flex flex-col h-full w-[270px] ml-auto">
          <BrandHeader />
          <div className="flex flex-col text-lg font-medium pb-3 px-4 overflow-auto">
            <div className="flex-auto">
              <ul className="space-y-2">
                <NavItem
                  label="Homebase"
                  Icon={HomeIcon}
                  active={true}
                  href="/homebase"
                />
                <NavItem
                  label="Fair Launch"
                  Icon={IoMdRocket}
                  href="https://space.nounspace.com/"
                  openInNewTab
                />
                {/* <NavItem label="Explore" Icon={ExploreIcon} href="/explore"/> */}
                {isLoggedIn && (
                  <NavItem
                    label={username || "Loading..."}
                    Icon={CurrentUserImage}
                    href={`/s/${username}`}
                  />
                )}
                <li>
                  {isLoggedIn ? (
                    <button
                      className={mergeClasses(
                        "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full",
                      )}
                      onClick={logout}
                    >
                      <CgLogOut className="w-6 h-6 text-gray-800 dark:text-white" />
                      <span className="ms-2">Logout</span>
                    </button>
                  ) : (
                    <button
                      className={mergeClasses(
                        "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full",
                      )}
                      onClick={openModal}
                    >
                      <CgLogIn className="w-6 h-6 text-gray-800 dark:text-white" />
                      <span className="ms-2">Login</span>
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col flex-auto justify-between border-t px-4">
            <div className="mt-8 px-2">
              <Player url={userTheme?.properties.musicURL} />
            </div>
            {isLoggedIn && (
              <div className="pt-3 flex items-center gap-2 justify-center">
                {isEditable && (
                  <Button
                    onClick={turnOnEditMode}
                    size="icon"
                    variant="secondary"
                  >
                    <EditIcon />
                  </Button>
                )}
                <Button onClick={openCastModal} variant="primary" width="auto">
                  Cast
                </Button>
              </div>
            )}
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
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Navigation;
