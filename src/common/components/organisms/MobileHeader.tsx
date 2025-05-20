"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import BrandHeader from "../molecules/BrandHeader";
import { Button } from "../atoms/button";
import { Drawer, DrawerContent } from "../atoms/drawer";
import Modal from "../molecules/Modal";
import CreateCast from "@/fidgets/farcaster/components/CreateCast";
import Navigation from "./Navigation";
import { useAppStore } from "@/common/data/stores/app";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import { CgProfile } from "react-icons/cg";
import { useSidebarContext } from "./Sidebar";
import { LogIn, Menu } from "lucide-react";
import { RiQuillPenLine } from "react-icons/ri";

const MobileHeader: React.FC = () => {
  const { setModalOpen, getIsAccountReady } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
    getIsAccountReady: state.getIsAccountReady,
  }));

  const { setEditMode, sidebarEditable } = useSidebarContext();

  const [navOpen, setNavOpen] = useState(false);
  const [castOpen, setCastOpen] = useState(false);

  const { fid } = useFarcasterSigner("mobile-header");
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);

  const openLogin = useCallback(() => setModalOpen(true), [setModalOpen]);
  const openNav = useCallback(() => setNavOpen(true), []);
  const enterEditMode = useCallback(() => setEditMode(true), [setEditMode]);

  useEffect(() => {
    const EDGE_THRESHOLD = 20;
    let startX: number | null = null;

    function handleTouchStart(e: TouchEvent) {
      const x = e.touches[0].clientX;
      if (x <= EDGE_THRESHOLD) {
        startX = x;
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (startX !== null) {
        const deltaX = e.changedTouches[0].clientX - startX;
        if (deltaX > 50) {
          setNavOpen(true);
        }
      }
      startX = null;
    }

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [setNavOpen]);

  const isLoggedIn = getIsAccountReady();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-white overflow-hidden relative">
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <button
            onClick={openNav}
            className="rounded-full overflow-hidden w-8 h-8 bg-gray-200 flex items-center justify-center"
          >
            {user?.pfp_url ? (
              <img
                src={user.pfp_url}
                alt={user?.username}
                className="object-cover w-full h-full"
              />
            ) : (
              <CgProfile />
            )}
          </button>
        ) : (
          <Button variant="ghost" size="icon" onClick={openNav} aria-label="Menu">
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <BrandHeader />
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <Button
            variant="primary"
            size="icon"
            onClick={() => setCastOpen(true)}
            aria-label="Cast"
          >
            <RiQuillPenLine className="w-5 h-5 text-white" />
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={openLogin} withIcon>
            <LogIn size={16} />
            Sign In
          </Button>
        )}
      </div>
      <Drawer
        open={navOpen}
        onOpenChange={(open) => {
          setNavOpen(open);
          if (!open) {
            window.scrollTo({ top: 0 });
          }
        }}
      >
        <DrawerContent className="p-0" showCloseButton={false}>
          <Navigation
            isEditable={sidebarEditable}
            enterEditMode={enterEditMode}
            mobile
            onNavigate={() => {
              setNavOpen(false);
              window.scrollTo({ top: 0 });
            }}
          />
        </DrawerContent>
      </Drawer>
      <Modal
        open={castOpen}
        setOpen={setCastOpen}
        focusMode={false}
        showClose={false}
      >
        <CreateCast afterSubmit={() => setCastOpen(false)} />
      </Modal>
    </header>
  );
};

export default MobileHeader;
