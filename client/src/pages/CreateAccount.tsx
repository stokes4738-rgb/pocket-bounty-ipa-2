import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield, DollarSign, Star, ArrowRight, Check } from "lucide-react";

export default function CreateAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();

  const handleCreateAccount = () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms of service to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Redirect to Replit Auth - account creation is handled automatically
    window.location.href = "/api/login";
  };

  const handleExistingUser = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pocket-gold/5 via-background to-pocket-red/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🪙</div>
          <h1 className="text-3xl font-bold text-pocket-gold">Pocket Bounty</h1>
          <p className="text-muted-foreground">
            Join thousands earning money through bounties
          </p>
        </div>

        {/* Account Creation Benefits */}
        <Card className="theme-transition shadow-lg border-pocket-gold/20">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Start your journey to financial freedom
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center mb-4">What You Get:</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="bg-green-600 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Instant $10 Starting Bonus</p>
                  <p className="text-xs text-muted-foreground">Free money to start posting bounties</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="bg-blue-600 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Unlimited Earning Potential</p>
                  <p className="text-xs text-muted-foreground">No caps on how much you can make</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Secure Stripe Payments</p>
                  <p className="text-xs text-muted-foreground">Bank-level security for all transactions</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="bg-orange-600 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Social Features & Games</p>
                  <p className="text-xs text-muted-foreground">Connect with friends and play mini-games</p>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <button className="text-pocket-red hover:underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-pocket-red hover:underline">
                  Privacy Policy
                </button>
              </Label>
            </div>

            {/* Create Account Button */}
            <Button 
              onClick={handleCreateAccount}
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-pocket-gold hover:bg-pocket-gold/90 text-black py-3 text-lg font-semibold"
              data-testid="button-create-account"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Account with Replit
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Button 
              variant="outline" 
              className="w-full py-3"
              onClick={handleExistingUser}
              data-testid="button-existing-user"
            >
              Sign In to Existing Account
            </Button>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <Card className="theme-transition">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-center">Trusted by Users</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">$10K+</div>
                <div className="text-xs text-muted-foreground">Paid Out</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">4.9★</div>
                <div className="text-xs text-muted-foreground">User Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Bank-Level Security
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Instant Payments
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Top Rated
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by Replit • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
}