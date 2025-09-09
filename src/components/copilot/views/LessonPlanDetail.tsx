import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Share, Image, Bold, Italic, List, ListNumbers, TextH, TextHOne } from '../../ui/Icon';
import { mockLessonPlans } from '../../../data/mockSessionBriefs';
import { useCopilotStore } from '../../../stores/copilotStore';
import { CopilotInput } from '../CopilotInput';
import { InlineEditor } from '../editor/InlineEditor';
import { EditorToolbar } from '../editor/EditorToolbar';
import { useAutoSave } from '../../../hooks/useAutoSave';

export const LessonPlanDetail: React.FC = () => {
  const { 
    selectedLessonPlanId, 
    setView, 
    activeTabId, 
    addMessage,
    updateLessonPlan,
    saveLessonPlan,
    getLessonPlan,
    lessonPlanSaveStatus
  } = useCopilotStore();
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  
  const lessonPlan = mockLessonPlans.find(plan => plan.id === selectedLessonPlanId);
  const saveStatus = selectedLessonPlanId ? lessonPlanSaveStatus[selectedLessonPlanId] || 'saved' : 'saved';

  // Auto-save hook
  const { 
    triggerSave, 
    isSaving, 
    lastSaved, 
    hasError, 
    error,
    retry,
    isRetrying,
    retryCount
  } = useAutoSave({
    onSave: async (content: string) => {
      if (!selectedLessonPlanId) {
        throw new Error('No lesson plan selected');
      }
      
      // Update the lesson plan in the store
      updateLessonPlan(selectedLessonPlanId, content);
      
      // Save to backend
      await saveLessonPlan(selectedLessonPlanId);
    },
    delay: 2000, // 2 second delay
    enabled: isEditing
  });

  // Convert lesson plan data to HTML content
  useEffect(() => {
    if (lessonPlan && selectedLessonPlanId) {
      // Check if we have a saved version in the store first
      const storedPlan = getLessonPlan(selectedLessonPlanId);
      
      if (storedPlan && storedPlan.content) {
        setLessonContent(storedPlan.content);
        return;
      }
      
      // Convert lesson plan data to HTML format for TipTap
      const htmlContent = `
        <h1>${lessonPlan.title}</h1>
        <p><em>Lesson plan prepared ${lessonPlan.date} for ${lessonPlan.student}</em></p>
        
        <h2>Lesson Objectives</h2>
        <ul>
          ${lessonPlan.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
        
        <h2>Key Concepts</h2>
        <ul>
          ${lessonPlan.keyConcepts.map(concept => `<li>${concept}</li>`).join('')}
        </ul>
        
        <h2>Time Breakdown</h2>
        <p>${lessonPlan.timeBreakdown}</p>
        
        <h2>Lesson Steps</h2>
        <ol>
          ${lessonPlan.lessonSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
        
        <h2>Notes</h2>
        <p>${lessonPlan.notes}</p>
      `.trim();
      setLessonContent(htmlContent);
    }
  }, [lessonPlan, selectedLessonPlanId, getLessonPlan]);

  if (!lessonPlan) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Lesson plan not found</p>
      </div>
    );
  }

  const handleBackClick = () => {
    setView('session-briefs');
  };

  const handleEditToggle = () => {
    // If turning edit mode off, clear any text selection to avoid lingering highlight
    if (isEditing) {
      try {
        if (editorInstance) {
          // Blur the editor and collapse selection
          editorInstance.chain().blur().setTextSelection(0).run();
        }
        const sel = window.getSelection?.();
        if (sel && sel.removeAllRanges) sel.removeAllRanges();
      } catch (e) {
        // No-op on failures; selection will clear on next focus change
      }
    }
    setIsEditing(!isEditing);
  };

  const handleContentChange = (newContent: string) => {
    setLessonContent(newContent);
  };

  const handleContentChangeWithSave = (newContent: string, hasChanges: boolean) => {
    setLessonContent(newContent);
    
    // Trigger auto-save if there are changes and we're in edit mode
    if (hasChanges && isEditing) {
      triggerSave(newContent);
    }
  };

  const handleChatSubmit = (message: string) => {
    if (!activeTabId) return;

    // Create context from current lesson content
    const documentContent = lessonContent;

    const lessonPlanContext = `
Current Lesson Plan Document:

${documentContent}

---

User Request: ${message}

Please provide specific suggestions or modifications to improve this lesson plan based on the user's request. Focus on actionable changes that can enhance the learning experience.`;

    addMessage(activeTabId, lessonPlanContext, 'user');
    setView('chat');
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
            <button
              onClick={handleEditToggle}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium h-8 transition-colors ${
                isEditing
                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
            
            {/* Save Status Indicator */}
            {isEditing && (
              <div className="flex items-center gap-2 text-sm">
                {(saveStatus === 'saving' || isSaving) && (
                  <span className="text-blue-600 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    {isRetrying ? `Retrying... (${retryCount}/${3})` : 'Saving...'}
                  </span>
                )}
                {saveStatus === 'saved' && lastSaved && (
                  <span className="text-green-600">
                    Saved
                  </span>
                )}
                {(saveStatus === 'error' || hasError) && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600" title={error || 'Save failed'}>
                      Save failed
                    </span>
                    {hasError && (
                      <button
                        onClick={retry}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        disabled={isSaving || isRetrying}
                      >
                        {isRetrying ? 'Retrying...' : 'Retry'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
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

      {/* Editor Toolbar under header in edit mode */}
      {isEditing && (
        <div className="border-b border-gray-100 bg-white px-0 py-0">
          <div className="max-w-4xl mx-auto">
            <EditorToolbar editor={editorInstance} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <InlineEditor
            content={lessonContent}
            onChange={handleContentChange}
            onContentChange={handleContentChangeWithSave}
            editable={isEditing}
            placeholder="Write, press 'space' for AI, '/' for commands..."
            className="w-full"
            onEditorReady={(ed) => setEditorInstance(ed)}
            onReorder={(html) => { if (isEditing) triggerSave(html); }}
          />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 flex-shrink-0 bg-white border-t border-gray-100">
        <CopilotInput 
          onSubmit={handleChatSubmit}
          placeholder="Ask for changes or improvements to this lesson plan"
        />
      </div>
    </div>
  );
}
