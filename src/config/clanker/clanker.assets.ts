// Source images colocated with config, emitted by bundler
import logo from './assets/logo.jpg';
import icon from './assets/favicon.ico';
import og from './assets/og.jpg';
import applePng from './assets/apple.png';

export const clankerAssets = {
  logos: {
    // Export plain strings resolved by the bundler
    main: logo.src,
    icon: icon.src,
    favicon: icon.src,
    // Apple touch must be PNG; use local clanker asset
    appleTouch: applePng.src,
    og: og.src,
    splash: og.src
  }
};
