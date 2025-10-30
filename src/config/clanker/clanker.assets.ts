// Local, colocated assets bundled by Next.js
// Place files in ./assets/ (e.g., ./assets/logo.png)
import logo from './assets/logo.png';
import icon from './assets/icon.png';
import og from './assets/og.png';
import splash from './assets/splash.png';

export const clankerAssets = {
  logos: {
    main: logo,
    icon: icon,
    // Keep favicon/appleTouch in public if you need fixed URLs for meta/PWA; otherwise bundle here
    favicon: icon,
    appleTouch: icon,
    og: og,
    splash: splash
  }
};
