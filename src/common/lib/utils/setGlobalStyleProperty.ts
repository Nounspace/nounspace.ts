export const setGlobalStyleProperty = (key: string, value: string): void => {
  document.documentElement.style.setProperty(key, value);
};

export default setGlobalStyleProperty;
