import React from 'react';
import { CopilotHeader } from './CopilotHeader';
import { CopilotTab } from './CopilotTab';
import { CopilotBody } from './CopilotBody';
import { CopilotInput } from './CopilotInput';
import { useCopilotStore } from '../../stores/copilotStore';
import { useDraggable } from '../../hooks/useDraggable';

interface CopilotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPopIn: () => void;
}

/**
 * Draggable Copilot dialog component
 * Renders as a floating dialog box over the main application
 */
export const CopilotDialog: React.FC<CopilotDialogProps> = ({ 
  isOpen, 
  onClose,
  onPopIn
}) => {
  const { activeTabId, addMessage, updateTabTitle, currentView } = useCopilotStore();
  
  // Initialize draggable functionality  
  const { position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { 
      x: Math.max(50, window.innerWidth - 650), // Position near right edge
      y: 50 
    }
  });

  if (!isOpen) return null;

  // Check if we should show input (only in chat view)
  const showInput = currentView === 'chat';

  return (
    <div 
      className={`fixed bg-white rounded-lg shadow-2xl z-50 flex flex-col ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{ 
        left: position.x,
        top: position.y,
        width: '600px',
        height: '700px'
      }}
    >
        {/* Draggable Header */}
        <div 
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="h-[85px] w-full flex-shrink-0">
            <div 
              className="h-full w-full relative rounded-t-lg overflow-hidden"
              style={{
                background: "linear-gradient(114.192deg, rgba(219, 0, 255, 0.33) 0%, rgba(255, 46, 0, 0.33) 20%, rgba(173, 0, 255, 0.33) 69.5%, rgba(0, 26, 255, 0.33) 100%)",
                backgroundColor: "black"
              }}
            >
              <div className="grid grid-cols-1 grid-rows-1 h-full w-full">
                <CopilotHeader onClose={onClose} onPopIn={onPopIn} isDialog={true} />
                <CopilotTab />
              </div>
              <div className="absolute border-[#d800ff] border-t-[1.9px] border-solid inset-0 pointer-events-none rounded-t-lg" />
            </div>
          </div>
        </div>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <CopilotBody />
        </div>
        
        {/* Fixed Input */}
        {showInput && (
          <div className="p-4 flex-shrink-0 bg-white border-t border-gray-100 rounded-b-lg">
            <CopilotInput onSubmit={() => {}} />
          </div>
        )}
    </div>
  );
};