declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider;
  }
  interface Window {
    __TAURI__: {
      app?: typeof app;
      // ... the other tauri modules
    };
  }
}
