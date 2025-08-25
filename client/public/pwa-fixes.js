// PWA Input Fixes for iOS Safari standalone mode
(function() {
  'use strict';
  
  // Check if running as PWA
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  
  // Apply fixes when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  } else {
    applyFixes();
  }
  
  function applyFixes() {
    // Fix all current and future inputs
    fixAllInputs();
    observeNewInputs();
    
    // Additional viewport fix for iOS
    if (isStandalone) {
      document.addEventListener('touchstart', function() {}, { passive: true });
    }
  }
  
  function fixAllInputs() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], input[type="password"]');
    inputs.forEach(fixSingleInput);
  }
  
  function fixSingleInput(input) {
    // Set font size to prevent iOS zoom
    if (!input.dataset.pwaFixed) {
      input.dataset.pwaFixed = 'true';
      
      // Ensure 16px font size minimum
      const computedStyle = window.getComputedStyle(input);
      const fontSize = parseInt(computedStyle.fontSize);
      if (fontSize < 16) {
        input.style.fontSize = '16px';
      }
      
      // Remove any autocorrect/autocapitalize that might interfere
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      
      // Special handling for numeric inputs
      if (input.type === 'tel' || input.pattern === '[0-9]*\\.?[0-9]*') {
        // Ensure pattern is set
        if (!input.pattern) {
          input.pattern = '[0-9]*\\.?[0-9]*';
        }
      }
      
      // Touch event to ensure keyboard shows
      input.addEventListener('touchend', function(e) {
        e.preventDefault();
        const target = e.target;
        setTimeout(function() {
          target.focus();
          target.click();
        }, 0);
      }, { passive: false });
      
      // Focus event to ensure visibility
      input.addEventListener('focus', function() {
        // Scroll into view after keyboard appears
        setTimeout(function() {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    }
  }
  
  function observeNewInputs() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'INPUT') {
              fixSingleInput(node);
            } else if (node.querySelectorAll) {
              const inputs = node.querySelectorAll('input');
              inputs.forEach(fixSingleInput);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Additional iOS-specific fixes
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // Fix viewport on orientation change
    window.addEventListener('orientationchange', function() {
      setTimeout(function() {
        window.scrollTo(0, 0);
      }, 500);
    });
  }
})();