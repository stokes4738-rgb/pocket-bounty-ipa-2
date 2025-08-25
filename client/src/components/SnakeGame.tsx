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

interface GameState {
  snake: Position[];
  food: Position;
  direction: Position;
  score: number;
  gameStatus: "waiting" | "playing" | "gameover";
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 0, y: 0 },
    score: 0,
    gameStatus: "waiting",
  });
  
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("snake-best-score") || "0", 10);
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      return apiRequest("POST", "/api/user/points", {
        points,
        reason: `Snake game - scored ${gameState.score} points`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Points Earned!",
        description: `You earned ${Math.floor(gameState.score / 3)} points!`,
      });
    },
  });

  const generateFood = useCallback((snake: Position[]): Position => {
    const maxPos = CANVAS_SIZE / GRID_SIZE - 1;
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * maxPos),
        y: Math.floor(Math.random() * maxPos),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setGameState({
      snake: initialSnake,
      food: generateFood(initialSnake),
      direction: { x: 0, y: 0 },
      score: 0,
      gameStatus: "waiting",
    });
  }, [generateFood]);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== "playing") return prev;

      const newSnake = [...prev.snake];
      const head = { ...newSnake[0] };
      
      head.x += prev.direction.x;
      head.y += prev.direction.y;

      // Check wall collision
      const maxPos = CANVAS_SIZE / GRID_SIZE - 1;
      if (head.x < 0 || head.x > maxPos || head.y < 0 || head.y > maxPos) {
        return { ...prev, gameStatus: "gameover" };
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prev, gameStatus: "gameover" };
      }

      newSnake.unshift(head);

      let newFood: Position = prev.food;
      let newScore = prev.score;

      // Check food collision
      if (head.x === prev.food.x && head.y === prev.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
      };
    });
  }, [generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = "#4ade80";
    gameState.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#22c55e" : "#4ade80";
      ctx.fillRect(
        segment.x * GRID_SIZE,
        segment.y * GRID_SIZE,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
      gameState.food.x * GRID_SIZE,
      gameState.food.y * GRID_SIZE,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      const interval = setInterval(gameLoop, 150);
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
        localStorage.setItem("snake-best-score", newBestScore.toString());
      }
      
      const pointsEarned = Math.floor(gameState.score / 3);
      if (pointsEarned > 0) {
        awardPointsMutation.mutate(pointsEarned);
      }
    }
  }, [gameState.gameStatus, gameState.score, bestScore, awardPointsMutation]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== "playing") return;
      
      const keyDirections: { [key: string]: Position } = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      const newDirection = keyDirections[e.key];
      if (newDirection) {
        e.preventDefault();
        setGameState(prev => {
          // Prevent reverse direction
          if (newDirection.x === -prev.direction.x && newDirection.y === -prev.direction.y) {
            return prev;
          }
          return { ...prev, direction: newDirection };
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.gameStatus, gameState.direction]);

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStatus: "playing", direction: { x: 1, y: 0 } }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">🐍 Snake Game</h2>
        <p className="text-sm text-muted-foreground">Eat the red food to grow and earn points!</p>
      </div>

      <Card className="theme-transition">
        <CardContent className="p-2">
          <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="w-full h-96"
              data-testid="canvas-snake-game"
            />
            
            {gameState.gameStatus !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                <div className="text-center">
                  {gameState.gameStatus === "waiting" && (
                    <>
                      <div className="text-xl mb-2">🐍 Ready to Play?</div>
                      <div className="text-sm mb-2">Use arrow keys to move</div>
                    </>
                  )}
                  
                  {gameState.gameStatus === "gameover" && (
                    <>
                      <div className="text-xl mb-2">Game Over!</div>
                      <div className="text-sm mb-2">Score: {gameState.score}</div>
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
            <Badge variant="outline">Length: {gameState.snake.length}</Badge>
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
            <li>• Use arrow keys to control the snake</li>
            <li>• Eat red food to grow and score points</li>
            <li>• Avoid walls and your own tail</li>
            <li>• Earn 1 ⭐ for every 3 points scored</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}