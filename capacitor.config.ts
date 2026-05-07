import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6731527d4fb54e95bb9e47de8bea4363',
  appName: 'heartify',
  webDir: 'dist',
  server: {
    url: 'https://6731527d-4fb5-4e95-bb9e-47de8bea4363.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    allowNavigation: ['heartify.app', '*.heartify.app', 'pure-heartify.lovable.app'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0F172A',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    scheme: 'heartify',
  },
};

export default config;
