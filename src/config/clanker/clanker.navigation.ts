import { NavigationConfig } from "../systemConfig";

export const clankerNavigation: NavigationConfig = {
  logoTooltip: {
    text: "clanker.world",
    href: "https://www.clanker.world",
  },
  items: [
    { id: 'home', label: 'Home', href: '/home', icon: 'home' },
    { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'notifications', requiresAuth: true },
  ]
};

export default clankerNavigation;

