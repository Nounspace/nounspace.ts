"use client";

/**
 * ProfileSpace Component
 * 
 * Client-side space component for user profile spaces in the public spaces pattern.
 * 
 * Responsibilities:
 * - Accepts server-side loaded profile data (Omit<ProfileSpaceData, 'isEditable' | 'spacePageUrl'>)
 * - Adds client-side editability logic based on Farcaster FID matching
 * - Renders PublicSpace component with complete profile space data
 * 
 * Data Flow:
 * 1. Receives serializable profile data from server-side page component
 * 2. Adds isEditable function that checks if current user FID matches profile FID
 * 3. Adds spacePageUrl function for tab navigation using profile handle
 * 4. Passes complete ProfileSpaceData to PublicSpace for rendering
 * 
 * Editability Logic:
 * - User can edit their own profile space (FID comparison)
 * - Simple FID matching for ownership verification
 * 
 * Part of: /s/[handle] route structure
 * Integrates with: PublicSpace
 */

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ProfileSpacePageData } from "@/common/types/spaceData";

export interface ProfileSpaceProps {
  spacePageData: Omit<ProfileSpacePageData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
}

// Helper function to check if profile space is editable
const isProfileSpaceEditable = (
  fid: number,
  currentUserFid: number | undefined
): boolean => {
  return currentUserFid !== undefined && currentUserFid === fid;
};

export default function ProfileSpace({
  spacePageData: spaceData,
  tabName,
}: ProfileSpaceProps) {

  // Add isEditable and spacePageUrl logic on the client side
  const spaceDataWithEditability = useMemo(() => ({
    ...spaceData,
    spacePageUrl: (tabName: string) => `/s/${spaceData.spaceName}/${encodeURIComponent(tabName)}`,
    isEditable: (currentUserFid: number | undefined) => 
      isProfileSpaceEditable(spaceData.fid, currentUserFid),
  }), [spaceData]);

  return (
    <PublicSpace
      spaceData={spaceDataWithEditability}
      tabName={tabName}
    />
  );
}
