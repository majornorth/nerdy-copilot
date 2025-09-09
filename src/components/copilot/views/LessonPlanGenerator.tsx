import React, { useState } from 'react';
import { Sparkle } from 'phosphor-react';
import { SearchSelect } from '../../ui/SearchSelect';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import { FormTextarea } from '../../ui/FormTextarea';
import { useCopilotStore } from '../../../stores/copilotStore';

/**
 * Lesson Plan Generator view component
 * Allows tutors to generate custom lesson plans based on student needs and session details
 */
export const LessonPlanGenerator: React.FC = () => {
  const { setView, addMessage, activeTabId } = useCopilotStore();
  const [formData, setFormData] = useState({
    student: '',
    session: '',
    subject: '',
    gradeLevel: '',
    timeConstraint: '60',
    topicFocus: '',
    stateStandards: '',
    learningObjectives: ''
  });

  const gradeLevelOptions = [
    { value: '', label: 'Select' },
    { value: 'elementary', label: 'Elementary (K-5)' },
    { value: 'middle', label: 'Middle School (6-8)' },
    { value: 'high', label: 'High School (9-12)' },
    { value: 'college', label: 'College' },
    { value: 'adult', label: 'Adult Education' }
  ];

  const timeConstraintOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '2 hours' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = () => {
    if (!activeTabId) return;

    // Create a comprehensive prompt for lesson plan generation
    const prompt = `Generate a detailed lesson plan with the following specifications:

**Student**: ${formData.student || 'Not specified'}
**Session**: ${formData.session || 'Not specified'}
**Subject**: ${formData.subject || 'Not specified'}
**Grade Level**: ${formData.gradeLevel || 'Not specified'}
**Duration**: ${formData.timeConstraint} minutes
**Topic/Focus Area**: ${formData.topicFocus || 'Not specified'}
**State Standards**: ${formData.stateStandards || 'Not specified'}
**Learning Objectives**: ${formData.learningObjectives || 'Not specified'}

Please create a comprehensive lesson plan that includes:
1. Clear learning objectives
2. Materials needed
3. Step-by-step lesson structure with time allocations
4. Assessment methods
5. Differentiation strategies
6. Extension activities
7. Homework or follow-up suggestions

Format the lesson plan in a clear, organized manner that's ready for classroom use.`;

    // Add the message to the active tab
    addMessage(activeTabId, prompt, 'user');
    
    // Navigate back to chat view to see the response
    setView('chat');
  };

  const isFormValid = formData.subject.trim() !== '' && formData.topicFocus.trim() !== '';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Generate a custom lesson plan
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Copilot will analyze past session transcripts, tutor's notes, and session recordings to design a lesson plan unique to the student and session.
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Student */}
          <SearchSelect
            label="Student"
            placeholder="Which student is this lesson plan for?"
            value={formData.student}
            onChange={(e) => handleInputChange('student', e.target.value)}
            icon="search"
          />

          {/* Upcoming Session */}
          <SearchSelect
            label="Upcoming session"
            placeholder="Select an upcoming session"
            value={formData.session}
            onChange={(e) => handleInputChange('session', e.target.value)}
            icon="calendar"
          />

          {/* Subject */}
          <SearchSelect
            label="Subject"
            placeholder="What subject is this lesson for?"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            icon="search"
          />

          {/* Grade Level and Time Constraint Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Grade level"
              value={formData.gradeLevel}
              onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
              options={gradeLevelOptions}
            />

            <FormSelect
              label="Time constraint"
              value={formData.timeConstraint}
              onChange={(e) => handleInputChange('timeConstraint', e.target.value)}
              options={timeConstraintOptions}
            />
          </div>

          {/* Topic and Focus Area */}
          <FormInput
            label="Topic and focus area"
            placeholder="What specific concepts are you studying?"
            value={formData.topicFocus}
            onChange={(e) => handleInputChange('topicFocus', e.target.value)}
          />

          {/* State Standards */}
          <SearchSelect
            label="State standards"
            placeholder="e.g. Missouri Learning Standards"
            value={formData.stateStandards}
            onChange={(e) => handleInputChange('stateStandards', e.target.value)}
            icon="search"
          />

          {/* Learning Objectives */}
          <FormTextarea
            label="Learning objectives"
            placeholder="What do you want them to learn?"
            value={formData.learningObjectives}
            onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-6 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleGenerate}
          disabled={!isFormValid}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
            isFormValid
              ? 'bg-brand-primary hover:bg-brand-primary-hover focus:ring-2 focus:ring-brand-primary focus:ring-offset-2'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Sparkle size={20} weight="regular" />
          Generate
        </button>
      </div>
    </div>
  );
};