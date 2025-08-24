import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";
import { Eye, X } from "lucide-react";

export default function DemoIndicator() {
  const { isDemoMode, setDemoMode } = useDemo();

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Demo Mode
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-200 dark:hover:bg-orange-800/50"
            onClick={() => setDemoMode(false)}
            data-testid="button-exit-demo"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
          Exploring with sample data • Withdrawals locked
        </p>
      </div>
    </div>
  );
}