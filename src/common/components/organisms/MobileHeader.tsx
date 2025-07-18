"use client";

import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useAppStore } from "@/common/data/stores/app";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import CreateCast from "@/fidgets/farcaster/components/CreateCast";
import { first } from "lodash";
import { LogIn, Menu } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { RiQuillPenLine } from "react-icons/ri";
import { Button } from "../atoms/button";
import { Drawer, DrawerContent } from "../atoms/drawer";
import BrandHeader from "../molecules/BrandHeader";
import Modal from "../molecules/Modal";
import Navigation from "./Navigation";
import { useSidebarContext } from "./Sidebar";

const MobileHeader = () => {
  const setModalOpen = useAppStore((state) => state.setup.setModalOpen);
  const isLoggedIn = useAppStore((state) => state.getIsAccountReady());
  const isInitializing = useAppStore((state) => state.getIsInitializing());

  const { setEditMode, sidebarEditable } = useSidebarContext();

  const [navOpen, setNavOpen] = useState(false);
  const [castOpen, setCastOpen] = useState(false);

  const { fid } = useFarcasterSigner("mobile-header");
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);

  const openLogin = useCallback(() => setModalOpen(true), [setModalOpen]);
  const openNav = useCallback(() => setNavOpen(true), []);
  const enterEditMode = useCallback(() => setEditMode(true), [setEditMode]);
  
  // Memoize the touch handlers to prevent recreation on each render
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const EDGE_THRESHOLD = 20;
    const x = e.touches[0].clientX;
    if (x <= EDGE_THRESHOLD) {
      (e.currentTarget as any)._startX = x;
    }
  }, []);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const target = e.currentTarget as any;
    if (target._startX !== undefined) {
      const deltaX = e.changedTouches[0].clientX - target._startX;
      if (deltaX > 50) {
        setNavOpen(true);
      }
      target._startX = undefined;
    }
  }, [setNavOpen]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // Logging for detailed debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("[MobileHeader] isLoggedIn:", isLoggedIn, "isInitializing:", isInitializing);
    }
  }, [isLoggedIn, isInitializing]);

  // Memoize the component parts to avoid re-renders
  const userAvatar = useMemo(() => {
    if (!isLoggedIn) return null;
    return (
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
    );
  }, [isLoggedIn, user, openNav]);
  
  const menuButton = useMemo(() => {
    if (isLoggedIn) return null;
    return (
      <Button variant="ghost" size="icon" onClick={openNav} aria-label="Menu">
        <Menu className="w-5 h-5" />
      </Button>
    );
  }, [isLoggedIn, openNav]);
  
 // fallback: if it takes more than 3s to initialize, it shows the login/cast button normally
  const [timedOut, setTimedOut] = React.useState(false);
  useEffect(() => {
    if (isInitializing) {
      const t = setTimeout(() => setTimedOut(true), 3000);
      return () => clearTimeout(t);
    } else {
      setTimedOut(false);
    }
  }, [isInitializing]);

  const actionButton = useMemo(() => {
    if (isInitializing && !timedOut) {
     // Shows a loading while initializing
      return (
        <Button variant="primary" size="icon" disabled>
          <span className="animate-spin">⏳</span>
        </Button>
      );
    }
    if (isLoggedIn) {
      return (
        <Button
          variant="primary"
          size="icon"
          onClick={() => setCastOpen(true)}
          aria-label="Cast"
        >
          <RiQuillPenLine className="w-5 h-5 text-white" />
        </Button>
      );
    }
    return (
      <Button variant="primary" size="sm" onClick={openLogin} withIcon>
        <LogIn size={16} />
        Sign In
      </Button>
    );
  }, [isLoggedIn, isInitializing, timedOut, openLogin]);

  // Memoize drawer change handler
  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setNavOpen(open);
    if (!open) {
      window.scrollTo({ top: 0 });
    }
  }, []);

  return (
    <header className="z-30 flex items-center justify-between h-14 px-4 bg-white overflow-hidden sticky top-0">
      <div className="flex items-center gap-2">
        {isLoggedIn ? userAvatar : menuButton}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <BrandHeader />
      </div>
      <div className="flex items-center gap-2">
        {actionButton}
      </div>
      <Drawer
        open={navOpen}
        onOpenChange={handleDrawerOpenChange}
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

export default React.memo(MobileHeader);
