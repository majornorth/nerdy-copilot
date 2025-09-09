import React from 'react';
import { ArrowLeft, CaretRight, Download, Share } from 'phosphor-react';
import { mockSessionBriefs } from '../../../data/mockSessionBriefs';
import { useCopilotStore } from '../../../stores/copilotStore';

export const SessionBriefDetail: React.FC = () => {
  const { selectedSessionBriefId, setView, setSelectedLessonPlan } = useCopilotStore();
  
  const sessionBrief = mockSessionBriefs.find(brief => brief.id === selectedSessionBriefId);

  if (!sessionBrief) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Session brief not found</p>
      </div>
    );
  }

  const handleBackClick = () => {
    setView('session-briefs');
  };

  const handleLessonPlanClick = () => {
    setSelectedLessonPlan('lp-1'); // Using the mock lesson plan ID
    setView('lesson-plan-detail');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-100 h-[52px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} weight="regular" />
          </button>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium h-8">
              <Download size={16} weight="regular" />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium h-8">
              <Share size={16} weight="regular" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-4">
            Lesson plan prepared {sessionBrief.date} for {sessionBrief.student}
          </p>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-8">
            {sessionBrief.title}
          </h1>
        </div>

        {/* Session Details */}
        <div className="space-y-6 mb-8">
          <div className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-gray-900">Goal: </span>
              <span className="text-gray-700">{sessionBrief.goal}</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-gray-900">Today's geometry focus: </span>
              <span className="text-gray-700">{sessionBrief.todaysFocus}</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-gray-900">Strengths identified: </span>
              <span className="text-gray-700">{sessionBrief.strengthsIdentified}</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-gray-900">Lesson plan: </span>
              <span className="text-gray-700">{sessionBrief.lessonPlan}</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
            <div>
              <span className="font-semibold text-gray-900">Practice problems: </span>
              <span className="text-gray-700">{sessionBrief.practiceProblems}</span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-4">
          <button
            onClick={handleLessonPlanClick}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            <span className="font-semibold text-gray-900 text-base">Lesson plan</span>
            <CaretRight size={20} weight="regular" className="text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
            <span className="font-semibold text-gray-900 text-base">Practice problems</span>
            <CaretRight size={20} weight="regular" className="text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
            <span className="font-semibold text-gray-900 text-base">Last session notes</span>
            <CaretRight size={20} weight="regular" className="text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
            <span className="font-semibold text-gray-900 text-base">Assessments</span>
            <CaretRight size={20} weight="regular" className="text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
            <span className="font-semibold text-gray-900 text-base">Client-provided materials</span>
            <CaretRight size={20} weight="regular" className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};