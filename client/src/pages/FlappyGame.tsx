import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface GameState {
  bird: { x: number; y: number; velocity: number };
  pipes: Array<{ x: number; topHeight: number; bottomY: number; bottomHeight: number; scored: boolean }>;
  score: number;
  gameStatus: "waiting" | "playing" | "gameover";
}

const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 40; // Made wider for larger canvas
const PIPE_GAP = 100; // Made larger gap
const PIPE_SPEED = 2;

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    bird: { x: 80, y: 175, velocity: 0 }, // Adjusted for larger canvas
    pipes: [],
    score: 0,
    gameStatus: "waiting",
  });
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("flappy-best-score") || "0", 10);
  });
  const [devMode, setDevMode] = useState(false);
  const [cloudOffset, setCloudOffset] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      return apiRequest("POST", "/api/user/points", {
        points,
        reason: `Flappy Bird game - scored ${gameState.score} points`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Points Earned!",
        description: `You earned ${Math.floor(gameState.score / 10)} points for your score!`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const resetGame = useCallback(() => {
    setGameState({
      bird: { x: 80, y: 175, velocity: 0 }, // Adjusted for larger canvas
      pipes: [],
      score: 0,
      gameStatus: "waiting",
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: "playing",
      bird: { ...prev.bird, velocity: FLAP_STRENGTH },
    }));
  }, []);

  const flap = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      bird: { ...prev.bird, velocity: FLAP_STRENGTH },
    }));
  }, []);

  const gameOver = useCallback(() => {
    setGameState(prev => {
      const newBestScore = Math.max(bestScore, prev.score);
      if (newBestScore > bestScore) {
        setBestScore(newBestScore);
        localStorage.setItem("flappy-best-score", newBestScore.toString());
      }
      
      // Award points (1 point per 10 score points)
      const pointsEarned = Math.floor(prev.score / 10);
      if (pointsEarned > 0) {
        awardPointsMutation.mutate(pointsEarned);
      }
      
      return { ...prev, gameStatus: "gameover" };
    });
  }, [bestScore, awardPointsMutation]);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== "playing") return prev;

      const newState = { ...prev };
      
      // Update bird physics
      newState.bird = {
        ...prev.bird,
        velocity: prev.bird.velocity + GRAVITY,
        y: prev.bird.y + prev.bird.velocity,
      };

      // Generate pipes (adjusted for larger canvas)
      if (newState.pipes.length === 0 || newState.pipes[newState.pipes.length - 1].x < 400 - 200) {
        const pipeHeight = Math.random() * (350 - PIPE_GAP - 60) + 30;
        newState.pipes.push({
          x: 400,
          topHeight: pipeHeight,
          bottomY: pipeHeight + PIPE_GAP,
          bottomHeight: 350 - pipeHeight - PIPE_GAP,
          scored: false,
        });
      }

      // Update pipes
      newState.pipes = newState.pipes
        .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter(pipe => pipe.x > -PIPE_WIDTH);

      // Score
      newState.pipes.forEach(pipe => {
        if (!pipe.scored && pipe.x + PIPE_WIDTH < newState.bird.x) {
          pipe.scored = true;
          newState.score++;
        }
      });

      // Collision detection (adjusted for larger canvas)
      if (newState.bird.y < 0 || newState.bird.y > 350 - 20) {
        return { ...newState, gameStatus: "gameover" };
      }

      // Pipe collision
      for (const pipe of newState.pipes) {
        if (
          newState.bird.x + 20 > pipe.x &&
          newState.bird.x < pipe.x + PIPE_WIDTH &&
          (newState.bird.y < pipe.topHeight || newState.bird.y + 20 > pipe.bottomY)
        ) {
          return { ...newState, gameStatus: "gameover" };
        }
      }

      return newState;
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#87CEFA");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated clouds
    ctx.fillStyle = "#ffffff";
    const numClouds = 5;
    for (let i = 0; i < numClouds; i++) {
      const x = (i * 80 + cloudOffset) % (canvas.width + 60) - 30;
      const y = 20 + (i % 3) * 25;
      
      // Cloud made of circles
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.arc(x + 12, y, 16, 0, Math.PI * 2);
      ctx.arc(x + 24, y, 12, 0, Math.PI * 2);
      ctx.arc(x + 6, y - 8, 10, 0, Math.PI * 2);
      ctx.arc(x + 18, y - 8, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Mario-style pipes
    gameState.pipes.forEach(pipe => {
      // Pipe body (green)
      ctx.fillStyle = "#228B22";
      
      // Top pipe body
      ctx.fillRect(pipe.x + 2, 0, PIPE_WIDTH - 4, pipe.topHeight - 8);
      // Top pipe cap
      ctx.fillStyle = "#32CD32";
      ctx.fillRect(pipe.x, pipe.topHeight - 8, PIPE_WIDTH, 8);
      
      // Pipe highlight
      ctx.fillStyle = "#90EE90";
      ctx.fillRect(pipe.x + 3, 0, 3, pipe.topHeight - 8);
      ctx.fillRect(pipe.x + 1, pipe.topHeight - 8, 3, 8);
      
      // Bottom pipe body
      ctx.fillStyle = "#228B22";
      ctx.fillRect(pipe.x + 2, pipe.bottomY + 8, PIPE_WIDTH - 4, pipe.bottomHeight - 8);
      // Bottom pipe cap
      ctx.fillStyle = "#32CD32";
      ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, 8);
      
      // Pipe highlight
      ctx.fillStyle = "#90EE90";
      ctx.fillRect(pipe.x + 3, pipe.bottomY + 8, 3, pipe.bottomHeight - 8);
      ctx.fillRect(pipe.x + 1, pipe.bottomY, 3, 8);
    });

    // Draw cartoon bird
    const birdX = gameState.bird.x;
    const birdY = gameState.bird.y;
    
    // Bird body (yellow circle)
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(birdX + 10, birdY + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird wing (orange)
    ctx.fillStyle = "#FF8C00";
    ctx.beginPath();
    ctx.ellipse(birdX + 6, birdY + 8, 6, 4, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak (orange)
    ctx.fillStyle = "#FF4500";
    ctx.beginPath();
    ctx.moveTo(birdX + 18, birdY + 10);
    ctx.lineTo(birdX + 22, birdY + 8);
    ctx.lineTo(birdX + 18, birdY + 12);
    ctx.fill();
    
    // Bird eye (white circle with black pupil)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(birdX + 12, birdY + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(birdX + 13, birdY + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw score with shadow
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(gameState.score.toString(), canvas.width / 2 + 2, 32);
    
    ctx.fillStyle = "#ffffff";
    ctx.fillText(gameState.score.toString(), canvas.width / 2, 30);

    // Dev mode overlays
    if (devMode) {
      // Bird hitbox
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2;
      ctx.strokeRect(gameState.bird.x, gameState.bird.y, 20, 20);
      
      // Pipe hitboxes
      ctx.strokeStyle = "#00ff00";
      gameState.pipes.forEach(pipe => {
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, pipe.bottomY, PIPE_WIDTH, pipe.bottomHeight);
      });
      
      // Debug info
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`Bird Y: ${Math.round(gameState.bird.y)}`, 5, 20);
      ctx.fillText(`Velocity: ${Math.round(gameState.bird.velocity * 10) / 10}`, 5, 35);
      ctx.fillText(`Pipes: ${gameState.pipes.length}`, 5, 50);
    }
  }, [gameState, cloudOffset, devMode]);

  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      const interval = setInterval(() => {
        gameLoop();
        setCloudOffset(prev => (prev + 0.2) % 400); // Animate clouds
      }, 1000 / 60); // 60 FPS

      return () => clearInterval(interval);
    }
  }, [gameState.gameStatus, gameLoop]);

  useEffect(() => {
    draw();
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState.gameStatus === "gameover") {
      gameOver();
    }
  }, [gameState.gameStatus, gameOver]);

  const handleCanvasClick = () => {
    if (gameState.gameStatus === "waiting") {
      startGame();
    } else if (gameState.gameStatus === "playing") {
      flap();
    } else if (gameState.gameStatus === "gameover") {
      resetGame();
    }
  };

  const mockLeaderboard = [
    { name: "Sarah Writer", score: 156 },
    { name: "Mike Tester", score: 142 },
    { name: "Jane Designer", score: 138 },
    { name: "You", score: bestScore, isCurrentUser: true },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">🐤 Flappy Bounty</h2>
        <p className="text-sm text-muted-foreground">Play to earn bonus points!</p>
      </div>

      {/* Game Canvas - Made larger */}
      <Card className="theme-transition">
        <CardContent className="p-2">
          <div className="relative w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={350}
              className="w-full h-80 cursor-pointer"
              onClick={handleCanvasClick}
              data-testid="canvas-flappy-game"
            />
            
            {/* Game Overlay */}
            {gameState.gameStatus !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/30">
                <div className="text-center">
                  {gameState.gameStatus === "waiting" && (
                    <>
                      <div className="text-xl mb-2">🐤 Tap to Play</div>
                      <div className="text-sm">Score: {gameState.score}</div>
                    </>
                  )}
                  
                  {gameState.gameStatus === "gameover" && (
                    <>
                      <div className="text-xl mb-2">Game Over!</div>
                      <div className="text-sm mb-2">Score: {gameState.score}</div>
                      <div className="text-xs">Tap to play again</div>
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

      {/* Game Controls */}
      <Card className="theme-transition">
        <CardContent className="p-3.5 flex justify-between items-center">
          <div className="flex gap-3">
            <Badge variant="outline" data-testid="badge-current-score">
              Score: <span className="font-bold">{gameState.score}</span>
            </Badge>
            <Badge variant="outline" data-testid="badge-best-score">
              Best: <span className="font-bold">{bestScore}</span>
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetGame}
              data-testid="button-reset-game"
            >
              Reset
            </Button>
            <Button
              variant={devMode ? "default" : "outline"}
              onClick={() => setDevMode(!devMode)}
              size="sm"
              data-testid="button-dev-mode"
            >
              🛠️ Dev
            </Button>
            <Button
              onClick={gameState.gameStatus === "waiting" ? startGame : handleCanvasClick}
              className="bg-pocket-red hover:bg-pocket-red-dark text-white"
              data-testid="button-play-game"
            >
              {gameState.gameStatus === "playing" ? "Flap" : "Play"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dev Menu */}
      {devMode && (
        <Card className="theme-transition border-orange-500">
          <CardContent className="p-3.5">
            <h3 className="text-sm font-semibold mb-3 text-orange-500">🛠️ Developer Menu</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div><strong>Bird Position:</strong></div>
                <div>X: {Math.round(gameState.bird.x)}</div>
                <div>Y: {Math.round(gameState.bird.y)}</div>
                <div>Velocity: {Math.round(gameState.bird.velocity * 10) / 10}</div>
              </div>
              <div className="space-y-1">
                <div><strong>Game State:</strong></div>
                <div>Status: {gameState.gameStatus}</div>
                <div>Pipes: {gameState.pipes.length}</div>
                <div>Cloud Offset: {Math.round(cloudOffset)}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState(prev => ({
                  ...prev,
                  bird: { ...prev.bird, y: prev.bird.y - 50 }
                }))}
                data-testid="button-dev-bird-up"
              >
                ⬆️ Bird Up
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState(prev => ({
                  ...prev,
                  bird: { ...prev.bird, y: prev.bird.y + 50 }
                }))}
                data-testid="button-dev-bird-down"
              >
                ⬇️ Bird Down
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState(prev => ({
                  ...prev,
                  score: prev.score + 10
                }))}
                data-testid="button-dev-add-score"
              >
                +10 Score
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState(prev => ({
                  ...prev,
                  pipes: []
                }))}
                data-testid="button-dev-clear-pipes"
              >
                Clear Pipes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-3">Leaderboard</h3>
          <div className="space-y-2">
            {mockLeaderboard.map((player, index) => (
              <div
                key={`${player.name}-${index}`}
                className={`flex justify-between items-center ${
                  player.isCurrentUser ? "bg-pocket-red/20 p-2 rounded-lg" : ""
                }`}
                data-testid={`leaderboard-${index}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && `${index + 1}th`}
                  </span>
                  <span className={`text-sm ${player.isCurrentUser ? "font-bold" : ""}`}>
                    {player.name}
                  </span>
                </div>
                <span className={`text-sm ${player.isCurrentUser ? "text-pocket-gold font-bold" : "text-muted-foreground"}`}>
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="theme-transition">
        <CardContent className="p-3.5">
          <h3 className="text-sm font-semibold mb-2">How to Play</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Tap anywhere to make the bird flap</li>
            <li>• Avoid hitting the pipes or ground</li>
            <li>• Earn 1 ⭐ for every 10 points scored</li>
            <li>• Beat your best score to climb the leaderboard!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
