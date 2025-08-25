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

interface Block extends Position {
  color: string;
}

interface Piece {
  blocks: Position[];
  color: string;
  position: Position;
}

interface GameState {
  grid: string[][];
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
  gameStatus: "waiting" | "playing" | "gameover";
  dropTime: number;
}

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 25;

const PIECES = [
  { blocks: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#ffff00" }, // Square
  { blocks: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "#00ffff" }, // Line
  { blocks: [[0, 0], [1, 0], [2, 0], [2, 1]], color: "#ffa500" }, // L
  { blocks: [[0, 0], [1, 0], [2, 0], [0, 1]], color: "#0000ff" }, // J
  { blocks: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#00ff00" }, // S
  { blocks: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]], color: "#800080" }, // T
  { blocks: [[1, 0], [2, 0], [0, 1], [1, 1]], color: "#ff0000" }, // Z
];

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill("")),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    gameStatus: "waiting",
    dropTime: 1000,
  });
  
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("tetris-best-score") || "0", 10);
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      return apiRequest("POST", "/api/user/points", {
        points,
        reason: `Tetris - scored ${gameState.score} points`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Points Earned!",
        description: `You earned ${Math.floor(gameState.score / 25)} points!`,
      });
    },
  });

  const createPiece = useCallback((): Piece => {
    const pieceTemplate = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
      blocks: pieceTemplate.blocks.map(([x, y]) => ({ x, y })),
      color: pieceTemplate.color,
      position: { x: 4, y: 0 },
    };
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill("")),
      currentPiece: createPiece(),
      nextPiece: createPiece(),
      score: 0,
      level: 1,
      lines: 0,
      gameStatus: "waiting",
      dropTime: 1000,
    });
  }, [createPiece]);

  const isValidPosition = useCallback((piece: Piece, grid: string[][]): boolean => {
    return piece.blocks.every(block => {
      const x = piece.position.x + block.x;
      const y = piece.position.y + block.y;
      
      return (
        x >= 0 &&
        x < GRID_WIDTH &&
        y >= 0 &&
        y < GRID_HEIGHT &&
        grid[y][x] === ""
      );
    });
  }, []);

  const rotatePiece = useCallback((piece: Piece): Piece => {
    const rotated = {
      ...piece,
      blocks: piece.blocks.map(block => ({
        x: -block.y,
        y: block.x,
      })),
    };
    return rotated;
  }, []);

  const clearLines = useCallback((grid: string[][]): { newGrid: string[][], clearedLines: number } => {
    const newGrid = [...grid];
    let clearedLines = 0;
    
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (newGrid[y].every(cell => cell !== "")) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(GRID_WIDTH).fill(""));
        clearedLines++;
        y++; // Check the same row again
      }
    }
    
    return { newGrid, clearedLines };
  }, []);

  const placePiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameStatus !== "playing") return prev;

      const newGrid = [...prev.grid];
      
      // Place the piece
      prev.currentPiece.blocks.forEach(block => {
        const x = prev.currentPiece!.position.x + block.x;
        const y = prev.currentPiece!.position.y + block.y;
        if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
          newGrid[y][x] = prev.currentPiece!.color;
        }
      });

      // Clear lines
      const { newGrid: clearedGrid, clearedLines } = clearLines(newGrid);
      
      // Calculate score
      let scoreIncrease = 0;
      if (clearedLines > 0) {
        scoreIncrease = clearedLines * clearedLines * 100 * prev.level;
        toast({
          title: `${clearedLines} Line${clearedLines > 1 ? 's' : ''} Cleared!`,
          description: `+${scoreIncrease} points!`,
        });
      }

      const newLines = prev.lines + clearedLines;
      const newLevel = Math.floor(newLines / 10) + 1;
      const newDropTime = Math.max(50, 1000 - (newLevel - 1) * 50);

      // Check game over
      const nextPiece = prev.nextPiece || createPiece();
      const gameOver = !isValidPosition(nextPiece, clearedGrid);

      return {
        ...prev,
        grid: clearedGrid,
        currentPiece: gameOver ? null : nextPiece,
        nextPiece: gameOver ? null : createPiece(),
        score: prev.score + scoreIncrease + 10, // 10 points for placing a piece
        level: newLevel,
        lines: newLines,
        gameStatus: gameOver ? "gameover" : "playing",
        dropTime: newDropTime,
      };
    });
  }, [clearLines, createPiece, isValidPosition, toast]);

  const movePiece = useCallback((direction: Position) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameStatus !== "playing") return prev;

      const newPiece = {
        ...prev.currentPiece,
        position: {
          x: prev.currentPiece.position.x + direction.x,
          y: prev.currentPiece.position.y + direction.y,
        },
      };

      if (isValidPosition(newPiece, prev.grid)) {
        return { ...prev, currentPiece: newPiece };
      } else if (direction.y > 0) {
        // Can't move down, place the piece
        placePiece();
      }

      return prev;
    });
  }, [isValidPosition, placePiece]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw placed blocks
    gameState.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      });
    });

    // Draw current piece
    if (gameState.currentPiece) {
      ctx.fillStyle = gameState.currentPiece.color;
      gameState.currentPiece.blocks.forEach(block => {
        const x = gameState.currentPiece!.position.x + block.x;
        const y = gameState.currentPiece!.position.y + block.y;
        if (y >= 0) {
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      });
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      const interval = setInterval(() => {
        movePiece({ x: 0, y: 1 });
      }, gameState.dropTime);

      return () => clearInterval(interval);
    }
  }, [gameState.gameStatus, gameState.dropTime, movePiece]);

  useEffect(() => {
    draw();
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState.gameStatus === "gameover") {
      const newBestScore = Math.max(bestScore, gameState.score);
      if (newBestScore > bestScore) {
        setBestScore(newBestScore);
        localStorage.setItem("tetris-best-score", newBestScore.toString());
      }
      
      const pointsEarned = Math.floor(gameState.score / 25);
      if (pointsEarned > 0) {
        awardPointsMutation.mutate(pointsEarned);
      }
    }
  }, [gameState.gameStatus, gameState.score, bestScore, awardPointsMutation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== "playing") return;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          e.stopPropagation();
          movePiece({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          e.stopPropagation();
          movePiece({ x: 1, y: 0 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          e.stopPropagation();
          movePiece({ x: 0, y: 1 });
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          e.stopPropagation();
          setGameState(prev => {
            if (!prev.currentPiece) return prev;
            const rotated = rotatePiece(prev.currentPiece);
            if (isValidPosition(rotated, prev.grid)) {
              return { ...prev, currentPiece: rotated };
            }
            return prev;
          });
          break;
        case " ":
          e.preventDefault();
          e.stopPropagation();
          // Hard drop
          while (gameState.currentPiece) {
            movePiece({ x: 0, y: 1 });
          }
          break;
      }
    };

    if (gameState.gameStatus === "playing") {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
    }
  }, [gameState.gameStatus, gameState.currentPiece, movePiece, rotatePiece, isValidPosition]);

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStatus: "playing" }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">🧩 Tetris</h2>
        <p className="text-sm text-muted-foreground">Clear lines by filling rows completely!</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Card className="theme-transition">
          <CardContent className="p-2">
            <div 
              className="relative bg-black rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-pocket-red"
              tabIndex={0}
              data-testid="game-container-tetris"
            >
              <canvas
                ref={canvasRef}
                width={GRID_WIDTH * CELL_SIZE}
                height={GRID_HEIGHT * CELL_SIZE}
                className="border border-gray-600 cursor-crosshair"
                data-testid="canvas-tetris"
              />
              
              {gameState.gameStatus !== "playing" && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                  <div className="text-center">
                    {gameState.gameStatus === "waiting" && (
                      <>
                        <div className="text-xl mb-2">🧩 Ready to Play Tetris?</div>
                        <div className="text-sm mb-1">Arrow keys to move and rotate</div>
                        <div className="text-sm">Space bar for hard drop</div>
                      </>
                    )}
                    
                    {gameState.gameStatus === "gameover" && (
                      <>
                        <div className="text-xl mb-2">Game Over!</div>
                        <div className="text-sm mb-2">Final Score: {gameState.score}</div>
                        <div className="text-sm mb-2">Level Reached: {gameState.level}</div>
                        <div className="text-sm mb-2">Lines Cleared: {gameState.lines}</div>
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

        {/* Next piece and stats */}
        <div className="space-y-4">
          <Card className="theme-transition">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2">Next</h3>
              <div className="w-16 h-16 bg-black rounded border border-gray-600 flex items-center justify-center">
                {gameState.nextPiece && (
                  <div className="text-xs">Next</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="theme-transition">
            <CardContent className="p-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-bold">{gameState.score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="font-bold">{gameState.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lines:</span>
                  <span className="font-bold">{gameState.lines}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best:</span>
                  <span className="font-bold">{bestScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="theme-transition">
        <CardContent className="p-3.5 flex justify-between items-center">
          <div className="flex gap-3">
            <Badge variant="outline">Score: {gameState.score}</Badge>
            <Badge variant="outline">Level: {gameState.level}</Badge>
            <Badge variant="outline">Lines: {gameState.lines}</Badge>
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
            <li>• Arrow keys to move pieces left/right/down</li>
            <li>• Up arrow to rotate pieces</li>
            <li>• Space bar for instant hard drop</li>
            <li>• Clear full rows to score points</li>
            <li>• Earn 1 ⭐ for every 25 points scored</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}