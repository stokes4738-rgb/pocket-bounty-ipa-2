// PWA input fixes for better keyboard support in standalone mode
(function() {
  'use strict';
  
  // Check if running in PWA standalone mode
  const isPWAStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true ||
                          document.referrer.includes('android-app://');
  
  if (!isPWAStandalone) return;
  
  console.log('PWA standalone mode detected - applying input fixes');
  
  // Fix for input focus issues in PWA
  document.addEventListener('DOMContentLoaded', function() {
    // Prevent zoom on input focus (iOS issue)
    const preventZoom = function() {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    };
    
    const restoreZoom = function() {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1');
      }
    };
    
    // Apply to all current and future input elements
    const applyInputFix = function(element) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.addEventListener('focus', preventZoom, { passive: true });
        element.addEventListener('blur', restoreZoom, { passive: true });
        
        // Force focus on touch for better mobile experience
        element.addEventListener('touchstart', function() {
          setTimeout(() => element.focus(), 100);
        }, { passive: true });
      }
    };
    
    // Apply to existing elements
    document.querySelectorAll('input, textarea').forEach(applyInputFix);
    
    // Apply to dynamically added elements
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
              applyInputFix(node);
            }
            // Also check children
            node.querySelectorAll && node.querySelectorAll('input, textarea').forEach(applyInputFix);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  
  // Additional fix for keyboard showing
  document.addEventListener('touchend', function(e) {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      // Small delay to ensure the element is ready
      setTimeout(() => {
        target.focus();
        target.click();
      }, 50);
    }
  }, { passive: true });
  
})();