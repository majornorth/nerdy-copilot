import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Share, Image, Bold, Italic, List, ListNumbers, TextH, TextHOne } from '../../ui/Icon';
import { mockLessonPlans } from '../../../data/mockSessionBriefs';
import { useCopilotStore } from '../../../stores/copilotStore';
import { CopilotInput } from '../CopilotInput';
import { openaiService } from '../../../services/openaiService';
import { InlineEditor } from '../editor/InlineEditor';
import { EditorToolbar } from '../editor/EditorToolbar';
import { useAutoSave } from '../../../hooks/useAutoSave';

export const LessonPlanDetail: React.FC = () => {
  const { 
    selectedLessonPlanId, 
    setView, 
    activeTabId, 
    addMessage,
    setDraftMessage,
    setPromptContext,
    clearPromptContext,
    setPromptContextActive,
    promptContextActive,
    updateLessonPlan,
    saveLessonPlan,
    getLessonPlan,
    lessonPlanSaveStatus,
    lessonPlans,
    loadLessonPlanFromDatabase
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

  // Try to load from database when an ID is selected
  useEffect(() => {
    if (!selectedLessonPlanId) return;
    try { loadLessonPlanFromDatabase(selectedLessonPlanId); } catch {}
  }, [selectedLessonPlanId, loadLessonPlanFromDatabase]);

  // Convert lesson plan data to content (prefer JSON if available)
  useEffect(() => {
    if (lessonPlan && selectedLessonPlanId) {
      // Check if we have a saved version in the store first
      const storedPlan = lessonPlans[selectedLessonPlanId] || getLessonPlan(selectedLessonPlanId);
      
      if (storedPlan && storedPlan.content) {
        const contentStr = storedPlan.content;
        const looksLikeJSON = typeof contentStr === 'string' && contentStr.trim().startsWith('{') && contentStr.includes('"type":"doc"');
        if (looksLikeJSON) {
          try {
            const parsed = JSON.parse(contentStr);
            if (editorInstance) {
              editorInstance.commands.setContent(parsed, false);
              setLessonContent(editorInstance.getHTML());
              return;
            }
          } catch {}
        }
        // Treat as HTML
        setLessonContent(contentStr);
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
  }, [lessonPlan, selectedLessonPlanId, getLessonPlan, editorInstance, lessonPlans]);

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
    // Mirror HTML for UI purposes
    setLessonContent(newContent);
    
    // Trigger auto-save; persist TipTap JSON for fidelity (math/images)
    if (hasChanges && isEditing) {
      try {
        const json = editorInstance?.getJSON();
        if (json) {
          triggerSave(JSON.stringify(json));
          return;
        }
      } catch {}
      // Fallback to HTML if JSON unavailable
      triggerSave(newContent);
    }
  };

  // Pending change banner state
  const [pendingChange, setPendingChange] = useState<{ beforeHTML: string; afterHTML: string; description: string } | null>(null);

  const handleChatSubmit = async (userPrompt: string) => {
    if (!editorInstance) return;
    const editor = editorInstance;
    // Capture selection and current content
    const { from, to } = editor.state.selection;
    const selected = from !== to ? editor.state.doc.textBetween(from, to, '\n') : '';
    const beforeHTML = editor.getHTML();

    // Combine context + user prompt
    const ctx = (promptContextActive ? (selected || '') : '');
    const prompt = `${ctx ? `Selected content (context):\n\n${ctx}\n\n` : ''}User request: ${userPrompt}\n\nReturn only the revised text to place into the document.`;

    try {
      const res = await openaiService.sendMessage(prompt, []);
      const suggestion = (res.message || '').trim();
      if (!suggestion) return;

      // If an AI placeholder exists, replace it with the suggestion
      const root = editor.view.dom as HTMLElement;
      const placeholderEl = root.querySelector('[data-ai-placeholder="true"]') as HTMLElement | null;
      if (placeholderEl) {
        const start = editor.view.posAtDOM(placeholderEl, 0);
        const end = editor.view.posAtDOM(placeholderEl, (placeholderEl.childNodes?.length ?? 0));
        editor.chain().focus().insertContentAt({ from: start, to: end }, suggestion).run();
      } else if (from !== to) {
        // Replace selection if present
        editor.chain().focus().insertContentAt({ from, to }, suggestion).run();
      } else {
        // Insert at caret
        editor.chain().focus().insertContent(suggestion).run();
      }
      const afterHTML = editor.getHTML();
      setPendingChange({ beforeHTML, afterHTML, description: 'Applied AI suggestion to selection.' });
      // Clear context preview after applying
      clearPromptContext();
      setPromptContextActive(false);
    } catch (e) {
      console.error('Ask AI apply failed', e);
    }
  };

  // When Ask AI is clicked from the editor selection, prefill chat input with context and open chat
  const handleAskAIFromSelection = (selectedText: string) => {
    const trimmed = (selectedText || '').trim();
    setPromptContext(trimmed);
    setPromptContextActive(true);
    // Keep user on this page; optionally prefill input lightly
    setDraftMessage('');
  };

  // Keep prompt context synced with current selection while active
  useEffect(() => {
    if (!editorInstance) return;
    const editor = editorInstance;
    const handler = () => {
      try {
        if (!promptContextActive) return;
        const { from, to } = editor.state.selection;
        if (from === to) return;
        const text = editor.state.doc.textBetween(from, to, '\n').trim();
        setPromptContext(text);
      } catch {}
    };
    editor.on?.('selectionUpdate', handler);
    return () => { editor.off?.('selectionUpdate', handler); };
  }, [editorInstance, promptContextActive, setPromptContext]);

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
            <EditorToolbar 
              editor={editorInstance}
              onAskAISelection={handleAskAIFromSelection}
            />
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
            onReorder={() => { if (isEditing && editorInstance) { try { triggerSave(JSON.stringify(editorInstance.getJSON())); } catch { /* fallback ignored */ } } }}
            onAskAISelection={handleAskAIFromSelection}
          />
        </div>
      </div>

      {/* Chat Input or change confirmation */}
      <div className="p-4 flex-shrink-0 bg-white border-t border-gray-100">
        {pendingChange ? (
          <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="text-sm text-gray-700">{pendingChange.description}</div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  // Undo: restore previous HTML
                  try { editorInstance?.commands.setContent(pendingChange.beforeHTML, false); } catch {}
                  setPendingChange(null);
                }}
              >
                Undo
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded bg-brand-primary text-white hover:bg-brand-primary-hover"
                onClick={() => setPendingChange(null)}
              >
                Accept
              </button>
            </div>
          </div>
        ) : (
          <CopilotInput 
            onSubmit={handleChatSubmit}
            placeholder="Ask for changes or improvements to this lesson plan"
          />
        )}
      </div>
    </div>
  );
}
