"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import BrandHeader from "../molecules/BrandHeader";
import { Button } from "../atoms/button";
import { Dialog, DialogContent } from "../atoms/dialog";
import Modal from "../molecules/Modal";
import CreateCast from "@/fidgets/farcaster/components/CreateCast";
import Navigation from "./Navigation";
import { useAppStore } from "@/common/data/stores/app";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import { CgProfile } from "react-icons/cg";
import LoginIcon from "../atoms/icons/LoginIcon";
import { useSidebarContext } from "./Sidebar";

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
    let startX: number | null = null;
    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
    }
    function handleTouchEnd(e: TouchEvent) {
      if (startX !== null && e.changedTouches[0].clientX - startX > 50) {
        setNavOpen(true);
      }
      startX = null;
    }
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const isLoggedIn = getIsAccountReady();

  return (
    <header className="relative flex items-center justify-between h-14 px-4 border-b bg-white">
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
          <Button variant="primary" size="sm" onClick={openLogin} withIcon>
            <LoginIcon />
            Sign In
          </Button>
        )}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <BrandHeader />
      </div>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => setCastOpen(true)}
        aria-label="Cast"
      >
        <span className="text-lg font-bold">+</span>
      </Button>
      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent
          className="p-0 max-w-none w-[270px] h-full rounded-none left-0 top-0 translate-x-0 translate-y-0"
          showCloseButton={false}
        >
          <Navigation
            isEditable={sidebarEditable}
            enterEditMode={enterEditMode}
            mobile
          />
        </DialogContent>
      </Dialog>
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
