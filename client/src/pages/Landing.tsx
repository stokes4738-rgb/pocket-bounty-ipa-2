import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🪙</div>
            <h1 className="text-3xl font-bold text-pocket-gold mb-2">
              Pocket Bounty
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Earn money by completing simple tasks and bounties
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">📋</div>
              <div>
                <div className="font-semibold">Find Bounties</div>
                <div className="text-sm text-muted-foreground">
                  Browse tasks that match your skills
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">💰</div>
              <div>
                <div className="font-semibold">Earn Money</div>
                <div className="text-sm text-muted-foreground">
                  Get paid for completing simple tasks
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">🤝</div>
              <div>
                <div className="font-semibold">Connect</div>
                <div className="text-sm text-muted-foreground">
                  Build relationships with other users
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-pocket-red hover:bg-pocket-red-dark text-white"
            size="lg"
            data-testid="button-login"
          >
            Get Started
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Join thousands of users earning money with Pocket Bounty
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
