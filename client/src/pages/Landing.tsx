import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Users, Shield, Zap, Star, TrendingUp } from "lucide-react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

export default function Landing() {
  const handleLogin = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use in-app browser for mobile app
        await Browser.open({
          url: window.location.origin + "/auth",
          windowName: "_self"
        });
      } else {
        // Use normal redirect for web
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use in-app browser for mobile app
        await Browser.open({
          url: window.location.origin + "/auth",
          windowName: "_self"
        });
      } else {
        // Use normal redirect for web
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pocket-red/5 via-background to-pocket-gold/5">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Main Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="text-4xl">🪙</div>
                <Badge variant="outline" className="text-pocket-gold border-pocket-gold">
                  New Platform
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="text-pocket-red">Pocket</span>{" "}
                <span className="text-pocket-gold">Bounty</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                The social bounty platform where you earn real money by completing tasks,
                connect with friends, and build your reputation in our gaming community.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold">Real Money</div>
                  <div className="text-sm text-muted-foreground">Instant payouts</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold">Social</div>
                  <div className="text-sm text-muted-foreground">Friends & chat</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-semibold">Secure</div>
                  <div className="text-sm text-muted-foreground">Stripe protected</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <Zap className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="font-semibold">Fast</div>
                  <div className="text-sm text-muted-foreground">Instant access</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleCreateAccount}
                className="w-full bg-pocket-gold hover:bg-pocket-gold/90 text-black text-lg py-6 font-semibold"
                data-testid="button-create-account-main"
              >
                Create Free Account
              </Button>
              
              <Button 
                onClick={handleLogin}
                variant="outline"
                className="w-full text-lg py-6 border-pocket-red text-pocket-red hover:bg-pocket-red hover:text-white"
                data-testid="button-login-main"
              >
                Sign In
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$10K+</div>
                <div className="text-xs text-muted-foreground">Paid Out</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-xs text-muted-foreground">Users</div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">4.9★</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="space-y-4">
            <Card className="theme-transition border-pocket-red/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">📋</span>
                  Browse Bounties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Find tasks that match your skills and interests. From simple data entry 
                  to creative projects - there's something for everyone.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">Content Creation</Badge>
                  <Badge variant="secondary" className="text-xs">Data Entry</Badge>
                  <Badge variant="secondary" className="text-xs">Design</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="theme-transition border-pocket-gold/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">💰</span>
                  Instant Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Complete tasks and get paid immediately. Build your balance, 
                  withdraw to your bank, or reinvest in posting your own bounties.
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Average earning: $25-100/week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="theme-transition border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">🎮</span>
                  Social & Gaming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect with friends, chat, play mini-games like Flappy Bird, 
                  and build your reputation in our community.
                </p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Earn points & unlock achievements
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Secure Payments
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Instant Access
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Active Community
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by Replit • Payments by Stripe • Join the future of work
          </p>
        </div>
      </div>
    </div>
  );
}
