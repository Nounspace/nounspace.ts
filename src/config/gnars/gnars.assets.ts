import logo from "./assets/logo.svg";
import og from "./assets/og.svg";

const logoSrc = (logo as { src?: string }).src ?? (logo as string);
const ogSrc = (og as { src?: string }).src ?? (og as string);

export const gnarsAssets = {
  logos: {
    main: logoSrc,
    icon: logoSrc,
    favicon: "/images/favicon.ico",
    appleTouch: "/images/apple-touch-icon.png",
    og: ogSrc,
    splash: ogSrc,
  },
};
