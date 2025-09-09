import React from 'react';
import { CopilotHeader } from './CopilotHeader';
import { CopilotTab } from './CopilotTab';
import { CopilotBody } from './CopilotBody';
import { CopilotInput } from './CopilotInput';
import { useCopilotStore } from '../../stores/copilotStore';
import { ResizeHandle } from '../ui/ResizeHandle';

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPopOut: () => void;
  width: number;
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

// Fixed header container with gradient background
function FixedHeader({ 
  onClose, 
  onPopOut, 
  width,
  currentView
}: { 
  onClose: () => void; 
  onPopOut: () => void;
  width: number;
  currentView: string;
}) {
  return (
    <div className="w-full flex-shrink-0">
      <div 
        className="h-full w-full relative"
        style={{
          background: "linear-gradient(114.192deg, rgba(219, 0, 255, 0.33) 0%, rgba(255, 46, 0, 0.33) 20%, rgba(173, 0, 255, 0.33) 69.5%, rgba(0, 26, 255, 0.33) 100%)",
          backgroundColor: "black"
        }}
      >
        <div className="h-full" style={{ width: `${width}px` }}>
          <CopilotHeader onClose={onClose} onPopOut={onPopOut} />
        </div>
        <div className="absolute border-[#d800ff] border-t-[1.9px] border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

// Fixed input container at bottom
function FixedInput({ onSubmit }: { onSubmit: (message: string) => void }) {
  return (
    <div className="p-4 flex-shrink-0 bg-white border-t border-gray-100">
      <CopilotInput onSubmit={onSubmit} />
    </div>
  );
}

// Main copilot side panel component
export const CopilotPanel: React.FC<CopilotPanelProps> = ({ 
  isOpen, 
  onClose,
  onPopOut,
  width,
  onMouseDown,
  isResizing
}) => {
  const { activeTabId, addMessage, updateTabTitle, currentView } = useCopilotStore();

  // Only render if open to avoid unnecessary DOM elements
  if (!isOpen) return null;

  // Check if we should show input (only in chat view)
  const showInput = currentView === 'chat';

  return (
    <div 
      className="bg-white h-screen flex flex-col relative"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <ResizeHandle onMouseDown={onMouseDown} isResizing={isResizing} />
      
      {/* Fixed Header */}
      <FixedHeader onClose={onClose} onPopOut={onPopOut} width={width} currentView={currentView} />
      
      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col overflow-hidden">
          <CopilotBody />
        </div>
      </div>
      
      {/* Fixed Input */}
      {showInput && <FixedInput onSubmit={() => {}} />}
      
      {/* Left border */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-brand-border-light opacity-50 pointer-events-none z-50" />
    </div>
  );
};
