// PWA utility functions to handle standalone mode issues

export const isPWAStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const fixPWAInputs = (): void => {
  if (!isPWAStandalone()) return;

  // Fix input focus issues in PWA standalone mode
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach((input) => {
    // Prevent zoom on focus (iOS issue)
    input.addEventListener('focus', () => {
      const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }
    });
    
    // Restore zoom after blur
    input.addEventListener('blur', () => {
      const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1';
      }
    });
  });
};

export const enablePWAKeyboard = (): void => {
  if (!isPWAStandalone()) return;

  // Force keyboard to show on mobile PWA
  document.addEventListener('touchend', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      target.focus();
    }
  });
};