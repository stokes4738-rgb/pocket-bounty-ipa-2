import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pocketbounty.app',
  appName: 'Pocket Bounty',
  webDir: 'client/dist',
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