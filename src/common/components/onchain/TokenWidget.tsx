import React from 'react';
import { TokenCard } from '@coinbase/onchainkit';
import { useTheme } from 'next-themes';

interface TokenWidgetProps {
  address: string;
  chainId?: number;
  showBalance?: boolean;
}

/**
 * Minimal example of using OnchainKit's TokenCard component
 */
export const TokenWidget: React.FC<TokenWidgetProps> = ({
  address,
  chainId = 8453,
  showBalance = true,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <TokenCard
      address={address}
      chainId={chainId}
      showBalance={showBalance}
      theme={isDarkMode ? 'dark' : 'light'}
    />
  );
};
