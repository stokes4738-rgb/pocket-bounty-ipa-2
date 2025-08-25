// PWA utility functions to handle standalone mode issues

export const isPWAStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const fixPWAInputs = (): void => {
  // Apply fixes for both PWA and regular mobile browsers
  const applyInputFix = (input: Element) => {
    const element = input as HTMLInputElement;
    
    // Prevent zoom on focus (iOS issue)
    element.addEventListener('focus', () => {
      const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }
    });
    
    // Restore zoom after blur
    element.addEventListener('blur', () => {
      const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0';
      }
    });
    
    // Force proper focus on click for inputs with inputMode
    if (element.hasAttribute('inputMode')) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        element.focus();
        element.select();
      });
      
      element.addEventListener('touchstart', (e) => {
        setTimeout(() => {
          element.focus();
          element.click();
        }, 50);
      }, { passive: true });
    }
  };
  
  // Apply to existing inputs
  document.querySelectorAll('input, textarea, select').forEach(applyInputFix);
  
  // Apply to dynamically added inputs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node: any) => {
        if (node.nodeType === 1) {
          if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT') {
            applyInputFix(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('input, textarea, select').forEach(applyInputFix);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

export const enablePWAKeyboard = (): void => {
  // Force keyboard to show on mobile PWA and browsers
  document.addEventListener('touchend', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      setTimeout(() => {
        target.focus();
        if (target.tagName === 'INPUT') {
          (target as HTMLInputElement).click();
        }
      }, 100);
    }
  });
  
  // Special handling for number/decimal inputs
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT') {
      const input = target as HTMLInputElement;
      if (input.getAttribute('inputMode') === 'decimal' || input.getAttribute('inputMode') === 'numeric') {
        input.focus();
        input.select();
      }
    }
  });
};