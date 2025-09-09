import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition?: Position;
  bounds?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
}

export const useDraggable = ({ 
  initialPosition = { x: 100, y: 100 },
  bounds 
}: UseDraggableOptions = {}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<Position>({ x: 0, y: 0 });
  const startMouseRef = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    startPosRef.current = { ...position };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startMouseRef.current.x;
    const deltaY = e.clientY - startMouseRef.current.y;
    
    let newX = startPosRef.current.x + deltaX;
    let newY = startPosRef.current.y + deltaY;

    // Apply bounds if specified
    if (bounds) {
      if (bounds.left !== undefined) newX = Math.max(bounds.left, newX);
      if (bounds.top !== undefined) newY = Math.max(bounds.top, newY);
      if (bounds.right !== undefined) newX = Math.min(bounds.right, newX);
      if (bounds.bottom !== undefined) newY = Math.min(bounds.bottom, newY);
    }

    // Keep dialog within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dialogWidth = 600; // Approximate dialog width
    const dialogHeight = 700; // Approximate dialog height

    newX = Math.max(0, Math.min(viewportWidth - dialogWidth, newX));
    newY = Math.max(0, Math.min(viewportHeight - dialogHeight, newY));

    setPosition({ x: newX, y: newY });
  }, [isDragging, bounds]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
    setPosition
  };
};