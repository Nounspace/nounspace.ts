import { CuratedFidgetOption } from "@/common/types/fidgetOptions";

// Curated iframe-friendly sites
// These are sites that work well when embedded in iframes
export const CURATED_SITES: Omit<CuratedFidgetOption, 'id'>[] = [
  // Social
  {
    type: 'curated',
    name: 'Warpcast',
    description: 'Browse Farcaster in an embedded view',
    icon: '🟣',
    tags: ['farcaster', 'social', 'feed'],
    category: 'social',
    url: 'https://warpcast.com',
    popularity: 100
  },
  {
    type: 'curated',
    name: 'Paragraph',
    description: 'Decentralized publishing platform',
    icon: '📝',
    tags: ['writing', 'publishing', 'content'],
    category: 'social',
    url: 'https://paragraph.xyz',

    popularity: 70
  },

  // DeFi
  {
    type: 'curated',
    name: 'Uniswap',
    description: 'Decentralized exchange',
    icon: '🦄',
    tags: ['defi', 'swap', 'trading', 'dex'],
    category: 'defi',
    url: 'https://app.uniswap.org',

    popularity: 95,
    iframeSettings: {
      allowScripts: true,
      allowPopups: true
    }
  },
  {
    type: 'curated',
    name: 'Aave',
    description: 'Decentralized lending protocol',
    icon: '👻',
    tags: ['defi', 'lending', 'borrowing'],
    category: 'defi',
    url: 'https://app.aave.com',

    popularity: 85
  },
  {
    type: 'curated',
    name: 'Compound',
    description: 'Algorithmic money markets',
    icon: '🏦',
    tags: ['defi', 'lending', 'yield'],
    category: 'defi',
    url: 'https://app.compound.finance',

    popularity: 75
  },
  {
    type: 'curated',
    name: 'Curve',
    description: 'Decentralized exchange for stablecoins',
    icon: '🌊',
    tags: ['defi', 'swap', 'stablecoin'],
    category: 'defi',
    url: 'https://curve.fi',

    popularity: 80
  },

  // Media & NFTs
  {
    type: 'curated',
    name: 'Zora',
    description: 'Discover and collect NFTs',
    icon: '⚡',
    tags: ['nft', 'art', 'marketplace', 'creator'],
    category: 'media',
    url: 'https://zora.co',

    popularity: 90
  },
  {
    type: 'curated',
    name: 'OpenSea',
    description: 'NFT marketplace',
    icon: '🌊',
    tags: ['nft', 'marketplace', 'trading'],
    category: 'media',
    url: 'https://opensea.io',

    popularity: 85
  },
  {
    type: 'curated',
    name: 'Foundation',
    description: 'Creative platform for artists',
    icon: '🎨',
    tags: ['nft', 'art', 'creator', 'auction'],
    category: 'media',
    url: 'https://foundation.app',

    popularity: 75
  },
  {
    type: 'curated',
    name: 'Mirror',
    description: 'Decentralized publishing',
    icon: '🪞',
    tags: ['writing', 'publishing', 'web3'],
    category: 'media',
    url: 'https://mirror.xyz',

    popularity: 70
  },

  // Tools
  {
    type: 'curated',
    name: 'Figma',
    description: 'Design and prototyping tool',
    icon: '🎨',
    tags: ['design', 'tool', 'creative', 'collaboration'],
    category: 'tools',
    url: 'https://figma.com',

    popularity: 80
  },
  {
    type: 'curated',
    name: 'Notion',
    description: 'All-in-one workspace',
    icon: '📝',
    tags: ['productivity', 'notes', 'workspace'],
    category: 'tools',
    url: 'https://notion.so',

    popularity: 85
  },
  {
    type: 'curated',
    name: 'Etherscan',
    description: 'Ethereum blockchain explorer',
    icon: '🔍',
    tags: ['blockchain', 'explorer', 'ethereum'],
    category: 'tools',
    url: 'https://etherscan.io',

    popularity: 75
  },
  {
    type: 'curated',
    name: 'DeFiPulse',
    description: 'DeFi analytics and rankings',
    icon: '📊',
    tags: ['defi', 'analytics', 'data'],
    category: 'tools',
    url: 'https://defipulse.com',

    popularity: 65
  },
  {
    type: 'curated',
    name: 'Dune Analytics',
    description: 'Blockchain analytics platform',
    icon: '🏜️',
    tags: ['analytics', 'blockchain', 'data'],
    category: 'tools',
    url: 'https://dune.com',

    popularity: 70
  },

  // Games
  {
    type: 'curated',
    name: 'Axie Infinity',
    description: 'Play-to-earn game',
    icon: '🎮',
    tags: ['game', 'p2e', 'nft'],
    category: 'games',
    url: 'https://axieinfinity.com',

    popularity: 75
  },
  {
    type: 'curated',
    name: 'Decentraland',
    description: 'Virtual world platform',
    icon: '🏗️',
    tags: ['metaverse', 'virtual', 'world'],
    category: 'games',
    url: 'https://decentraland.org',

    popularity: 70
  },

  // Getting Started
  {
    type: 'curated',
    name: 'Coinbase',
    description: 'Buy, sell, and manage crypto',
    icon: '🔵',
    tags: ['exchange', 'wallet', 'beginner'],
    category: 'getting-started',
    url: 'https://coinbase.com',

    popularity: 90
  },
  {
    type: 'curated',
    name: 'MetaMask',
    description: 'Ethereum wallet',
    icon: '🦊',
    tags: ['wallet', 'ethereum', 'web3'],
    category: 'getting-started',
    url: 'https://metamask.io',

    popularity: 95
  },
  {
    type: 'curated',
    name: 'Ethereum.org',
    description: 'Learn about Ethereum',
    icon: '💎',
    tags: ['ethereum', 'education', 'learning'],
    category: 'getting-started',
    url: 'https://ethereum.org',

    popularity: 80
  }
];

// Helper function to get sites by category
export function getSitesByCategory(category: string): Omit<CuratedFidgetOption, 'id'>[] {
  return CURATED_SITES.filter(site => site.category === category);
}

// Helper function to search sites
export function searchSites(query: string): Omit<CuratedFidgetOption, 'id'>[] {
  const lowerQuery = query.toLowerCase();
  return CURATED_SITES.filter(site => 
    site.name.toLowerCase().includes(lowerQuery) ||
    site.description.toLowerCase().includes(lowerQuery) ||
    site.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
} 