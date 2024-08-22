export const resolveCssVariable = (variable: string): string => {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(variable) ||
    "#ffffff"
  );
};
