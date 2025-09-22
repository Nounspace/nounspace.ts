// Mock implementation for @paperclip-labs/whisk-sdk/identity
export const useIdentity = () => ({
  identity: null,
  isLoading: false,
  error: null,
});

export const IdentityProvider = ({ children }: { children: React.ReactNode }) => children;

export const Avatar = ({ children, ...props }: any) => React.createElement('div', props, children);
export const Name = ({ children, ...props }: any) => React.createElement('span', props, children);
