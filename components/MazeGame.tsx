'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

interface MazeGameProps {
  size?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: () => void;
}

export default function MazeGame({ size = 10, difficulty = 'easy', onComplete }: MazeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState<{x: number, y: number}[]>([]);
  const [currentPos, setCurrentPos] = useState<{x: number, y: number} | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [startPos] = useState({x: 0, y: 0});
  const [endPos, setEndPos] = useState({x: size - 1, y: size - 1});
  const [cellSize, setCellSize] = useState(40);

  // Generate maze using recursive backtracking
  const generateMaze = useCallback(() => {
    const newMaze: Cell[][] = [];

    // Initialize grid
    for (let y = 0; y < size; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < size; x++) {
        row.push({
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        });
      }
      newMaze.push(row);
    }

    // Recursive backtracking algorithm
    const stack: Cell[] = [];
    const current = newMaze[0][0];
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
      const cell = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(cell, newMaze);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWall(cell, next, newMaze);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Reset visited for gameplay
    newMaze.forEach(row => row.forEach(cell => cell.visited = false));

    setEndPos({x: size - 1, y: size - 1});
    setMaze(newMaze);
  }, [size]);

  const getUnvisitedNeighbors = (cell: Cell, maze: Cell[][]) => {
    const neighbors: Cell[] = [];
    const { x, y } = cell;

    if (y > 0 && !maze[y - 1][x].visited) neighbors.push(maze[y - 1][x]);
    if (x < size - 1 && !maze[y][x + 1].visited) neighbors.push(maze[y][x + 1]);
    if (y < size - 1 && !maze[y + 1][x].visited) neighbors.push(maze[y + 1][x]);
    if (x > 0 && !maze[y][x - 1].visited) neighbors.push(maze[y][x - 1]);

    return neighbors;
  };

  const removeWall = (current: Cell, next: Cell, maze: Cell[][]) => {
    const dx = current.x - next.x;
    const dy = current.y - next.y;

    if (dx === 1) {
      maze[current.y][current.x].walls.left = false;
      maze[next.y][next.x].walls.right = false;
    } else if (dx === -1) {
      maze[current.y][current.x].walls.right = false;
      maze[next.y][next.x].walls.left = false;
    } else if (dy === 1) {
      maze[current.y][current.x].walls.top = false;
      maze[next.y][next.x].walls.bottom = false;
    } else if (dy === -1) {
      maze[current.y][current.x].walls.bottom = false;
      maze[next.y][next.x].walls.top = false;
    }
  };

  // Draw the maze
  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze walls
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;

    maze.forEach(row => {
      row.forEach(cell => {
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;

        ctx.beginPath();
        if (cell.walls.top) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
        }
        if (cell.walls.right) {
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls.bottom) {
          ctx.moveTo(x + cellSize, y + cellSize);
          ctx.lineTo(x, y + cellSize);
        }
        if (cell.walls.left) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
        }
        ctx.stroke();
      });
    });

    // Draw start point
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(startPos.x * cellSize + cellSize / 2, startPos.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startPos.x * cellSize + cellSize / 2, startPos.y * cellSize + cellSize / 2);

    // Draw end point
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(endPos.x * cellSize + cellSize / 2, endPos.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('E', endPos.x * cellSize + cellSize / 2, endPos.y * cellSize + cellSize / 2);

    // Draw path
    if (path.length > 0) {
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(path[0].x * cellSize + cellSize / 2, path[0].y * cellSize + cellSize / 2);

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * cellSize + cellSize / 2, path[i].y * cellSize + cellSize / 2);
      }
      ctx.stroke();
    }
  }, [maze, path, cellSize, startPos, endPos]);

  // Check if move is valid (no wall crossing)
  const canMove = (from: {x: number, y: number}, to: {x: number, y: number}) => {
    if (to.x < 0 || to.x >= size || to.y < 0 || to.y >= size) return false;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) + Math.abs(dy) !== 1) return false;

    const fromCell = maze[from.y]?.[from.x];
    if (!fromCell) return false;

    if (dx === 1) return !fromCell.walls.right;
    if (dx === -1) return !fromCell.walls.left;
    if (dy === 1) return !fromCell.walls.bottom;
    if (dy === -1) return !fromCell.walls.top;

    return false;
  };

  // Handle mouse/touch events
  const getGridPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);

    return { x, y };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getGridPosition(e);
    if (!pos) return;

    // Check if starting at the start position
    if (pos.x === startPos.x && pos.y === startPos.y) {
      setIsDrawing(true);
      setPath([pos]);
      setCurrentPos(pos);
      setIsComplete(false);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const pos = getGridPosition(e);
    if (!pos || !currentPos) return;

    // Check if it's a valid move
    if (canMove(currentPos, pos)) {
      // Check if we're backtracking
      const prevIndex = path.findIndex(p => p.x === pos.x && p.y === pos.y);
      if (prevIndex !== -1) {
        // Backtracking - remove path after this point
        setPath(path.slice(0, prevIndex + 1));
      } else {
        // Moving forward
        setPath([...path, pos]);
      }
      setCurrentPos(pos);

      // Check if reached the end
      if (pos.x === endPos.x && pos.y === endPos.y) {
        setIsComplete(true);
        setIsDrawing(false);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const resetMaze = () => {
    setPath([]);
    setCurrentPos(null);
    setIsComplete(false);
    setIsDrawing(false);
  };

  // Initialize maze on mount
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  // Draw whenever maze or path changes
  useEffect(() => {
    drawMaze();
  }, [drawMaze]);

  // Set cell size based on screen size
  useEffect(() => {
    const updateCellSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const minDimension = Math.min(screenWidth - 40, screenHeight - 200);
      setCellSize(Math.floor(minDimension / size));
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [size]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-[#5D4037] mb-2">Maze Puzzle</h2>
        <p className="text-[#8D6E63]">Draw a path from S (Start) to E (End) without lifting your finger!</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size * cellSize}
          height={size * cellSize}
          className="border-4 border-[#8D6E63] rounded-lg bg-[#FFF9F0] cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="bg-white p-6 rounded-2xl text-center">
              <div className="text-6xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-emerald-600">Maze Solved!</h3>
              <p className="text-gray-600 mt-2">Great job!</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={resetMaze}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
        >
          Clear Path
        </button>
        <button
          onClick={generateMaze}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          New Maze
        </button>
      </div>
    </div>
  );
}