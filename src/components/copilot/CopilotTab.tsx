import React from 'react';
import { X, PlusCircle } from 'phosphor-react';
import { useCopilotStore } from '../../stores/copilotStore';

interface CopilotTabProps {
  onClose?: () => void;
}

// Individual tab component
function Tab({ 
  id, 
  title, 
  isActive, 
  onSelect, 
  onClose 
}: { 
  id: string;
  title: string; 
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  return (
    <div 
      className={`relative rounded-t-lg shrink-0 cursor-pointer ${
        isActive 
          ? 'bg-white bg-opacity-10 border border-white border-b-0' 
          : 'hover:bg-white hover:bg-opacity-5'
      }`}
      onClick={onSelect}
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start px-3 py-2 relative min-h-[32px] mt-0">
          <div className="relative shrink-0">
            <div className="box-border content-stretch flex flex-row gap-1 items-center justify-start overflow-clip p-0 relative">
              <div className="font-medium leading-[0] not-italic relative shrink-0 text-white text-xs text-left text-nowrap tracking-[0.4px] max-w-[80px] truncate">
                <p className="adjustLetterSpacing block leading-4 whitespace-pre truncate">
                  {title}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="hover:bg-white hover:bg-opacity-20 rounded p-0.5 transition-colors ml-1"
              >
                <X size={16} weight="regular" className="text-[#E7E0EF] hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add tab button component
function AddTabButton({ onAddTab }: { onAddTab: () => void }) {
  return (
    <div className="relative shrink-0 mr-2">
      <div className="flex flex-row items-center overflow-clip relative">
        <button
          onClick={onAddTab}
          className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
        >
          <PlusCircle size={20} weight="regular" className="text-white hover:text-gray-200" />
        </button>
      </div>
    </div>
  );
}

// Tab navigation component
export const CopilotTab: React.FC<CopilotTabProps> = ({ onClose }) => {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, setView, currentView } = useCopilotStore();

  const handleAddTab = () => {
    addTab();
  };

  const handleRemoveTab = (tabId: string) => {
    removeTab(tabId);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setView('chat'); // Always switch to chat view when selecting a tab
  };

  // Show active tab highlighting only when in chat view
  const shouldHighlightActive = currentView === 'chat';
  
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-[52.826px] relative w-full h-[32.174px] pt-1">
      <div className="box-border content-stretch flex flex-row items-center justify-start overflow-visible pl-2 p-0 relative w-full h-full">
        {/* Add tab button positioned at the left, then tabs */}
        <div className="flex flex-row items-center overflow-x-auto scrollbar-hide">
          {/* Add tab button positioned first (left side) */}
          <AddTabButton onAddTab={handleAddTab} />
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              id={tab.id}
              title={tab.title}
              isActive={shouldHighlightActive && tab.id === activeTabId}
              onSelect={() => handleSelectTab(tab.id)}
              onClose={() => handleRemoveTab(tab.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};