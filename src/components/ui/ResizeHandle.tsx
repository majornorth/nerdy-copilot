import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown, isResizing }) => {
  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize group hover:bg-blue-500 transition-colors ${
        isResizing ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-400'
      }`}
      onMouseDown={onMouseDown}
    >
      {/* Visual indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300 group-hover:bg-blue-500 transition-colors ${
        isResizing ? 'bg-blue-500' : ''
      }`} />
      
      {/* Expanded hover area for easier grabbing */}
      <div className="absolute -left-2 top-0 bottom-0 w-4" />
    </div>
  );
};