import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { fixPWAInputs, enablePWAKeyboard } from "./lib/pwaUtils";

// Register service worker for better PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed'));
  });
}

// Initialize PWA input fixes
document.addEventListener('DOMContentLoaded', () => {
  fixPWAInputs();
  enablePWAKeyboard();
  
  // Extra aggressive input fix for PWA
  setInterval(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], input[type="email"]');
    inputs.forEach((input: any) => {
      if (!input.hasAttribute('data-pwa-fixed')) {
        input.setAttribute('data-pwa-fixed', 'true');
        input.addEventListener('touchstart', (e: Event) => {
          e.stopPropagation();
          setTimeout(() => input.focus(), 0);
        }, { passive: false });
      }
    });
  }, 500);
});

createRoot(document.getElementById("root")!).render(<App />);
