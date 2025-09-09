import React from 'react';
import { cn } from '../../utils/cn';
import { useCopilotStore } from '../../stores/copilotStore';

interface Tool {
  id: string;
  title: string;
  description: string;
  type: 'create' | 'generator';
}

interface ToolsPopoverProps {
  onClose: () => void;
  onToolSelect?: (toolId: string) => void;
  className?: string;
}

// Tools data matching the screenshot
const availableTools: Tool[] = [
  {
    id: 'create-new-tool',
    title: 'Create a new tool',
    description: 'Use our custom AI tool builder',
    type: 'create'
  },
  {
    id: 'lesson-plan-generator',
    title: 'Lesson plan generator',
    description: 'Customize an engaging and structured plan for any student and every session in minutes.',
    type: 'generator'
  },
  {
    id: 'practice-problem-generator',
    title: 'Practice problem generator',
    description: 'Tailor practice problems to the subject, question type, and difficulty your students need.',
    type: 'generator'
  }
];

/**
 * Tools popover menu component matching the screenshot design
 * Clean white background with tool options for lesson planning and practice problems
 */
export const ToolsPopover: React.FC<ToolsPopoverProps> = ({
  onClose,
  onToolSelect,
  className
}) => {
  const { setView } = useCopilotStore();
  
  const handleToolSelect = (toolId: string) => {
    // Handle lesson plan generator navigation
    if (toolId === 'lesson-plan-generator') {
      setView('lesson-plan-generator');
      onClose();
      return;
    }
    
    onToolSelect?.(toolId);
    onClose();
  };

  return (
    <div className={cn(
      'w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">
          Select a tool or create your own
        </h3>
      </div>

      {/* Tools List */}
      <div className="py-2">
        {availableTools.map((tool, index) => (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={cn(
              'w-full px-4 py-3 text-left',
              'hover:bg-gray-50 transition-colors duration-150',
              'focus:outline-none focus:bg-gray-50',
              index < availableTools.length - 1 && 'border-b border-gray-50'
            )}
          >
            <div className="space-y-1">
              <div className={cn(
                'text-sm font-medium',
                tool.type === 'create' ? 'text-brand-primary' : 'text-brand-primary'
              )}>
                {tool.title}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                {tool.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};