import { Address } from "viem";
import { MasterToken } from "@/common/providers/TokenProvider";
import { SpaceConfig } from "@/app/(spaces)/Space";

export enum SPACE_TYPES {
  PROFILE = "profile",
  TOKEN = "token", 
  PROPOSAL = "proposal",
  CHANNEL = "channel",
}

export type SpaceTypeValue = `${SPACE_TYPES}`;

// Base space data interface
export interface SpaceData {
  spaceId?: string; // Set by PublicSpace through registration
  spaceName: string;
  spaceType: SPACE_TYPES;
  updatedAt: string;
  spacePageUrl: (tabName: string) => string;
  isEditable: (currentUserFid?: number, wallets?: { address: Address }[]) => boolean;
  defaultTab: string; // Default tab name for this space
  config: SpaceConfig;
}

// Type-specific space data interfaces
export interface ProfileSpaceData extends SpaceData {
  fid: number;
  spaceOwnerFid?: number;
}

export interface TokenSpaceData extends SpaceData {
  contractAddress: Address;
  network: string;
  ownerAddress: Address;
  tokenData?: MasterToken;
}

export interface ProposalSpaceData extends SpaceData {
  proposalId: string;
  ownerAddress: Address;
}

export interface ChannelSpaceData extends SpaceData {
  channelName: string;
  channelId: string;
  spaceOwnerFid?: number;
}

// Union type for all space data types
export type SpacePageData = ProfileSpaceData | TokenSpaceData | ProposalSpaceData | ChannelSpaceData;

// Type guards for space data
export function isProfileSpace(spaceData: SpacePageData): spaceData is ProfileSpaceData {
  return spaceData.spaceType === SPACE_TYPES.PROFILE;
}

export function isTokenSpace(spaceData: SpacePageData): spaceData is TokenSpaceData {
  return spaceData.spaceType === SPACE_TYPES.TOKEN;
}

export function isProposalSpace(spaceData: SpacePageData): spaceData is ProposalSpaceData {
  return spaceData.spaceType === SPACE_TYPES.PROPOSAL;
}

export function isChannelSpace(spaceData: SpacePageData): spaceData is ChannelSpaceData {
  return spaceData.spaceType === SPACE_TYPES.CHANNEL;
}

// Backward compatibility aliases
export type ProfileSpacePageData = ProfileSpaceData;
export type TokenSpacePageData = TokenSpaceData;
export type ProposalSpacePageData = ProposalSpaceData;
export type ChannelSpacePageData = ChannelSpaceData;
