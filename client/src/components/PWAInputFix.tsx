import { useEffect } from 'react';

export default function PWAInputFix() {
  useEffect(() => {
    // Aggressive PWA input fix
    const fixInputs = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input: any) => {
        // Remove any readonly attributes
        input.removeAttribute('readonly');
        
        // Add multiple event listeners to ensure keyboard shows
        ['click', 'touchstart', 'touchend', 'focus'].forEach(eventType => {
          input.addEventListener(eventType, (e: Event) => {
            e.stopPropagation();
            setTimeout(() => {
              input.focus();
              input.click();
              // Force selection for better keyboard activation
              if (input.select) input.select();
            }, 0);
          }, { passive: false });
        });
        
        // Special handling for inputs with inputMode
        if (input.getAttribute('inputMode')) {
          input.setAttribute('contenteditable', 'true');
          input.style.webkitUserSelect = 'text';
          input.style.userSelect = 'text';
        }
      });
    };
    
    // Run immediately
    fixInputs();
    
    // Run again after a delay to catch dynamically added inputs
    setTimeout(fixInputs, 500);
    setTimeout(fixInputs, 1000);
    
    // Watch for new inputs
    const observer = new MutationObserver(() => {
      setTimeout(fixInputs, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, []);
  
  return null;
}