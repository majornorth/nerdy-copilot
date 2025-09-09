import React from 'react';
import { CalendarBlank } from 'phosphor-react';
import { LessonCard } from './LessonCard';
import { mockLessons } from '../../data/mockData';

export const UpcomingLessons: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
        <CalendarBlank size={24} weight="regular" className="text-brand-primary" />
        Upcoming lessons
      </h2>
      <div className="space-y-6">
        {mockLessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
};