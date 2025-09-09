import React from 'react';
import { Sparkle } from 'phosphor-react';
import { AIToolCard } from './AIToolCard';
import { mockAITools } from '../../data/mockData';

export const AITools: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkle size={20} weight="regular" className="text-brand-primary" />
        <h2 className="text-lg font-semibold text-gray-900">AI Tools</h2>
      </div>
      <div className="space-y-0">
        {mockAITools.map((tool) => (
          <AIToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};