import React from 'react';
import { FileText, Brain, Lightbulb, Target } from 'phosphor-react';
import { Card } from '../ui/Card';
import { AITool } from '../../types';
import { useCopilotStore } from '../../stores/copilotStore';

interface AIToolCardProps {
  tool: AITool;
}

const iconMap = {
  FileText: FileText,
  Brain: Brain,
  Lightbulb: Lightbulb,
  Target: Target
};

export const AIToolCard: React.FC<AIToolCardProps> = ({ tool }) => {
  const { setView } = useCopilotStore();
  const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || FileText;
  
  const handleClick = () => {
    if (tool.id === '1' || tool.title.toLowerCase().includes('lesson plan')) {
      setView('lesson-plan-generator');
    }
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md hover:border-brand-primary-200 transition-all duration-200 mb-4 group"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-brand-primary mb-2 text-base transition-colors">{tool.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
        </div>
      </div>
    </Card>
  );
};