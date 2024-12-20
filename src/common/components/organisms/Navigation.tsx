import React, { useCallback, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import BrandHeader from "../molecules/BrandHeader";
import Player from "@/common/components/organisms/Player";
import { useAppStore, useLogout } from "@/common/data/stores/app";
import Modal from "../molecules/Modal";
import CreateCast from "@/fidgets/farcaster/components/CreateCast";
import Link from "next/link";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { CgProfile } from "react-icons/cg";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import { Button } from "../atoms/button";
import { FaPaintbrush, FaDiscord } from "react-icons/fa6";
import { NOUNISH_LOWFI_URL } from "@/constants/nounishLowfi";
import { UserTheme } from "@/common/lib/theme";
import { useUserTheme } from "@/common/lib/theme/UserThemeProvider";
import { AnalyticsEvent } from "@/common/providers/AnalyticsProvider";
import SearchModal from "@/common/components/organisms/SearchModal";
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";
import useNotificationBadgeText from "@/common/lib/hooks/useNotificationBadgeText";
import { Badge } from "@/common/components/atoms/badge";
import { usePathname } from "next/navigation";

type NavItemProps = {
  label: string;
  active?: boolean;
  Icon: React.FC;
  href: string;
  disable?: boolean;
  openInNewTab?: boolean;
  badgeText?: string | null;
  onClick?: () => void;
};

type NavButtonProps = Omit<NavItemProps, "href" | "openInNewTab">;

type NavProps = {
  isEditable: boolean;
  enterEditMode: () => void;
};

const NavIconBadge = ({ children }) => {
  return (
    <Badge
      variant="primary"
      className="justify-center text-[11px]/[12px] min-w-[18px] min-h-[18px] font-medium shadow-md px-[3px] rounded-full absolute left-[19px] top-[4px]"
    >
      {children}
    </Badge>
  );
};

const Navigation: React.FC<NavProps> = ({ isEditable, enterEditMode }) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const { setModalOpen, getIsLoggedIn, getIsInitializing } = useAppStore(
    (state) => ({
      setModalOpen: state.setup.setModalOpen,
      getIsLoggedIn: state.getIsAccountReady,
      getIsInitializing: state.getIsInitializing,
    }),
  );
  const userTheme: UserTheme = useUserTheme();
  console.log("Navigation.tsx: userTheme", userTheme);

  const logout = useLogout();
  const notificationBadgeText = useNotificationBadgeText();
  const pathname = usePathname();
  const isNotificationsPage = pathname === "/notifications";
  const isExplorerPage = pathname === "/explore";

  function handleLogout() {
    router.push("/home");
    logout();
  }

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
  const isInitializing = getIsInitializing();
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

  const router = useRouter();

  const NavItem: React.FC<NavItemProps> = ({
    label,
    Icon,
    href,
    onClick,
    disable = false,
    openInNewTab = false,
    badgeText = null,
  }) => {
    return (
      <li>
        <Link
          href={disable ? "#" : href}
          className={mergeClasses(
            "flex relative items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full",
            href === router.asPath ? "bg-gray-100" : "",
          )}
          onClick={onClick}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          target={openInNewTab ? "_blank" : undefined}
        >
          {badgeText && <NavIconBadge>{badgeText}</NavIconBadge>}
          <Icon />
          <span className="ms-3">{label}</span>
        </Link>
      </li>
    );
  };

  const NavButton: React.FC<NavButtonProps> = ({
    label,
    Icon,
    onClick,
    disable = false,
    badgeText = null,
  }) => {
    return (
      <li>
        <button
          disabled={disable}
          className={mergeClasses(
            "flex relative items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full",
          )}
          onClick={onClick}
        >
          {badgeText && <NavIconBadge>{badgeText}</NavIconBadge>}
          <Icon aria-hidden="true" />
          <span className="ms-3">{label}</span>
        </button>
      </li>
    );
  };

  const openSearchModal = useCallback(() => {
    if (!searchRef?.current) return;
    searchRef.current.focus();
  }, [searchRef]);

  return (
    <aside
      id="logo-sidebar"
      className="w-full transition-transform -translate-x-full sm:translate-x-0 border-r-2 bg-white"
      aria-label="Sidebar"
    >
      <Modal
        open={showCastModal}
        setOpen={setShowCastModal}
        focusMode={false}
        showClose={false}
      >
        <CreateCast afterSubmit={() => setShowCastModal(false)} />
      </Modal>
      <SearchModal ref={searchRef} />
      <div className="pt-12 pb-12 h-full md:block hidden">
        <div className="flex flex-col h-full w-[270px] ml-auto">
          <BrandHeader />
          <div className="flex flex-col text-lg font-medium pb-3 px-4 overflow-auto">
            <div className="flex-auto">
              <ul className="space-y-2">
                <NavItem
                  label={isLoggedIn ? "Homebase" : "Home"}
                  Icon={HomeIcon}
                  href={isLoggedIn ? "/homebase" : "/home"}
                  onClick={() =>
                    trackAnalyticsEvent(AnalyticsEvent.CLICK_HOMEBASE)
                  }
                />
                {isLoggedIn && (
                  <NavItem
                    label="Notifications"
                    Icon={NotificationsIcon}
                    href="/notifications"
                    onClick={() =>
                      trackAnalyticsEvent(AnalyticsEvent.CLICK_NOTIFICATIONS)
                    }
                    badgeText={notificationBadgeText}
                  />
                )}
                <NavButton
                  label="Search"
                  Icon={SearchIcon}
                  onClick={() => {
                    openSearchModal();
                    trackAnalyticsEvent(AnalyticsEvent.CLICK_SEARCH);
                  }}
                />
                <NavItem
                  label="Explore"
                  Icon={ExploreIcon}
                  href="/explore"
                  onClick={() =>
                    trackAnalyticsEvent(AnalyticsEvent.CLICK_EXPLORE)
                  }
                />
                <NavItem
                  label="Fair Launch"
                  Icon={RocketIcon}
                  href="https://space.nounspace.com/"
                  onClick={() =>
                    trackAnalyticsEvent(AnalyticsEvent.CLICK_SPACE_FAIR_LAUNCH)
                  }
                  openInNewTab
                />
                {isLoggedIn && (
                  <NavItem
                    label={"My Space"}
                    Icon={CurrentUserImage}
                    href={`/s/${username}`}
                    onClick={() =>
                      trackAnalyticsEvent(AnalyticsEvent.CLICK_MY_SPACE)
                    }
                  />
                )}
                {isLoggedIn && (
                  <NavButton
                    label={"Logout"}
                    Icon={LogoutIcon}
                    onClick={handleLogout}
                  />
                )}
                {!isLoggedIn && (
                  <NavButton
                    label={isInitializing ? "Complete Signup" : "Login"}
                    Icon={LoginIcon}
                    onClick={openModal}
                  />
                )}
              </ul>
            </div>
          </div>
          <div className="flex flex-col flex-auto justify-between border-t px-4">
            <div className="mt-8 px-2">
              <Player
                url={userTheme?.properties?.musicURL || NOUNISH_LOWFI_URL}
              />
            </div>
            {isLoggedIn && (
              <div className="pt-3 flex items-center gap-2 justify-center">
                {!isNotificationsPage && !isExplorerPage && isEditable && (
                  <Button
                    onClick={turnOnEditMode}
                    size="icon"
                    variant="secondary"
                  >
                    <div className="flex items-center p-1">
                      <FaPaintbrush />
                    </div>
                  </Button>
                )}
                <Button onClick={openCastModal} variant="primary" width="auto">
                  Cast
                </Button>
              </div>
            )}
            {!isLoggedIn && (
              <Link
                href="https://discord.gg/eYQeXU2WuH"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full gap-2 text-lg font-medium"
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaDiscord className="text-[#5865f2] w-6 h-6" />
                Join
              </Link>
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

const SearchIcon = () => (
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

const NotificationsIcon = () => (
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
      d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"
    />
  </svg>
);

const RocketIcon = () => (
  <svg
    className="w-[24px] h-[24px] text-gray-800 dark:text-white"
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
      d="m10.051 8.102-3.778.322-1.994 1.994a.94.94 0 0 0 .533 1.6l2.698.316m8.39 1.617-.322 3.78-1.994 1.994a.94.94 0 0 1-1.595-.533l-.4-2.652m8.166-11.174a1.366 1.366 0 0 0-1.12-1.12c-1.616-.279-4.906-.623-6.38.853-1.671 1.672-5.211 8.015-6.31 10.023a.932.932 0 0 0 .162 1.111l.828.835.833.832a.932.932 0 0 0 1.111.163c2.008-1.102 8.35-4.642 10.021-6.312 1.475-1.478 1.133-4.77.855-6.385Zm-2.961 3.722a1.88 1.88 0 1 1-3.76 0 1.88 1.88 0 0 1 3.76 0Z"
    />
  </svg>
);

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
        d="M4.37 7.657c2.063.528 2.396 2.806 3.202 3.87 1.07 1.413 2.075 1.228 3.192 2.644 1.805 2.289 1.312 5.705 1.312 6.705M20 15h-1a4 4 0 0 0-4 4v1M8.587 3.992c0 .822.112 1.886 1.515 2.58 1.402.693 2.918.351 2.918 2.334 0 .276 0 2.008 1.972 2.008 2.026.031 2.026-1.678 2.026-2.008 0-.65.527-.9 1.177-.9H20M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
};

const LogoutIcon = () => {
  return (
    <svg
      className="w-[24px] h-[24px] text-gray-800 dark:text-white scale-x-[-1] translate-x-[2px]"
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
        d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
      />
    </svg>
  );
};

const LoginIcon = () => {
  return (
    <svg
      className="w-[24px] h-[24px] text-gray-800 dark:text-white"
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
        d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
      />
    </svg>
  );
};

const _EditIcon = () => {
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
