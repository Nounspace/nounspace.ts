// Mock implementation for usehooks-ts
export const useMediaQuery = (query: string) => false;
export const useLocalStorage = (key: string, initialValue: any) => [initialValue, () => {}];
export const useSessionStorage = (key: string, initialValue: any) => [initialValue, () => {}];
