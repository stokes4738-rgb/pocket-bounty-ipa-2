import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

/**
 * Capacitor-compatible navigation function
 * Uses in-app browser for mobile apps, normal navigation for web
 */
export const navigateTo = async (url: string, external = false) => {
  try {
    if (Capacitor.isNativePlatform() && external) {
      // For external URLs in mobile app, open in system browser
      await Browser.open({ url });
    } else if (Capacitor.isNativePlatform()) {
      // For internal navigation in mobile app, use in-app browser with _self
      await Browser.open({
        url: window.location.origin + url,
        windowName: "_self"
      });
    } else {
      // For web, use normal navigation
      window.location.href = url;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to normal navigation
    window.location.href = url;
  }
};

/**
 * Login navigation helper
 */
export const navigateToLogin = () => navigateTo("/auth");

/**
 * Page navigation helper  
 */
export const navigateToPage = (path: string) => navigateTo(path);