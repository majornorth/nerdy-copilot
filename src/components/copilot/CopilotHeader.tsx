import React from 'react';
import { 
  BookOpen,
  Chats,
  File,
  Compass,
  Lightbulb,
  Gear,
  ArrowSquareOut,
  ArrowSquareIn,
  X
} from 'phosphor-react';
import { Tooltip } from '../ui/Tooltip';
import { useCopilotStore } from '../../stores/copilotStore';

interface CopilotHeaderProps {
  onClose?: () => void;
  onPopOut?: () => void;
  onPopIn?: () => void;
  isDialog?: boolean;
}

// Copilot header branding component
function CopilotHeaderBrand() {
  return (
    <div className="flex items-center gap-2 relative shrink-0">
      <BookOpen size={20} weight="regular" className="text-white" />
      <div className="font-medium not-italic relative text-white text-sm text-left">
        <p className="block leading-6">Session Prep</p>
      </div>
    </div>
  );
}

// Header action icons group
function HeaderIcons({ 
  onClose, 
  onPopOut, 
  onPopIn, 
  isDialog
}: { 
  onClose?: () => void;
  onPopOut?: () => void;
  onPopIn?: () => void;
  isDialog?: boolean;
}) {
  const { setView, currentView } = useCopilotStore();

  const handleChatHistoryClick = () => {
    if (currentView === 'chat-history') {
      setView('chat');
    } else {
      setView('chat-history');
    }
  };

  const handleCompassClick = () => {
    if (currentView === 'session-briefs') {
      setView('chat');
    } else {
      setView('session-briefs');
    }
  };

  const handleFileClick = () => {
    if (currentView === 'uploads-artifacts') {
      setView('chat');
    } else {
      setView('uploads-artifacts');
    }
  };

  return (
    <div className="relative shrink-0">
      <div className="box-border content-stretch flex flex-row gap-4 items-center justify-end overflow-clip p-0 relative">
        {/* Main action icons */}
        <div className="relative shrink-0">
          <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start overflow-clip p-0 relative">
            <Tooltip content="Session briefs" position="bottom">
              <div>
                <button 
                  onClick={handleCompassClick}
                  className={`p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors ${
                    currentView === 'session-briefs' || currentView === 'session-brief-detail' || currentView === 'lesson-plan-detail' 
                      ? 'bg-white bg-opacity-20' 
                      : ''
                  }`}
                >
                  <Compass size={20} weight="regular" className="text-white" />
                </button>
              </div>
            </Tooltip>
            <Tooltip content="Settings" position="bottom">
              <div>
                <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
                  <Gear size={20} weight="regular" className="text-white" />
                </button>
              </div>
            </Tooltip>
          </div>
        </div>
        
        {/* Vertical separator */}
        <div className="flex h-6 items-center justify-center relative shrink-0 w-0">
          <div className="flex-none rotate-90">
            <div className="h-0 relative w-6">
              <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 24 1"
                >
                  <line
                    stroke="#E3E2E7"
                    x2="24"
                    y1="0.5"
                    y2="0.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Secondary action icons */}
        <div className="relative shrink-0">
          <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start overflow-clip p-0 relative">
            <Tooltip content={isDialog ? "Pop in" : "Pop out"} position="bottom">
              <div>
                <button 
                  onClick={isDialog ? onPopIn : onPopOut}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  {isDialog ? (
                    <ArrowSquareIn size={20} weight="regular" className="text-white" />
                  ) : (
                    <ArrowSquareOut size={20} weight="regular" className="text-white" />
                  )}
                </button>
              </div>
            </Tooltip>
            <Tooltip content="Close" position="bottom">
              <div>
                <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
                  <X size={20} weight="regular" className="text-white" />
                </button>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main header component
export const CopilotHeader: React.FC<CopilotHeaderProps> = ({ 
  onClose, 
  onPopOut, 
  onPopIn, 
  isDialog = false 
}) => {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative w-full h-[52.826px]">
      <div className="flex flex-row items-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-between px-4 py-3 relative w-full h-full">
          <CopilotHeaderBrand />
          <HeaderIcons 
            onClose={onClose} 
            onPopOut={onPopOut}
            onPopIn={onPopIn}
            isDialog={isDialog}
          />
        </div>
      </div>
    </div>
  );
};