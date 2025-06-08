"use client";

import { useQuery } from '@tanstack/react-query';
import { isString } from 'lodash';
import { CastParamType, CastResponse } from '@neynar/nodejs-sdk/build/api';
import { bytesToHex } from '@noble/ciphers/utils';
import axiosBackend from '@/common/data/api/backend';

/**
* Hook to fetch data from a cast by URL or ID with cache
* 
* @param url Cast URL
* @param castId Cast ID (optional if URL provided)
* @returns The result of the query with data from the cast
*/
export const useCastById = (url?: string, castId?: { fid: number; hash: Uint8Array | string }) => {
  // Create a stable query key for this cast
  const castKey = url || (castId ? `${castId.fid}-${isString(castId.hash) ? castId.hash : bytesToHex(castId.hash)}` : '');
  
  return useQuery({
   
    queryKey: ['cast', castKey],
    
    staleTime: 1000 * 60 * 5, 
    
    refetchOnWindowFocus: false,
    
    retry: 1,
    
    enabled: !!(url || castId),
    
    queryFn: async () => {
      if (!url && !castId) return null;
      
      try {
        if (url) {
          const { data } = await axiosBackend.get<CastResponse>('/api/farcaster/neynar/cast', {
            params: {
              identifier: url,
              type: CastParamType.Url,
            },
          });
          return data.cast;
        } else if (castId) {
          const { data } = await axiosBackend.get<CastResponse>('/api/farcaster/neynar/cast', {
            params: {
              identifier: isString(castId.hash) ? castId.hash : bytesToHex(castId.hash),
              type: CastParamType.Hash,
            },
          });
          return data.cast;
        }
        
        return null;
      } catch (err) {
        console.error(`Error fetching cast: ${err}`);
        throw new Error(err instanceof Error ? err.message : 'Error when searching for cast');
      }
    },
  });
};
