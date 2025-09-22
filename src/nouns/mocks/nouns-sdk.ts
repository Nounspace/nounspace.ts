// Mock implementation for @nouns/sdk
export const getNounImage = (nounId: number) => `https://noun.pics/${nounId}`;
export const getNounImageData = (nounId: number) => ({
  image: `https://noun.pics/${nounId}`,
  data: null,
});
export const buildSVG = (parts: any[], palette: any) => `<svg>${parts.join('')}</svg>`;
