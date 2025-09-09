import React from 'react';
import { BookOpen, Question, GraduationCap, Users, VideoCamera } from 'phosphor-react';
import { Card } from '../ui/Card';
import { mockResources } from '../../data/mockData';

const resourceIcons = {
  'Frequently asked questions': Question,
  'Getting started videos': VideoCamera,
  'Referrals': Users,
  'Learning tools': GraduationCap,
  'Online tutoring demo': BookOpen
};

export const TutorResources: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen size={20} weight="regular" className="text-brand-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Tutor resources</h2>
      </div>
      
      <Card>
        <div className="space-y-4">
          {mockResources.map((resource) => {
            const IconComponent = resourceIcons[resource.title as keyof typeof resourceIcons] || BookOpen;
            return (
              <a
                key={resource.id}
                href={resource.url}
                className="flex items-center gap-3 text-sm text-brand-primary hover:text-brand-primary-hover hover:bg-brand-primary-50 p-2 rounded-lg transition-all duration-200 group"
              >
                <IconComponent 
                  size={20} 
                  weight="regular" 
                  className="text-brand-primary group-hover:text-brand-primary-hover transition-colors flex-shrink-0" 
                />
                <span className="group-hover:underline">{resource.title}</span>
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
};