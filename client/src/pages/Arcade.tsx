import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FlappyGame from "./FlappyGame";
import Game2048 from "@/components/Game2048";

export default function Arcade() {
  const [activeGame, setActiveGame] = useState("overview");

  if (activeGame === "flappy") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <FlappyGame />
      </div>
    );
  }

  if (activeGame === "2048") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <Game2048 />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🎮 Arcade</h1>
        <p className="text-sm text-muted-foreground">
          Play games to earn bonus points! Choose your favorite game below.
        </p>
      </div>

      {/* Game Selection */}
      <div className="grid gap-4">
        {/* Flappy Bird */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("flappy")}
          data-testid="card-flappy-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🐤</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Flappy Bounty</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate through pipes and earn points for your high scores!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 10 score
                  </span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Arcade Classic
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2048 */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("2048")}
          data-testid="card-2048-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔢</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">2048</h3>
                <p className="text-sm text-muted-foreground">
                  Combine number tiles to reach 2048 and earn big points!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                    Strategy Game
                  </span>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    Brain Training
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arcade Stats */}
      <Card className="theme-transition">
        <CardContent className="p-4">
          <h3 className="font-bold mb-3">🏆 Your Arcade Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pocket-gold">
                {localStorage.getItem("flappy-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Flappy Best</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pocket-gold">
                {localStorage.getItem("2048-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">2048 Best</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Tips */}
      <Card className="theme-transition">
        <CardContent className="p-4">
          <h3 className="font-bold mb-3">💡 Pro Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• <strong>Flappy Bird:</strong> Tap consistently for smooth flight</div>
            <div>• <strong>2048:</strong> Keep your highest tile in a corner</div>
            <div>• <strong>Points:</strong> Higher scores = more bonus points!</div>
            <div>• <strong>Practice:</strong> Both games improve with regular play</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}