import { NavigationConfig } from "../systemConfig";

export const nounsNavigation: NavigationConfig = {
  items: [
    { id: 'home', label: 'Home', href: '/home', icon: 'home' },
    { id: 'explore', label: 'Explore', href: '/explore', icon: 'explore' },
    { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'notifications', requiresAuth: true },
    { id: 'space-token', label: '$SPACE', href: 'https://nounspace.com/t/base/0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab/Profile', icon: 'space', openInNewTab: true },
  ]
};

export default nounsNavigation;

