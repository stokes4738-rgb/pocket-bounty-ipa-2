import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

type Board = number[][];

interface GameStats {
  score: number;
  bestScore: number;
  moves: number;
}

const BOARD_SIZE = 4;
const WIN_TILE = 2048;

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    bestScore: parseInt(localStorage.getItem("2048-best-score") || "0", 10),
    moves: 0,
  });
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: async (points: number) => {
      return apiRequest("POST", "/api/user/points", {
        points,
        reason: `2048 game - scored ${gameStats.score} points`,
      });
    },
    onSuccess: (_, points) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Points Earned!",
        description: `You earned ${points} points from your 2048 game!`,
      });
    },
  });

  function initializeBoard(): Board {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  function addRandomTile(board: Board): Board {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
    
    return board;
  }

  function moveLeft(board: Board): { newBoard: Board; scoreGain: number; moved: boolean } {
    let scoreGain = 0;
    let moved = false;
    const newBoard = board.map(row => {
      const filteredRow = row.filter(cell => cell !== 0);
      const mergedRow = [];
      let i = 0;
      
      while (i < filteredRow.length) {
        if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
          const mergedValue = filteredRow[i] * 2;
          mergedRow.push(mergedValue);
          scoreGain += mergedValue;
          i += 2;
        } else {
          mergedRow.push(filteredRow[i]);
          i++;
        }
      }
      
      const finalRow = [...mergedRow, ...Array(BOARD_SIZE - mergedRow.length).fill(0)];
      
      if (JSON.stringify(row) !== JSON.stringify(finalRow)) {
        moved = true;
      }
      
      return finalRow;
    });
    
    return { newBoard, scoreGain, moved };
  }

  function rotateBoard(board: Board): Board {
    return board[0].map((_, i) => board.map(row => row[i]).reverse());
  }

  function move(direction: 'left' | 'right' | 'up' | 'down'): void {
    let currentBoard = [...board.map(row => [...row])];
    let rotations = 0;
    
    switch (direction) {
      case 'right':
        rotations = 2;
        break;
      case 'up':
        rotations = 3;
        break;
      case 'down':
        rotations = 1;
        break;
    }
    
    for (let i = 0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard);
    }
    
    const { newBoard, scoreGain, moved } = moveLeft(currentBoard);
    
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      currentBoard = rotateBoard(newBoard);
    }
    
    if (moved) {
      addRandomTile(currentBoard);
      setBoard(currentBoard);
      setGameStats(prev => ({
        ...prev,
        score: prev.score + scoreGain,
        moves: prev.moves + 1,
      }));
      setAnimationKey(prev => prev + 1);
      
      // Check for win condition
      if (!gameWon && currentBoard.some(row => row.some(cell => cell >= WIN_TILE))) {
        setGameWon(true);
        const finalScore = gameStats.score + scoreGain;
        const pointsEarned = Math.floor(finalScore / 50); // Better reward for winning
        if (pointsEarned > 0) {
          awardPointsMutation.mutate(pointsEarned);
        }
        toast({
          title: "🎉 You Won!",
          description: `You reached 2048! Earned ${pointsEarned} points! Keep playing for more.`,
        });
      }
      
      // Check for game over
      if (isGameOver(currentBoard)) {
        setGameOver(true);
        const finalScore = gameStats.score + scoreGain;
        const pointsEarned = Math.floor(finalScore / 100); // Still decent points for trying
        if (pointsEarned > 0) {
          awardPointsMutation.mutate(pointsEarned);
        }
        toast({
          title: "Game Over",
          description: `Final score: ${finalScore}. You earned ${pointsEarned} points!`,
        });
      }
    }
  }

  function isGameOver(board: Board): boolean {
    // Check for empty cells
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    
    // Check for possible merges
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const current = board[i][j];
        if (
          (i < BOARD_SIZE - 1 && board[i + 1][j] === current) ||
          (j < BOARD_SIZE - 1 && board[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }
    
    return true;
  }

  function resetGame() {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setGameStats(prev => ({
      score: 0,
      bestScore: Math.max(prev.bestScore, prev.score),
      moves: 0,
    }));
    setGameWon(false);
    setGameOver(false);
    setAnimationKey(0);
  }

  // Save best score to localStorage
  useEffect(() => {
    if (gameStats.score > gameStats.bestScore) {
      localStorage.setItem("2048-best-score", gameStats.score.toString());
    }
  }, [gameStats.score, gameStats.bestScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  function getTileColor(value: number): string {
    const colors: Record<number, string> = {
      2: "bg-slate-100 text-slate-800",
      4: "bg-slate-200 text-slate-800",
      8: "bg-orange-200 text-orange-800",
      16: "bg-orange-300 text-orange-900",
      32: "bg-orange-400 text-white",
      64: "bg-orange-500 text-white",
      128: "bg-yellow-300 text-yellow-900",
      256: "bg-yellow-400 text-yellow-900",
      512: "bg-yellow-500 text-white",
      1024: "bg-red-400 text-white",
      2048: "bg-red-500 text-white",
    };
    
    return colors[value] || "bg-red-600 text-white";
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">🔢 2048</h2>
        <p className="text-sm text-muted-foreground">
          Combine tiles to reach 2048! Use arrow keys or swipe.
        </p>
      </div>

      {/* Game Stats */}
      <Card className="theme-transition">
        <CardContent className="p-3 flex justify-between items-center">
          <div className="flex gap-3">
            <Badge variant="outline" data-testid="badge-2048-score">
              Score: <span className="font-bold">{gameStats.score}</span>
            </Badge>
            <Badge variant="outline" data-testid="badge-2048-best">
              Best: <span className="font-bold">{gameStats.bestScore}</span>
            </Badge>
            <Badge variant="outline" data-testid="badge-2048-moves">
              Moves: <span className="font-bold">{gameStats.moves}</span>
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetGame}
            data-testid="button-2048-reset"
          >
            New Game
          </Button>
        </CardContent>
      </Card>

      {/* Game Board */}
      <Card className="theme-transition">
        <CardContent className="p-4">
          <div 
            className="grid grid-cols-4 gap-2 bg-slate-300 dark:bg-slate-700 p-2 rounded-lg max-w-80 mx-auto"
            data-testid="board-2048"
            key={animationKey}
          >
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`
                    w-16 h-16 rounded flex items-center justify-center font-bold text-sm
                    transition-all duration-150 ease-in-out
                    ${cell === 0 
                      ? "bg-slate-200 dark:bg-slate-600" 
                      : `${getTileColor(cell)} transform scale-105`
                    }
                  `}
                  data-testid={`tile-${i}-${j}`}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>

          {/* Touch Controls for Mobile */}
          <div className="grid grid-cols-3 gap-2 mt-4 max-w-48 mx-auto">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onPointerDown={() => move('up')}
              data-testid="button-2048-up"
            >
              ↑
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onPointerDown={() => move('left')}
              data-testid="button-2048-left"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPointerDown={() => move('down')}
              data-testid="button-2048-down"
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPointerDown={() => move('right')}
              data-testid="button-2048-right"
            >
              →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Status */}
      {(gameWon || gameOver) && (
        <Card className="theme-transition border-pocket-gold">
          <CardContent className="p-4 text-center">
            {gameWon && !gameOver && (
              <div className="space-y-2">
                <div className="text-xl font-bold text-pocket-gold">🎉 You Won!</div>
                <div className="text-sm text-muted-foreground">
                  You reached 2048! Continue playing for a higher score.
                </div>
              </div>
            )}
            {gameOver && (
              <div className="space-y-2">
                <div className="text-xl font-bold text-red-500">Game Over!</div>
                <div className="text-sm text-muted-foreground">
                  Final Score: {gameStats.score}
                </div>
                <Button
                  onClick={resetGame}
                  className="mt-2"
                  data-testid="button-2048-play-again"
                >
                  Play Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="theme-transition">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div><strong>HOW TO PLAY:</strong> Use arrow keys to move tiles.</div>
            <div>When two tiles with the same number touch, they merge into one!</div>
            <div><strong>POINTS:</strong> Win = 1 point per 50 score, Game Over = 1 point per 100 score</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}