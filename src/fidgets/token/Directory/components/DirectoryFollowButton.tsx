import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/common/components/atoms/button";
import type { DirectoryMemberData } from "../types";
import { followUser, unfollowUser } from "@/fidgets/farcaster/utils";

export type DirectoryFollowButtonProps = {
  member: DirectoryMemberData;
  viewerFid: number;
  signer: Parameters<typeof followUser>[2] | undefined;
  className?: string;
};

export const DirectoryFollowButton: React.FC<DirectoryFollowButtonProps> = ({
  member,
  viewerFid,
  signer,
  className,
}) => {
  const canFollow = useMemo(() => {
    return (
      Boolean(signer) &&
      typeof viewerFid === "number" &&
      viewerFid > 0 &&
      typeof member.fid === "number" &&
      member.fid > 0 &&
      member.fid !== viewerFid
    );
  }, [member.fid, signer, viewerFid]);

  const initialFollowing = member.viewerContext?.following ?? false;
  const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowing);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing, member.fid]);

  if (!canFollow) {
    return null;
  }

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!signer || typeof member.fid !== "number" || member.fid <= 0) {
      return;
    }

    const targetFid = member.fid;
    const nextFollowing = !isFollowing;

    setStatus("loading");
    setIsFollowing(nextFollowing);

    try {
      const success = nextFollowing
        ? await followUser(targetFid, viewerFid, signer)
        : await unfollowUser(targetFid, viewerFid, signer);

      if (!success) {
        throw new Error("Failed to update follow status");
      }

      setStatus("idle");
    } catch (error) {
      console.error("Directory follow toggle failed", error);
      setIsFollowing(!nextFollowing);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label = status === "loading"
    ? "..."
    : isFollowing
      ? isHovering
        ? "Unfollow"
        : "Following"
      : "Follow";

  return (
    <Button
      type="button"
      size="sm"
      variant={isFollowing ? "secondary" : "primary"}
      disabled={status === "loading"}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={className}
    >
      {label}
    </Button>
  );
};
