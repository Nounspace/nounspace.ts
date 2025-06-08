"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Channel, FarcasterEmbed } from '@mod-protocol/farcaster';
import { useQueryClient } from '@tanstack/react-query';

// Define the types of data that will be shared
interface SharedDataContextType {
  // Cache of recently accessed channels
  recentChannels: Channel[];
  addRecentChannel: (channel: Channel) => void;
  
  // Cache of recently processed embeds
  recentEmbeds: Record<string, FarcasterEmbed>;
  addRecentEmbed: (url: string, embed: FarcasterEmbed) => void;
  getRecentEmbed: (url: string) => FarcasterEmbed | undefined;
  
  // Method to invalidate specific caches
  invalidateCache: (cacheKey: string) => void;
}

// Creating the context
const SharedDataContext = createContext<SharedDataContextType | null>(null);

/**
 * Provider that manages data sharing between related components
 */
export const SharedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // React Query client to manage the cache
  const queryClient = useQueryClient();
  
  // Internal state for recent channels
  const [recentChannels, setRecentChannels] = useState<Channel[]>([]);
  
  // Internal state for recent embeds
  const [recentEmbeds, setRecentEmbeds] = useState<Record<string, FarcasterEmbed>>({});
  
  // Adds a channel to recent ones, avoiding duplicates
  const addRecentChannel = useCallback((channel: Channel) => {
    setRecentChannels(prev => {
      // Remove duplicates and add the new channel at the beginning
      const filtered = prev.filter(c => c.id !== channel.id);
      return [channel, ...filtered].slice(0, 20); // Keep up to 20 recent channels
    });
  }, []);
  
  // Adds an embed to the recent embeds cache
  const addRecentEmbed = useCallback((url: string, embed: FarcasterEmbed) => {
    setRecentEmbeds(prev => ({
      ...prev,
      [url]: embed,
    }));
  }, []);
  
  // Retrieves an embed from the cache
  const getRecentEmbed = useCallback((url: string) => {
    return recentEmbeds[url];
  }, [recentEmbeds]);
  
  // Invalidates a specific cache in React Query
  const invalidateCache = useCallback((cacheKey: string) => {
    queryClient.invalidateQueries({ queryKey: [cacheKey] });
  }, [queryClient]);
  
  // Context value
  const value = {
    recentChannels,
    addRecentChannel,
    recentEmbeds,
    addRecentEmbed,
    getRecentEmbed,
    invalidateCache,
  };
  
  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
};

/**
 * Hook to access the shared data context
 */
export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  
  if (context === null) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  
  return context;
};
