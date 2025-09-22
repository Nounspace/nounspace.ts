// Mock implementation for @reservoir0x/reservoir-sdk
export const reservoirChains = {
  mainnet: { id: 1, name: 'Ethereum' },
  sepolia: { id: 11155111, name: 'Sepolia' },
};

export const createClient = (config: any) => ({
  ...config,
  // Mock client methods
});
