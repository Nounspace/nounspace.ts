import { NavigationConfig } from "../systemConfig";

export const clankerNavigation: NavigationConfig = {
  items: [
    { id: 'home', label: 'Home', href: '/home', icon: 'home' },
    { id: 'explore', label: 'Explore', href: '/explore', icon: 'explore' },
    { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'notifications', requiresAuth: true },
  ]
};

export default clankerNavigation;

