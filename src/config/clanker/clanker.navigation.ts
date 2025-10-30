import { NavigationConfig } from "../systemConfig";

export const clankerNavigation: NavigationConfig = {
  items: [
    { id: 'home', label: 'Home', href: '/home', icon: 'home' },
    { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'notifications', requiresAuth: true },
  ]
};

export default clankerNavigation;

