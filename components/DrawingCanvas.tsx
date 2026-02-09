'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface DrawingCanvasProps {
  onDrawingComplete: (canvas: HTMLCanvasElement) => void;
  isEnabled: boolean;
  keyboardDrawingEnabled?: boolean;
  isWKeyPressed?: boolean;
  width?: number;
  height?: number;
}

export interface DrawingCanvasRef {
  clear: () => void;
  getCanvas: () => HTMLCanvasElement | null;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
  onDrawingComplete,
  isEnabled,
  keyboardDrawingEnabled = false,
  isWKeyPressed = false,
  width = 400,
  height = 400
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      dprRef.current = dpr;

      // Set canvas internal pixel size for HiDPI screens
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      // Set canvas CSS display size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Reset any existing transforms, then scale to DPR
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        // Set black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Set white stroke for drawing
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 14; // Doubled stroke width for better visibility
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isEnabled || !context) return;

    // If keyboard drawing mode is enabled, require W key to be pressed
    if (keyboardDrawingEnabled && !isWKeyPressed) return;

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) * (canvas.width / rect.width)) / dprRef.current;
    const y = ((clientY - rect.top) * (canvas.height / rect.height)) / dprRef.current;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEnabled || !context) return;

    // If keyboard drawing mode is enabled, require W key to be pressed
    if (keyboardDrawingEnabled && !isWKeyPressed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) * (canvas.width / rect.width)) / dprRef.current;
    const y = ((clientY - rect.top) * (canvas.height / rect.height)) / dprRef.current;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Pass the canvas element when drawing is complete
    const canvas = canvasRef.current;
    if (canvas) {
      onDrawingComplete(canvas);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && context) {
      // Clear and restore black background
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);
      // Restore white stroke
      context.strokeStyle = '#FFFFFF';
    }
  };

  // Expose clearCanvas and getCanvas methods to parent components via ref
  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    getCanvas: () => canvasRef.current
  }));

  // Determine cursor style based on keyboard drawing mode
  const getCursorStyle = () => {
    if (!isEnabled) return 'cursor-not-allowed';
    if (keyboardDrawingEnabled && !isWKeyPressed) return 'cursor-not-allowed';
    return 'cursor-crosshair';
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas
        ref={canvasRef}
        className={`border-4 border-slate-300 rounded-lg bg-black ${getCursorStyle()} touch-none max-w-full`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
