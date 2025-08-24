import { Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DemoLockOverlayProps {
  action: string;
  onClose?: () => void;
}

export default function DemoLockOverlay({ action, onClose }: DemoLockOverlayProps) {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Demo Mode Active",
      description: "Sign up for a real account to access all features",
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-4">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Demo Mode Limitation</h3>
          <p className="text-muted-foreground mb-6">
            <strong>{action}</strong> is not available in demo mode. 
            This feature requires a real account to prevent actual transactions.
          </p>
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You can explore all other features with sample data
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-demo-continue"
            >
              Continue Demo
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-demo-upgrade"
            >
              Get Real Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}