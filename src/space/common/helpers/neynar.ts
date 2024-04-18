import axios from "axios";
import { CastType } from "../constants/farcaster";

type FeedEndpointProps = {
  fid?: string;
  parentUrl?: string;
  cursor?: string;
  limit?: number;
};

type CastThreadEndpointProps = {
  castHash: string;
  fid?: string;
}

type NotificationsEndpointProps = {
  fid: string | number;
  cursor?: string;
  limit?: number;
}

export type CasterType = {
  fid: number
  username?: string
  display_name?: string

}
export const DEFAULT_FEED_PAGE_SIZE = 10;

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
const NEYNAR_API_URL = 'https://api.neynar.com';

export const resolveWarpcastUrl = async (url: string): Promise<CastType> => {
  const options = {
    method: 'GET',
    url: `${NEYNAR_API_URL}/v2/farcaster/cast`,
    params: { type: 'url', identifier: url },
    headers: { accept: 'application/json', api_key: NEYNAR_API_KEY }
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data.cast;
    })
    .catch(function (error) {
      console.error(error);
      return null;
    });
}

export type UserNeynarV2Type = {
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  active_status: string;
  pfp: {
    url: string;
  };
};

export type UserNeynarV1Type = {
  fid: number;
  custodyAddress: string;
  username: string;
  displayName: string;
  pfp: {
    url: string;
  };
  profile: {
    bio: {
      text: string;
      mentions: string[];
    };
  };
  followerCount: number;
  followingCount: number;
  verifications: string[];
  activeStatus: string;
  viewerContext: {
    following: boolean;
    followedBy: boolean;
  };
};
