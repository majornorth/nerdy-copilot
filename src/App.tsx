import React from 'react';
import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { UpcomingLessons } from './components/lessons/UpcomingLessons';
import { AITools } from './components/ai/AITools';
import { AvailabilitySchedule } from './components/availability/AvailabilitySchedule';
import { TutorResources } from './components/resources/TutorResources';
import { IconShowcase } from './components/examples/IconShowcase';
import { CopilotPanel } from './components/copilot/CopilotPanel';
import { CopilotDialog } from './components/copilot/CopilotDialog';
import { useCopilot } from './hooks/useCopilot';
import { useResizable } from './hooks/useResizable';
import { useCopilotStore } from './stores/copilotStore';

function App() {
  const { 
    isOpen: isCopilotOpen, 
    isPoppedOut, 
    openCopilot, 
    closeCopilot, 
    popOut, 
    popIn 
  } = useCopilot();
  const { width: copilotWidth, isResizing, handleMouseDown } = useResizable({
    initialWidth: 478,
    minWidth: 320,
    maxWidth: 800
  });
  
  // Initialize tabs from database on app startup
  const { initializeTabs } = useCopilotStore();
  
  useEffect(() => {
    initializeTabs();
  }, [initializeTabs]);
  
  // Toggle to show icon showcase - set to false for normal app view
  const showIconShowcase = false;

  // Handle pop in - show side panel and close dialog
  const handlePopIn = () => {
    popIn();
    if (!isCopilotOpen) {
      openCopilot();
    }
  };

  // Handle pop out - close side panel and show dialog
  const handlePopOut = () => {
    popOut();
    closeCopilot();
  };

  // Handle close - close both dialog and panel
  const handleClose = () => {
    closeCopilot();
    popIn();
  };
  return (
    <div className="flex h-screen bg-brand-background">
      {/* Main Web App Container */}
      <div 
        className={`flex-1 flex flex-col ${!isResizing ? 'transition-all duration-300' : ''}`}
        style={{ 
          marginRight: (isCopilotOpen && !isPoppedOut) ? `${copilotWidth}px` : '0px'
        }}
      >
        <Header 
          showCopilotButton={!isCopilotOpen && !isPoppedOut}
          onCopilotClick={openCopilot}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {showIconShowcase ? (
              <IconShowcase />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content - Upcoming lessons */}
                <div className="lg:col-span-2">
                  <UpcomingLessons />
                </div>
                
                {/* Sidebar */}
                <div className="space-y-8">
                  <AITools />
                  <AvailabilitySchedule />
                  <TutorResources />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Copilot Side Panel Container */}
      {!isPoppedOut && (
        <div 
          className={`fixed right-0 top-0 h-full z-50 transform ${!isResizing ? 'transition-transform duration-300' : ''} ${
          isCopilotOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
          style={{ width: `${copilotWidth}px` }}
        >
          <CopilotPanel 
            isOpen={isCopilotOpen} 
            onClose={handleClose}
            onPopOut={handlePopOut}
            width={copilotWidth}
            onMouseDown={handleMouseDown}
            isResizing={isResizing}
          />
        </div>
      )}
      
      {/* Copilot Dialog Container */}
      <CopilotDialog
        isOpen={isPoppedOut}
        onClose={handleClose}
        onPopIn={handlePopIn}
      />
    </div>
  );
}

export default App;