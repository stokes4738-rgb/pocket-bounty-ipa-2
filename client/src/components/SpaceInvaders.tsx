import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface Position {
  x: number;
  y: number;
}

interface Bullet extends Position {
  id: number;
}

interface Alien extends Position {
  id: number;
  alive: boolean;
}

interface GameState {
  player: Position;
  bullets: Bullet[];
  aliens: Alien[];
  score: number;
  lives: number;
  gameStatus: "waiting" | "playing" | "gameover" | "victory";
  wave: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const ALIEN_SPEED = 0.5;

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: { x: CANVAS_WIDTH / 2 - 15, y: CANVAS_HEIGHT - 40 },
    bullets: [],
    aliens: [],
    score: 0,
    lives: 3,
    gameStatus: "waiting",
    wave: 1,
  });
  
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("space-invaders-best-score") || "0", 10);
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const bulletIdRef = useRef(0);
  const alienIdRef = useRef(0);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      return apiRequest("POST", "/api/user/points", {
        points,
        reason: `Space Invaders - scored ${gameState.score} points`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Points Earned!",
        description: `You earned ${Math.floor(gameState.score / 10)} points!`,
      });
    },
  });

  const createAliens = useCallback((wave: number) => {
    const aliens: Alien[] = [];
    const rows = Math.min(3 + wave, 6);
    const cols = 8;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        aliens.push({
          id: alienIdRef.current++,
          x: 60 + col * 60,
          y: 50 + row * 40,
          alive: true,
        });
      }
    }
    return aliens;
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      player: { x: CANVAS_WIDTH / 2 - 15, y: CANVAS_HEIGHT - 40 },
      bullets: [],
      aliens: createAliens(1),
      score: 0,
      lives: 3,
      gameStatus: "waiting",
      wave: 1,
    });
  }, [createAliens]);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== "playing") return prev;

      let newState = { ...prev };

      // Move player
      if (keysRef.current['ArrowLeft'] && newState.player.x > 0) {
        newState.player = { ...newState.player, x: newState.player.x - PLAYER_SPEED };
      }
      if (keysRef.current['ArrowRight'] && newState.player.x < CANVAS_WIDTH - 30) {
        newState.player = { ...newState.player, x: newState.player.x + PLAYER_SPEED };
      }

      // Move bullets
      newState.bullets = newState.bullets
        .map(bullet => ({ ...bullet, y: bullet.y - BULLET_SPEED }))
        .filter(bullet => bullet.y > 0);

      // Move aliens
      newState.aliens = newState.aliens.map(alien => ({
        ...alien,
        y: alien.y + ALIEN_SPEED,
      }));

      // Check bullet-alien collisions
      newState.bullets.forEach(bullet => {
        newState.aliens.forEach(alien => {
          if (
            alien.alive &&
            bullet.x > alien.x - 15 &&
            bullet.x < alien.x + 30 &&
            bullet.y > alien.y - 15 &&
            bullet.y < alien.y + 30
          ) {
            alien.alive = false;
            newState.score += 10;
            newState.bullets = newState.bullets.filter(b => b.id !== bullet.id);
          }
        });
      });

      // Check if all aliens defeated
      if (!newState.aliens.some(alien => alien.alive)) {
        newState.wave += 1;
        newState.aliens = createAliens(newState.wave);
        newState.score += 100; // Wave bonus
        toast({
          title: `Wave ${newState.wave - 1} Complete!`,
          description: "+100 bonus points!",
        });
      }

      // Check if aliens reach player
      const aliensReachedPlayer = newState.aliens.some(
        alien => alien.alive && alien.y > CANVAS_HEIGHT - 80
      );

      if (aliensReachedPlayer) {
        newState.lives -= 1;
        if (newState.lives <= 0) {
          newState.gameStatus = "gameover";
        } else {
          // Reset aliens position
          newState.aliens = createAliens(newState.wave);
        }
      }

      return newState;
    });
  }, [createAliens, toast]);

  const shoot = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== "playing") return prev;
      
      const newBullet: Bullet = {
        id: bulletIdRef.current++,
        x: prev.player.x + 15,
        y: prev.player.y,
      };

      return {
        ...prev,
        bullets: [...prev.bullets, newBullet],
      };
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT,
        1, 1
      );
    }

    // Draw player
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(gameState.player.x, gameState.player.y, 30, 20);
    ctx.fillRect(gameState.player.x + 12, gameState.player.y - 10, 6, 10);

    // Draw bullets
    ctx.fillStyle = "#ffff00";
    gameState.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, 2, 8);
    });

    // Draw aliens
    gameState.aliens.forEach(alien => {
      if (alien.alive) {
        ctx.fillStyle = "#ff0040";
        ctx.fillRect(alien.x, alien.y, 25, 20);
        // Eyes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(alien.x + 5, alien.y + 5, 3, 3);
        ctx.fillRect(alien.x + 17, alien.y + 5, 3, 3);
      }
    });

    // Draw UI
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 45);
    ctx.fillText(`Wave: ${gameState.wave}`, 10, 65);
  }, [gameState]);

  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      const interval = setInterval(gameLoop, 1000 / 60);
      return () => clearInterval(interval);
    }
  }, [gameState.gameStatus, gameLoop]);

  useEffect(() => {
    draw();
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState.gameStatus === "gameover") {
      const newBestScore = Math.max(bestScore, gameState.score);
      if (newBestScore > bestScore) {
        setBestScore(newBestScore);
        localStorage.setItem("space-invaders-best-score", newBestScore.toString());
      }
      
      const pointsEarned = Math.floor(gameState.score / 10);
      if (pointsEarned > 0) {
        awardPointsMutation.mutate(pointsEarned);
      }
    }
  }, [gameState.gameStatus, gameState.score, bestScore, awardPointsMutation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ' && gameState.gameStatus === "playing") {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.gameStatus, shoot]);

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStatus: "playing" }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">🚀 Space Invaders</h2>
        <p className="text-sm text-muted-foreground">Defend Earth from alien invasion!</p>
      </div>

      <Card className="theme-transition">
        <CardContent className="p-2">
          <div className="relative bg-gradient-to-b from-blue-900 to-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-80"
              data-testid="canvas-space-invaders"
            />
            
            {gameState.gameStatus !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                <div className="text-center">
                  {gameState.gameStatus === "waiting" && (
                    <>
                      <div className="text-xl mb-2">🚀 Ready for Battle?</div>
                      <div className="text-sm mb-2">Arrow keys to move, Space to shoot</div>
                    </>
                  )}
                  
                  {gameState.gameStatus === "gameover" && (
                    <>
                      <div className="text-xl mb-2">Game Over!</div>
                      <div className="text-sm mb-2">Final Score: {gameState.score}</div>
                      <div className="text-sm mb-2">Reached Wave: {gameState.wave}</div>
                      {gameState.score > bestScore && (
                        <div className="text-xs text-yellow-300 mt-1">New Best Score! 🎉</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="theme-transition">
        <CardContent className="p-3.5 flex justify-between items-center">
          <div className="flex gap-3">
            <Badge variant="outline">Score: {gameState.score}</Badge>
            <Badge variant="outline">Best: {bestScore}</Badge>
            <Badge variant="outline">Wave: {gameState.wave}</Badge>
            <Badge variant="outline">Lives: {gameState.lives}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetGame}>Reset</Button>
            <Button
              onClick={gameState.gameStatus === "waiting" ? startGame : resetGame}
              className="bg-pocket-red hover:bg-pocket-red-dark text-white"
            >
              {gameState.gameStatus === "playing" ? "Reset" : "Play"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-2">How to Play</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Arrow keys to move left and right</li>
            <li>• Spacebar to shoot at aliens</li>
            <li>• Destroy all aliens to advance waves</li>
            <li>• Earn 1 ⭐ for every 10 points scored</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}