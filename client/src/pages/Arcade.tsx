import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FlappyGame from "./FlappyGame";
import Game2048 from "@/components/Game2048";
import SnakeGame from "@/components/SnakeGame";
import SpaceInvaders from "@/components/SpaceInvaders";
import MemoryMatch from "@/components/MemoryMatch";
import Breakout from "@/components/Breakout";
import WhackAMole from "@/components/WhackAMole";
import TetrisGame from "@/components/TetrisGame";
import SimonSays from "@/components/SimonSays";
import ConnectFour from "@/components/ConnectFour";
import AsteroidsGame from "@/components/AsteroidsGame";
import PacManGame from "@/components/PacManGame";
import RacingGame from "@/components/RacingGame";

export default function Arcade() {
  const [activeGame, setActiveGame] = useState("overview");

  if (activeGame === "flappy") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
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
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
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

  if (activeGame === "snake") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <SnakeGame />
      </div>
    );
  }

  if (activeGame === "space-invaders") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <SpaceInvaders />
      </div>
    );
  }

  if (activeGame === "memory-match") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <MemoryMatch />
      </div>
    );
  }

  if (activeGame === "breakout") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <Breakout />
      </div>
    );
  }

  if (activeGame === "whack-a-mole") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <WhackAMole />
      </div>
    );
  }

  if (activeGame === "tetris") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <TetrisGame />
      </div>
    );
  }

  if (activeGame === "simon-says") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <SimonSays />
      </div>
    );
  }

  if (activeGame === "connect-four") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <ConnectFour />
      </div>
    );
  }

  if (activeGame === "asteroids") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <AsteroidsGame />
      </div>
    );
  }

  if (activeGame === "pacman") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <PacManGame />
      </div>
    );
  }

  if (activeGame === "racing") {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={() => setActiveGame("overview")}
            data-testid="button-back-to-arcade"
          >
            ← Back to Arcade
          </Button>
        </div>
        <RacingGame />
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
                    1 point per 5 score
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
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Win: 1 point per 50 score
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

        {/* Snake Game */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("snake")}
          data-testid="card-snake-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🐍</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Snake</h3>
                <p className="text-sm text-muted-foreground">
                  Classic snake game - eat food to grow and avoid hitting yourself!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 3 score
                  </span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Classic Arcade
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Space Invaders */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("space-invaders")}
          data-testid="card-space-invaders-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🚀</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Space Invaders</h3>
                <p className="text-sm text-muted-foreground">
                  Defend Earth from waves of alien invaders!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 10 score
                  </span>
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                    Action Shooter
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Match */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("memory-match")}
          data-testid="card-memory-match-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧠</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Memory Match</h3>
                <p className="text-sm text-muted-foreground">
                  Test your memory by matching pairs of cards!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Points for speed
                  </span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
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

        {/* Breakout */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("breakout")}
          data-testid="card-breakout-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧱</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Breakout</h3>
                <p className="text-sm text-muted-foreground">
                  Break all the bricks with your bouncing ball!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 15 score
                  </span>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                    Skill Game
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Whack-a-Mole */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("whack-a-mole")}
          data-testid="card-whack-a-mole-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔨</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Whack-a-Mole</h3>
                <p className="text-sm text-muted-foreground">
                  Hit the moles as fast as you can for points!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 8 score
                  </span>
                  <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded">
                    Reaction Game
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tetris */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("tetris")}
          data-testid="card-tetris-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧩</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Tetris</h3>
                <p className="text-sm text-muted-foreground">
                  Clear lines by arranging falling blocks perfectly!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 25 score
                  </span>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                    Puzzle Classic
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simon Says */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("simon-says")}
          data-testid="card-simon-says-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎵</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Simon Says</h3>
                <p className="text-sm text-muted-foreground">
                  Repeat the color sequence to test your memory!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 6 score
                  </span>
                  <span className="text-xs bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-1 rounded">
                    Memory Game
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connect Four */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("connect-four")}
          data-testid="card-connect-four-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔴</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Connect Four</h3>
                <p className="text-sm text-muted-foreground">
                  Drop pieces to get four in a row against the AI!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Points for wins
                  </span>
                  <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 px-2 py-1 rounded">
                    Strategy Game
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asteroids */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("asteroids")}
          data-testid="card-asteroids-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🚀</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Asteroids</h3>
                <p className="text-sm text-muted-foreground">
                  Pilot a spaceship and destroy asteroids in space!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 12 score
                  </span>
                  <span className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 px-2 py-1 rounded">
                    Space Shooter
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pac-Man */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("pacman")}
          data-testid="card-pacman-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">👻</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Pac-Man</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate the maze, collect dots, and avoid ghosts!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 18 score
                  </span>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                    Maze Game
                  </span>
                </div>
              </div>
              <div className="text-pocket-gold">
                <span className="text-xl">→</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Racing Game */}
        <Card 
          className="theme-transition cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveGame("racing")}
          data-testid="card-racing-game"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏎️</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Racing</h3>
                <p className="text-sm text-muted-foreground">
                  Drive fast, avoid traffic, and manage your fuel!
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    1 point per 22 score
                  </span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded">
                    Racing Game
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
          <h3 className="font-bold mb-3">🏆 Your Best Scores</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("flappy-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Flappy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("2048-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">2048</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("snake-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Snake</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("space-invaders-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Space</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("memory-match-best-score") === "999" ? "--" : localStorage.getItem("memory-match-best-score") || "--"}
              </div>
              <div className="text-xs text-muted-foreground">Memory</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("breakout-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Breakout</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("whack-a-mole-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Whack</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("tetris-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Tetris</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("simon-says-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Simon</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("connect-four-wins") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Connect4</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("asteroids-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Asteroids</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("pacman-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Pac-Man</div>
            </div>
            <div>
              <div className="text-lg font-bold text-pocket-gold">
                {localStorage.getItem("racing-best-score") || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Racing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Tips */}
      <Card className="theme-transition">
        <CardContent className="p-4">
          <h3 className="font-bold mb-3">💡 Pro Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• <strong>Action Games:</strong> Space Invaders, Asteroids - Stay mobile!</div>
            <div>• <strong>Puzzle Games:</strong> Tetris, 2048 - Think ahead and plan moves</div>
            <div>• <strong>Memory Games:</strong> Simon Says, Memory Match - Focus and concentrate</div>
            <div>• <strong>Classic Games:</strong> Snake, Pac-Man - Learn the patterns</div>
            <div>• <strong>Skill Games:</strong> Breakout, Racing - Practice makes perfect</div>
            <div>• <strong>Points:</strong> All games award ⭐ based on your performance!</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}