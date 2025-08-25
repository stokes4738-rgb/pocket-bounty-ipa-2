import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield, Zap, Users } from "lucide-react";
import Tutorial from "@/components/Tutorial";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Use in-app browser for mobile app
        await Browser.open({
          url: window.location.origin + "/api/login",
          windowName: "_self"
        });
      } else {
        // Use normal redirect for web
        window.location.href = "/api/login";
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      toast({
        title: "Login Error",
        description: "Failed to open login. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDemoLogin = () => {
    setShowTutorial(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pocket-red/5 via-background to-pocket-gold/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🪙</div>
          <h1 className="text-3xl font-bold text-pocket-red">Pocket Bounty</h1>
          <p className="text-muted-foreground">
            Sign in to start earning and posting bounties
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="theme-transition shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to access your account and continue your journey
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Login Button */}
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-pocket-red hover:bg-pocket-red/90 text-white py-3 text-lg font-semibold"
              data-testid="button-login-primary"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In with Replit
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  New to Pocket Bounty?
                </span>
              </div>
            </div>

            {/* Create Account Link */}
            <Button 
              variant="outline" 
              className="w-full py-3"
              onClick={() => window.location.href = "/create-account"}
              data-testid="button-create-account-link"
            >
              Create Your Account
            </Button>

            {/* Demo Section */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Want to explore first?
              </p>
              <Button 
                variant="ghost" 
                className="w-full text-sm"
                onClick={handleDemoLogin}
                data-testid="button-demo-mode"
              >
                View Demo Features
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="theme-transition">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-center">What You'll Get</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Zap className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Instant Earnings</p>
                  <p className="text-xs text-muted-foreground">Complete tasks and get paid</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Social Network</p>
                  <p className="text-xs text-muted-foreground">Connect with other users</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Secure Payments</p>
                  <p className="text-xs text-muted-foreground">Protected by Stripe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              🔒 Secure
            </Badge>
            <Badge variant="outline" className="text-xs">
              ⚡ Fast
            </Badge>
            <Badge variant="outline" className="text-xs">
              🎮 Fun
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by Replit • Secure authentication
          </p>
        </div>
      </div>
      
      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}