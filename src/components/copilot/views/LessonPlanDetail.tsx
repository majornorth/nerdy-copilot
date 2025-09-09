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
    setLoading,
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
    // Capture full current content as HTML for context
    const beforeHTML = editor.getHTML();

    try {
      setLoading(true);
      // Ask OpenAI to update the entire lesson plan and return full HTML
      const updatedHtml = await openaiService.updateLessonPlanWithContext(userPrompt, beforeHTML);
      if (!updatedHtml) return;

      // Post-process HTML to ensure the requested number of practice problems
      const finalHtml = enforcePracticeProblemCount(updatedHtml, userPrompt);

      // Apply full-document replacement while allowing undo via pendingChange banner
      editor.commands.setContent(finalHtml, false);
      const afterHTML = editor.getHTML();
      setPendingChange({ beforeHTML, afterHTML, description: 'Updated lesson plan based on your request.' });

      // Persist changes (prefer TipTap JSON if available)
      try {
        const json = editor.getJSON?.();
        if (json) {
          triggerSave(JSON.stringify(json));
        }
      } catch {}

      // Clear any selection-context preview
      clearPromptContext();
      setPromptContextActive(false);
    } catch (e) {
      console.error('Lesson plan update failed', e);
    }
    finally {
      setLoading(false);
    }
  };

  // If prompt requests N practice problems, ensure the list has exactly N items (pad if short, trim if long)
  function enforcePracticeProblemCount(html: string, prompt: string): string {
    const match = prompt.match(/(\d+)\s+(practice\s+problems|questions)/i);
    const required = match ? parseInt(match[1], 10) : NaN;
    if (!required || required <= 0) return html;
    try {
      const container = document.createElement('div');
      container.innerHTML = html;
      // Find the 'Practice Problems' section list
      const headings = Array.from(container.querySelectorAll('h1,h2,h3,h4')) as HTMLElement[];
      let list: HTMLOListElement | HTMLUListElement | null = null;
      for (const h of headings) {
        if (/practice\s*problems/i.test(h.textContent || '')) {
          // Look for the nearest following list
          let n: Element | null = h.nextElementSibling;
          while (n && !(n.tagName === 'OL' || n.tagName === 'UL')) {
            n = n.nextElementSibling;
          }
          if (n && (n.tagName === 'OL' || n.tagName === 'UL')) {
            list = n as any;
            break;
          }
        }
      }
      if (!list) return html;
      const items = Array.from(list.querySelectorAll(':scope > li')) as HTMLLIElement[];
      // Trim extras if too many
      if (items.length > required) {
        for (let i = items.length - 1; i >= required; i--) {
          items[i].remove();
        }
      }
      // Pad with minimal placeholders if too few
      if (items.length < required) {
        const start = items.length + 1;
        for (let i = start; i <= required; i++) {
          const li = document.createElement('li');
          li.textContent = `Problem ${i}:`;
          list.appendChild(li);
        }
      }
      return container.innerHTML;
    } catch {
      return html;
    }
  }

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
