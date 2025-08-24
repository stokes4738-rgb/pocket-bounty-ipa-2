import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  DollarSign, 
  Users, 
  Star, 
  MessageCircle, 
  Trophy,
  Zap,
  Shield,
  PlusCircle,
  CheckCircle,
  CreditCard,
  Gamepad2
} from "lucide-react";

interface TutorialProps {
  onClose: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to Pocket Bounty!",
    description: "Your gateway to earning money by completing tasks",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🪙</div>
          <p className="text-muted-foreground">
            Pocket Bounty connects people who need tasks done with those who want to earn money doing them.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium">Earn Money</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium">Help Others</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "How Bounties Work",
    description: "Understanding the bounty system",
    content: (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Sample Bounty</h3>
          </div>
          <h4 className="font-medium mb-2">Design a Logo for My Coffee Shop</h4>
          <p className="text-sm text-muted-foreground mb-3">
            I need a creative logo for "Bean There" coffee shop. Should be modern and friendly.
          </p>
          <div className="flex items-center justify-between">
            <Badge className="bg-green-600">Reward: $25.00</Badge>
            <Badge variant="outline">Design</Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p><strong>1.</strong> Browse available bounties</p>
          <p><strong>2.</strong> Apply to ones that match your skills</p>
          <p><strong>3.</strong> Complete the task</p>
          <p><strong>4.</strong> Get paid instantly!</p>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Posting Your Own Bounties",
    description: "Need something done? Post a bounty!",
    content: (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <PlusCircle className="h-5 w-5 text-pocket-red" />
            <h3 className="font-semibold">Create a Bounty</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title:</span>
              <span>Write a product description</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reward:</span>
              <span className="text-green-600">$15.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span>Writing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>3 days</span>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            ✅ No posting fees! You only pay the exact reward amount.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Minimum bounty reward is just $1. Perfect for small tasks!
        </p>
      </div>
    )
  },
  {
    id: 4,
    title: "Secure Payments",
    description: "Get paid safely with Stripe",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Bank-Level Security</p>
              <p className="text-xs text-muted-foreground">Powered by Stripe</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Zap className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-sm">Instant Payouts</p>
              <p className="text-xs text-muted-foreground">Withdraw to bank or card</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-sm">Low Fees</p>
              <p className="text-xs text-muted-foreground">5% only on completion</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-center">
            Platform only earns when you do - fair and transparent!
          </p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Social Features",
    description: "Connect, communicate, and build your reputation",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg text-center">
            <MessageCircle className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium">Real-time Chat</p>
            <p className="text-xs text-muted-foreground">Instant messaging</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <Star className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
            <p className="text-sm font-medium">Reviews & Ratings</p>
            <p className="text-xs text-muted-foreground">Build your reputation</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              J
            </div>
            <div>
              <p className="font-medium text-sm">John Designer</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-muted-foreground">4.9 (127 reviews)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            "Great experience! Fast communication and high-quality work."
          </p>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "Gamification & Fun",
    description: "Level up and earn points while working",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full">
            <Gamepad2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">Level 5</div>
            <p className="text-xs text-muted-foreground">Your current level</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">250 pts</div>
            <p className="text-xs text-muted-foreground">Points earned</p>
          </div>
        </div>
        <div className="p-3 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">Mini-Games</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Play Flappy Bird to earn extra points between bounties!
          </p>
          <Button size="sm" variant="outline" className="w-full">
            🐦 Play Now
          </Button>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <p className="text-sm text-center">
            Earn points for completing tasks, posting bounties, and playing games!
          </p>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "Ready to Get Started?",
    description: "Join thousands of users earning money on Pocket Bounty",
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">You're All Set!</h3>
          <p className="text-muted-foreground mb-4">
            You now understand how Pocket Bounty works. Ready to start earning?
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-green-600">$10K+</div>
            <div className="text-xs text-muted-foreground">Paid Out</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">500+</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">4.9★</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full bg-pocket-red hover:bg-pocket-red/90 text-white"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-tutorial-signup"
          >
            Sign Up Now - Get $10 Bonus!
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Free to join • Start earning immediately • Secure & trusted
          </p>
        </div>
      </div>
    )
  }
];

export default function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(tutorialSteps.length - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto theme-transition">
        <CardHeader className="relative">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
              data-testid="button-tutorial-previous"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < tutorialSteps.length - 1 && (
                <Button 
                  variant="ghost" 
                  onClick={handleSkip}
                  data-testid="button-tutorial-skip"
                >
                  Skip to End
                </Button>
              )}
              
              {currentStep < tutorialSteps.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  data-testid="button-tutorial-next"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={onClose}
                  className="bg-pocket-gold hover:bg-pocket-gold/90 text-black"
                  data-testid="button-tutorial-finish"
                >
                  Get Started!
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}