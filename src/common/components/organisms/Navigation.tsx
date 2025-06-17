import Player from "@/common/components/organisms/Player";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useAppStore, useLogout } from "@/common/data/stores/app";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import CreateCast from "@/fidgets/farcaster/components/CreateCast";
import { first } from "lodash";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { CgProfile } from "react-icons/cg";
import {
    FaChevronLeft,
    FaChevronRight,
    FaDiscord,
} from "react-icons/fa6";
import { Button } from "../atoms/button";
import BrandHeader from "../molecules/BrandHeader";
import Modal from "../molecules/Modal";
// RiQuillPenAiLine does not exist in `react-icons/ri`. The correct icon name
// is `RiQuillPenLine`. Update the import to prevent build errors.
import { Badge } from "@/common/components/atoms/badge";
import SearchModal from "@/common/components/organisms/SearchModal";
import useNotificationBadgeText from "@/common/lib/hooks/useNotificationBadgeText";
import { UserTheme } from "@/common/lib/theme";
import { useUserTheme } from "@/common/lib/theme/UserThemeProvider";
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";
import { AnalyticsEvent } from "@/common/constants/analyticsEvents";
import { NOUNISH_LOWFI_URL } from "@/constants/nounishLowfi";
import { usePathname } from "next/navigation";
import { RiQuillPenLine } from "react-icons/ri";
import ExploreIcon from "../atoms/icons/ExploreIcon";
import HomeIcon from "../atoms/icons/HomeIcon";
import LoginIcon from "../atoms/icons/LoginIcon";
import LogoutIcon from "../atoms/icons/LogoutIcon";
import NotificationsIcon from "../atoms/icons/NotificationsIcon";
import RocketIcon from "../atoms/icons/RocketIcon";
import SearchIcon from "../atoms/icons/SearchIcon";

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
  enterEditMode?: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
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

const Navigation: React.FC<NavProps> = ({
  isEditable,
  enterEditMode,
  mobile = false,
  onNavigate,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const { setModalOpen, getIsAccountReady, getIsInitializing } = useAppStore(
    (state) => ({
      setModalOpen: state.setup.setModalOpen,
      getIsAccountReady: state.getIsAccountReady,
      getIsInitializing: state.getIsInitializing,
    })
  );
  const userTheme: UserTheme = useUserTheme();

  const logout = useLogout();
  const notificationBadgeText = useNotificationBadgeText();
  const pathname = usePathname();

  const [shrunk, setShrunk] = useState(mobile ? false : true);

  const toggleSidebar = () => {
    if (mobile) return;
    setShrunk((prev) => !prev);
  };

  function handleLogout() {
    router.push("/home");
    logout();
  }

  const openModal = () => setModalOpen(true);

  const [showCastModal, setShowCastModal] = useState(false);
  function openCastModal() {
    setShowCastModal(true);
  }
  const { fid } = useFarcasterSigner("navigation");
  const isLoggedIn = getIsAccountReady();
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
    [user]
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
    const handleClick = useCallback(() => {
      onClick?.();
      onNavigate?.();
    }, [onClick, onNavigate]);
    return (
      <li>
        <Link
          href={disable ? "#" : href}
          className={mergeClasses(
            "flex relative items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full group",
            href === pathname ? "bg-gray-100" : "",
            shrunk ? "justify-center" : ""
          )}
          onClick={handleClick}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          target={openInNewTab ? "_blank" : undefined}
        >
          {badgeText && <NavIconBadge>{badgeText}</NavIconBadge>}
          <Icon />
          {!shrunk && <span className="ms-3 relative z-10">{label}</span>}
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
            "flex relative items-center p-2 text-gray-900 rounded-lg dark:text-white w-full group",
            "hover:bg-gray-100 dark:hover:bg-gray-700",
            shrunk ? "justify-center" : ""
          )}
          onClick={onClick}
        >
          {badgeText && <NavIconBadge>{badgeText}</NavIconBadge>}
          <Icon aria-hidden="true" />
          {!shrunk && <span className="ms-3 relative z-10">{label}</span>}
        </button>
      </li>
    );
  };

  const openSearchModal = useCallback(() => {
    if (!searchRef?.current) return;
    searchRef.current.focus();
  }, [searchRef]);

  return (
    <nav
      id="logo-sidebar"
      className={mergeClasses(
        "border-r-2 bg-white",
        mobile
          ? "w-[270px]"
          : "w-full transition-transform -translate-x-full sm:translate-x-0"
      )}
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
      <div
        className={mergeClasses(
          "pt-12 pb-12 h-full",
          mobile ? "block" : "md:block hidden"
        )}
      >
        <div
          className={mergeClasses(
            "flex flex-col h-full transition-all duration-300 relative",
            mobile
              ? "w-[270px]"
              : shrunk
                ? "w-[90px] ml-auto"
                : "w-[270px] ml-auto"
          )}
        >
          {!mobile && (
            <button
              onClick={toggleSidebar}
              className="absolute right-0 top-4 transform translate-x-1/2 bg-white rounded-full border border-gray-200 shadow-sm p-2 hover:bg-gray-50 z-10"
              aria-label={shrunk ? "Expand sidebar" : "Collapse sidebar"}
            >
              {shrunk ? (
                <FaChevronRight size={14} />
              ) : (
                <FaChevronLeft size={14} />
              )}
            </button>
          )}

          <div className="-mt-[25px] pb-[25px]">
            <BrandHeader />
          </div>
          <div
            className={mergeClasses(
              "flex flex-col text-lg font-medium pb-3 px-4 overflow-auto transition-all duration-300",
              shrunk ? "px-1" : "px-4"
            )}
          >
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
                  label="$SPACE"
                  Icon={RocketIcon}
                  href="https://nounspace.com/t/base/0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab/Profile"
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
            <div
              className={mergeClasses("mt-8 px-2", shrunk ? "px-0" : "px-2")}
            >
              <Player
                url={userTheme?.properties?.musicURL || NOUNISH_LOWFI_URL}
                shrunk={shrunk}
              />
            </div>
            {isLoggedIn && (
              <div
                className={mergeClasses(
                  "pt-3 flex items-center gap-2 justify-center",
                  shrunk ? "flex-col gap-1" : ""
                )}
              >
                <Button
                  onClick={openCastModal}
                  variant="primary"
                  width="auto"
                  className="flex items-center justify-center w-12 h-12"
                >
                  {shrunk ? <span className="sr-only">Cast</span> : "Cast"}
                  {shrunk && (
                    <span className="text-lg font-bold">
                      <RiQuillPenLine />
                    </span>
                  )}
                </Button>
              </div>
            )}
            {!isLoggedIn && (
              <Link
                href="https://discord.gg/eYQeXU2WuH"
                className={mergeClasses(
                  "flex items-center p-2 text-gray-900 rounded-lg dark:text-white group w-full gap-2 text-lg font-medium",
                  shrunk ? "justify-center gap-0" : ""
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaDiscord className="text-[#5865f2] w-6 h-6" />
                {!shrunk && "Join"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
