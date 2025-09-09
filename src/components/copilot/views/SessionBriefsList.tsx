import React, { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, SortAscending } from 'phosphor-react';
import { mockLessonPlans } from '../../../data/mockSessionBriefs';
import { useCopilotStore } from '../../../stores/copilotStore';

export const SessionBriefsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setView, setSelectedLessonPlan } = useCopilotStore();

  const filteredPlans = mockLessonPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.objectives.some(obj => obj.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePlanClick = (planId: string) => {
    setSelectedLessonPlan(planId);
    setView('lesson-plan-detail');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lesson plans</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass size={16} weight="regular" className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 text-sm"
          />
        </div>

        {/* Filter and Sort buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            <FunnelSimple size={16} weight="regular" />
            Filter
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            <SortAscending size={16} weight="regular" />
            Sort
          </button>
        </div>
      </div>

      {/* Lesson Plans List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredPlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handlePlanClick(plan.id)}
            className="w-full p-4 text-left border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {plan.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {plan.student}
                </span>
                <span className="text-sm text-gray-400">
                  {plan.date}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};