export const isEthereumAddress = (address: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

export const formatEthereumAddress = (address: string, size: number = 4) => {
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
};
