import { forwardRef, InputHTMLAttributes, useEffect, useRef, useState } from 'react';

interface PWAInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PWAInput = forwardRef<HTMLInputElement, PWAInputProps>(
  ({ label, className = '', onClick, onFocus, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    
    useEffect(() => {
      const input = inputRef.current || (ref as any)?.current;
      if (!input) return;
      
      // Completely override all input behaviors for PWA
      const handleInteraction = (e: Event) => {
        // Don't prevent default for actual typing
        if (e.type === 'input' || e.type === 'change') return;
        
        e.stopPropagation();
        
        // Remove any readonly attributes
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
        
        // Multiple attempts to focus
        requestAnimationFrame(() => {
          input.focus();
          input.click();
          
          // Try setting selection range
          setTimeout(() => {
            try {
              if (input.value) {
                input.setSelectionRange(input.value.length, input.value.length);
              }
            } catch {}
          }, 50);
        });
      };
      
      // Add listeners for all possible interaction events
      ['mousedown', 'touchstart', 'click', 'focus'].forEach(event => {
        input.addEventListener(event, handleInteraction, true);
      });
      
      return () => {
        ['mousedown', 'touchstart', 'click', 'focus'].forEach(event => {
          input.removeEventListener(event, handleInteraction, true);
        });
      };
    }, []);
    
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      const input = inputRef.current;
      if (input) {
        input.focus();
        setTimeout(() => input?.focus(), 100);
      }
      onClick?.(e);
    };
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };
    
    return (
      <>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium mb-1"
            onClick={() => {
              const input = inputRef.current;
              if (input) {
                input.focus();
                input.click();
              }
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={inputRef}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-pwa-input="true"
          {...props}
        />
      </>
    );
  }
);

PWAInput.displayName = 'PWAInput';

export default PWAInput;