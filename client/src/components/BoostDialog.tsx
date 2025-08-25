import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Clock, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BoostDialogProps {
  bountyId: string;
  userPoints: number;
  onClose: () => void;
}

interface BoostOption {
  level: number;
  points: number;
  hours: number;
  title: string;
  description: string;
  color: string;
}

const boostOptions: BoostOption[] = [
  {
    level: 1,
    points: 2,
    hours: 6,
    title: "Basic Boost",
    description: "2x visibility for 6 hours",
    color: "bg-blue-500"
  },
  {
    level: 2,
    points: 5,
    hours: 12,
    title: "Power Boost",
    description: "3x visibility for 12 hours",
    color: "bg-purple-500"
  },
  {
    level: 3,
    points: 10,
    hours: 24,
    title: "Mega Boost",
    description: "4x visibility for 24 hours",
    color: "bg-orange-500"
  }
];

export default function BoostDialog({ bountyId, userPoints, onClose }: BoostDialogProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const boostMutation = useMutation({
    mutationFn: async (level: number) => {
      return apiRequest("POST", `/api/bounties/boost/${bountyId}`, { boostLevel: level });
    },
    onSuccess: (data) => {
      toast({
        title: "Bounty Boosted! 🚀",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Boost Failed",
        description: error.message || "Failed to boost bounty. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBoost = () => {
    if (selectedLevel) {
      boostMutation.mutate(selectedLevel);
    }
  };

  const selectedOption = boostOptions.find(opt => opt.level === selectedLevel);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Boost Your Bounty
          </DialogTitle>
          <DialogDescription>
            Increase visibility and get more applicants by boosting your bounty to the top of the feed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <span className="text-sm font-medium">Your Points</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-pocket-gold" />
              <span className="font-bold">{userPoints}</span>
            </div>
          </div>

          <div className="space-y-3">
            {boostOptions.map((option) => (
              <button
                key={option.level}
                onClick={() => setSelectedLevel(option.level)}
                disabled={userPoints < option.points}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedLevel === option.level
                    ? "border-pocket-red bg-pocket-red/10"
                    : userPoints < option.points
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                data-testid={`boost-option-${option.level}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {option.title}
                      <Badge className={`${option.color} text-white`}>
                        Level {option.level}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold">
                      <Coins className="h-4 w-4 text-pocket-gold" />
                      {option.points}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {option.hours} hours
                  </span>
                  <span>
                    {option.level + 1}x visibility
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={boostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBoost}
              disabled={!selectedLevel || boostMutation.isPending}
              className="flex-1 bg-pocket-red hover:bg-pocket-red-dark text-white"
              data-testid="button-confirm-boost"
            >
              {boostMutation.isPending ? (
                "Boosting..."
              ) : selectedOption ? (
                `Boost for ${selectedOption.points} Points`
              ) : (
                "Select a Boost"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}