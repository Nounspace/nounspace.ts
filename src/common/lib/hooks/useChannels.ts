"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchChannelsForUser, fetchChannelsByName, type Channel } from '@/fidgets/farcaster/utils';

/**
* Hook to fetch user channels with cache
* 
* @param fid Farcaster user ID
* @param limit Maximum number of channels to return
* @returns Result of the query with the user channels
*/
export const useUserChannels = (fid: number, limit: number = 20) => {
  return useQuery({
    queryKey: ['user-channels', fid, limit],
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    enabled: !!fid && fid > 0,
    queryFn: async () => {
      try {
        return await fetchChannelsForUser(fid, limit);
      } catch (error) {
        console.error('Error fetching user channels:', error);
        return [] as Channel[];
      }
    }
  });
};

/**
* Hook to search for channels by name with integrated debounce
* 
* @param query Search string
* @param limit Maximum number of channels to return
* @returns Query result with the channels found
*/
export const useChannelsByName = (query: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['channels-by-name', query, limit],
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    enabled: !!query && query.length > 1,
    queryFn: async () => {
      try {
        return await fetchChannelsByName(query, limit);
      } catch (error) {
        console.error('Error searching channels:', error);
        return [] as Channel[];
      }
    }
  });
};
