"use client";

import React, { useCallback, useState } from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAppStore, useLogout } from "@/common/data/stores/app";
import Image from "next/image";

// Icons
import { useSidebarContext } from "./Sidebar";
import LoginIcon from "@/common/components/atoms/icons/LoginIcon";
import { FiPenTool } from "react-icons/fi";
import { MenuIcon } from "lucide-react";

export interface AppNavbarProps {}

export const AppNavbar: React.FC<AppNavbarProps> = () => {
  const { authenticated, ready } = usePrivy();
  const { setSidebarEditable, portalRef } = useSidebarContext();
  const logout = useLogout();
  const { setModalOpen } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
  }));

  // Open the sidebar with user icon (for logged in) or menu icon (for logged out)
  const openSidebar = useCallback(() => {
    setSidebarEditable(true);
    if (portalRef.current) {
      portalRef.current.classList.add("w-full");
    }
  }, [setSidebarEditable, portalRef]);

  // Open the login modal
  const openLoginModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  // Open new cast dialog for posting
  const openNewCast = useCallback(() => {
    // Implementation for opening a new cast dialog
    console.log("Open new cast dialog");
  }, []);

  return (
    <header className="w-full h-16 border-b flex items-center justify-between px-4 bg-white">
      {/* Left section with sidebar toggle */}
      <div className="flex items-center">
        <button 
          onClick={openSidebar}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={authenticated ? "Open user menu" : "Open sidebar"}
        >
          {authenticated ? (
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
              U
            </div>
          ) : (
            <MenuIcon />
          )}
        </button>
      </div>

      {/* Center section with logo */}
      <div className="flex-1 flex justify-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/nouns.svg" 
            alt="Nounspace Logo" 
            width={30} 
            height={30} 
            className="mr-2"
          />
          <span className="text-lg font-bold">Nounspace</span>
        </Link>
      </div>

      {/* Right section with login or new cast button */}
      <div className="flex items-center">
        {authenticated ? (
          <button 
            onClick={openNewCast}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Create new cast"
          >
            <FiPenTool size={20} />
          </button>
        ) : (
          <button 
            onClick={openLoginModal}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <LoginIcon />
            <span className="ml-2">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AppNavbar;
