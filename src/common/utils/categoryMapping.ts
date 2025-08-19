/**
 * Shared utility functions for mapping categories and tags across the application
 */

export interface AppForCategoryMapping {
  category?: string;
  tags?: string[];
  description?: string;
  name: string;
  author?: {
    isPowerUser?: boolean;
  };
  engagement?: {
    followerCount?: number;
  };
}

/**
 * Map various app categories to Nounspace category system
 * Uses a comprehensive keyword-based approach that analyzes tags, description, and name
 */
export function mapToNounspaceCategory(app: AppForCategoryMapping): string {
  const neynarCategory = app.category?.toLowerCase();
  const tags = (app.tags || []).map(tag => tag.toLowerCase());
  const description = app.description?.toLowerCase() || '';
  const name = app.name.toLowerCase();
  
  // Helper function to check for keywords across tags, description, and name
  const hasKeyword = (keywords: string[]) => 
    tags.some(tag => keywords.some(keyword => tag.includes(keyword))) ||
    keywords.some(keyword => description.includes(keyword)) ||
    keywords.some(keyword => name.includes(keyword));
  
  // Tag-based analysis (prioritized over category for better accuracy)
  if (hasKeyword(['game', 'gaming', 'play', 'battle', 'league', 'mech', 'versus', 'fight'])) return 'games';
  if (hasKeyword(['defi', 'finance', 'trading', 'swap', 'token', 'coin', 'money', 'pay'])) return 'defi';
  if (hasKeyword(['tool', 'utility', 'productivity', 'earn', 'discover', 'qr', 'scan'])) return 'tools';
  if (hasKeyword(['art', 'content', 'media', 'nft', 'create', 'design'])) return 'content';
  if (hasKeyword(['governance', 'voting', 'dao', 'proposal', 'vote'])) return 'governance';
  if (hasKeyword(['donate', 'impact', 'charity', 'public', 'social-impact'])) return 'social-impact';
  
  // Direct category mapping (fallback after tag analysis)
  if (neynarCategory) {
    switch (neynarCategory) {
      case 'games':
      case 'gaming':
        return 'games';
      case 'social':
      case 'community':
        return 'social';
      case 'defi':
      case 'finance':
        return 'defi';
      case 'utility':
      case 'tools':
        return 'tools';
      case 'content':
      case 'media':
        return 'content';
      case 'governance':
        return 'governance';
    }
  }
  
  // Social fallback (if no other category matches)
  if (hasKeyword(['social', 'community', 'chat', 'follow', 'friend', 'farcaster'])) return 'social';
  
  // Default fallback
  return 'mini-apps';
}

/**
 * Generate enhanced tags for better discoverability
 * Combines original tags with category-based tags and ensures consistency
 */
export function generateEnhancedTags(app: AppForCategoryMapping, category: string): string[] {
  const tags = new Set<string>();
  
  // Always include core tags
  tags.add('mini-apps');
  
  // Add the mapped category (avoid duplication with mini-apps)
  if (category !== 'mini-apps') {
    tags.add(category);
  }
  
  // Add original Neynar category if different from mapped category
  if (app.category && app.category.toLowerCase() !== category) {
    tags.add(app.category.toLowerCase());
  }
  
  // Add original app tags (filtered and cleaned)
  if (app.tags) {
    app.tags.forEach((tag: string) => {
      const cleanTag = tag.toLowerCase().trim();
      if (cleanTag && cleanTag !== 'miniapp' && cleanTag.length > 1) {
        tags.add(cleanTag);
      }
    });
  }
  
  // Add category-specific enhanced tags
  switch (category) {
    case 'defi':
      tags.add('finance');
      tags.add('trading');
      break;
    case 'social':
      tags.add('community');
      tags.add('farcaster');
      break;
    case 'games':
      tags.add('gaming');
      tags.add('entertainment');
      break;
    case 'tools':
      tags.add('utility');
      tags.add('productivity');
      break;
    case 'content':
      tags.add('creative');
      tags.add('media');
      break;
    case 'governance':
      tags.add('voting');
      tags.add('dao');
      break;
    case 'social-impact':
      tags.add('charity');
      tags.add('public-good');
      break;
  }
  
  // Add platform-specific tags
  tags.add('neynar');
  tags.add('farcaster');
  
  // Add author-based tags if power user
  if (app.author?.isPowerUser) {
    tags.add('verified');
  }
  
  // Add engagement-based tags
  if (app.engagement?.followerCount && app.engagement.followerCount > 10000) {
    tags.add('popular');
  }
  
  return Array.from(tags);
}

/**
 * Calculate popularity score from engagement data
 */
export function calculatePopularity(app: { engagement?: { followerCount?: number } }): number {
  return app.engagement?.followerCount || 0;
}