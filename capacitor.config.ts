import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.pocketbounty.app',
  appName: 'Pocket Bounty',
  webDir: 'dist/public',
  server: {
    url: 'http://192.168.1.216', // 
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
    }
  }
};

export default config;