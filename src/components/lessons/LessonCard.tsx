import React from 'react';
import { Link, CaretDown, VideoCamera, Compass } from 'phosphor-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Lesson } from '../../types';
import { useCopilotStore } from '../../stores/copilotStore';
import { useCopilot } from '../../hooks/useCopilot';

interface LessonCardProps {
  lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const { setView, setSelectedLessonPlan } = useCopilotStore();
  const { openCopilot } = useCopilot();

  const handleLessonPlanClick = () => {
    // Set the lesson plan ID for Geometry Fundamentals
    setSelectedLessonPlan('lp-1');
    // Navigate to lesson plan detail view
    setView('lesson-plan-detail');
    // Open the copilot panel if it's not already open
    openCopilot();
  };

  return (
    <Card className="mb-6 hover:shadow-md hover:border-brand-primary-200 transition-all duration-200">
      {/* Header with date and time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-normal text-gray-900">{lesson.date}</span>
        <span className="text-sm text-gray-600">{lesson.time}</span>
      </div>

      {/* Student and subject info */}
      <div className="flex items-center justify-between mb-2">
        <a href="#" className="text-brand-primary font-medium text-base hover:text-brand-primary-hover transition-colors">
          {lesson.student.name}
        </a>
        <span className="text-sm font-medium text-gray-600">{lesson.subject}</span>
      </div>

      {/* Lesson type and recurring info */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-base text-gray-900">{lesson.type}</span>
        <span className="text-sm text-gray-600">{lesson.recurring}</span>
      </div>

      {/* AI lesson plan suggestion with button - only show for first lesson */}
      {lesson.showLessonPlan && (
        <div className="bg-brand-lesson-plan p-4 rounded-lg mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-700 flex-1 pr-4">
            Prepare for your session by reviewing an AI-generated lesson plan unique to your student
          </p>
          <button 
            onClick={handleLessonPlanClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary focus:ring-brand-primary transition-colors rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0"
          >
            <Compass size={20} weight="regular" className="text-brand-primary" />
            Lesson plan
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            size="sm" 
            className="font-medium flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary" 
            leftIcon={VideoCamera} 
            iconWeight="regular"
            disabled={!lesson.buttonsEnabled}
          >
            Join now
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700" 
            leftIcon={Link} 
            iconWeight="regular"
            disabled={!lesson.buttonsEnabled}
          >
            Student link
          </Button>
        </div>
        
        <Dropdown trigger={
          <div className="flex items-center gap-1 text-gray-600 hover:text-brand-primary transition-colors">
            <span className="text-sm">More options</span>
            <CaretDown size={20} weight="regular" />
          </div>
        }>
          <DropdownItem>Edit lesson</DropdownItem>
          <DropdownItem>Cancel lesson</DropdownItem>
          <DropdownItem>Contact student</DropdownItem>
        </Dropdown>
      </div>
    </Card>
  );
};