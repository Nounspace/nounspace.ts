import type { NavigationConfig } from "../systemConfig";

export const gnarsNavigation: NavigationConfig = {
  logoTooltip: {
    text: "gnars.com",
    href: "https://gnars-shadcn.vercel.app/",
  },
  items: [
    { id: "home", label: "Home", href: "/home", icon: "home" },
    { id: "explore", label: "Explore", href: "/explore", icon: "explore" },
    {
      id: "channel",
      label: "/gnars",
      href: "/s/gnars",
      icon: "space",
    },
    {
      id: "token",
      label: "$GNARS",
      href: "/t/base/0x0cf0c3b75d522290d7d12c74d7f1f0cc47ccb23b/Profile",
      icon: "robot",
    },
  ],
  showMusicPlayer: false,
  showSocials: true,
};

export default gnarsNavigation;
