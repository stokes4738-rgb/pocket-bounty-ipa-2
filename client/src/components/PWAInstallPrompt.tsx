import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export default function PWAInstallPrompt({ 
  onClose, 
  showCloseButton = true,
  className = ""
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      // Hide the install prompt when app is installed
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    onClose?.();
  };

  // Don't show if no install prompt is available or user already dismissed
  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className={`theme-transition border-pocket-gold/20 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-pocket-gold/10 rounded-lg">
            <Smartphone className="h-5 w-5 text-pocket-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Get the Pocket Bounty App! 📱</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add to your home screen for instant access to weird bounties and faster notifications!
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstallClick}
                className="bg-pocket-gold hover:bg-pocket-gold/90 text-black"
                data-testid="button-install-pwa"
              >
                <Download className="h-3 w-3 mr-1" />
                Add to Home Screen
              </Button>
              {showCloseButton && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleClose}
                  data-testid="button-close-install-prompt"
                >
                  Maybe Later
                </Button>
              )}
            </div>
          </div>
          {showCloseButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="p-1 h-auto"
              data-testid="button-close-install-prompt-x"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}