import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pocketbounty.app',
  appName: 'Pocket Bounty',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Browser: {
      presentationStyle: 'popover'
    }
  }
};

export default config;