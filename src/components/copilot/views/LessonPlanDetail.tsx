import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Share, Image, Bold, Italic, List, ListNumbers, TextH, TextHOne } from '../../ui/Icon';
import { mockLessonPlans } from '../../../data/mockSessionBriefs';
import { useCopilotStore } from '../../../stores/copilotStore';
import { CopilotInput } from '../CopilotInput';
import { openaiService } from '../../../services/openaiService';
import { InlineEditor } from '../editor/InlineEditor';
import { EditorToolbar } from '../editor/EditorToolbar';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { CopilotLoadingAnimation } from '../../copilot/CopilotLoadingAnimation';

export const LessonPlanDetail: React.FC = () => {
  const { 
    selectedLessonPlanId, 
    setView, 
    activeTabId, 
    addMessage,
    setLoading,
    isLoading,
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
    forceSave,
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
    // Skip auto-saving if there is a pending AI change awaiting user acceptance
    if (hasChanges && isEditing && !pendingChange) {
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

      // Merge: update only the Practice Problems section; keep all other sections intact
      const mergedHtml = mergePracticeProblemsOnly(beforeHTML, updatedHtml, userPrompt);

      // Normalize the Practice Problems section into clean blocks (no lists),
      // trim/pad to exactly N, and remove any old artifacts.
      const normalizedHtml = normalizePracticeProblemsSection(mergedHtml, userPrompt);

      // Generate and inject solution boxes for each problem
      const finalHtml = await addSolutionsToPracticeProblems(normalizedHtml);

      // Apply full-document replacement while allowing undo via pendingChange banner
      editor.commands.setContent(finalHtml, false);
      const afterHTML = editor.getHTML();
      setPendingChange({ beforeHTML, afterHTML, description: 'Updated lesson plan based on your request.' });

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

  // Ensure the Practice Problems section contains exactly N problem blocks (not a numbered list).
  // Converts any existing <ol>/<ul> into a sequence of <div data-problem-item> blocks.
  function enforcePracticeProblemCount(html: string, prompt: string): string {
    const match = prompt.match(/(\d+)\s+(practice\s+problems|questions)/i);
    const required = match ? parseInt(match[1], 10) : NaN;
    if (!required || required <= 0) return html;
    try {
      const container = document.createElement('div');
      container.innerHTML = html;
      // Find the 'Practice Problems' section
      const headings = Array.from(container.querySelectorAll('h1,h2,h3,h4')) as HTMLElement[];
      let list: HTMLOListElement | HTMLUListElement | null = null;
      let blocksWrap: HTMLElement | null = null;
      for (const h of headings) {
        if (/practice\s*problems/i.test(h.textContent || '')) {
          // Look for the nearest following list or block container
          let n: Element | null = h.nextElementSibling;
          while (n && !(n.tagName === 'OL' || n.tagName === 'UL' || (n as HTMLElement).dataset?.problemList === 'true')) {
            n = n.nextElementSibling;
          }
          if (n && (n.tagName === 'OL' || n.tagName === 'UL')) {
            list = n as any;
            break;
          } else if (n && (n as HTMLElement).dataset?.problemList === 'true') {
            blocksWrap = n as HTMLElement;
            break;
          }
        }
      }
      // Convert list to block container if necessary
      if (!blocksWrap) {
        if (!list) return html;
        const liNodes = Array.from(list.querySelectorAll(':scope > li')) as HTMLLIElement[];
        const wrap = document.createElement('div');
        wrap.setAttribute('data-problem-list', 'true');
        liNodes.forEach(li => {
          const div = document.createElement('div');
          div.setAttribute('data-problem-item', 'true');
          // Strip leading numeral like "1. "
          const text = (li.textContent || '').replace(/^\s*\d+\.?\s+/, '').trim();
          const p = document.createElement('p');
          p.textContent = text;
          div.appendChild(p);
          wrap.appendChild(div);
        });
        list.replaceWith(wrap);
        blocksWrap = wrap;
      }

      // Now operate on blocks
      let blocks = Array.from(blocksWrap.querySelectorAll(':scope > [data-problem-item]')) as HTMLElement[];

      // Remove empty/placeholder or objective-like items
      const isObjective = (t: string) => /^(apply|recognize|identify|understand|explore|work with|review|practice)\b/i.test(t) && !/[?]$/.test(t);
      const isPlaceholder = (t: string) => /^(problem\s*\d+\s*:?)$/i.test(t.trim()) || t.trim().length < 12;
      blocks.forEach((div) => {
        const text = (div.textContent || '').trim();
        if (isObjective(text) || isPlaceholder(text)) {
          div.remove();
        }
      });
      blocks = Array.from(blocksWrap.querySelectorAll(':scope > [data-problem-item]')) as HTMLElement[];
      // Trim extras if too many
      if (blocks.length > required) {
        for (let i = blocks.length - 1; i >= required; i--) {
          blocks[i].remove();
        }
      }
      // Pad with minimal placeholders if too few
      if (blocks.length < required) {
        const start = blocks.length + 1;
        for (let i = start; i <= required; i++) {
          const div = document.createElement('div');
          div.setAttribute('data-problem-item', 'true');
          const p = document.createElement('p');
          p.textContent = generateDefaultProblem(i);
          div.appendChild(p);
          blocksWrap.appendChild(div);
        }
      }
      return container.innerHTML;
    } catch {
      return html;
    }
  }

  // Start fresh: under the Practice Problems heading, replace existing content with
  // a clean list of problem blocks (no numbering), and enforce exactly-N.
  function normalizePracticeProblemsSection(html: string, prompt: string): string {
    const requiredMatch = prompt.match(/(\d+)\s+(practice\s+problems|questions)/i);
    const required = requiredMatch ? parseInt(requiredMatch[1], 10) : NaN;
    try {
      const container = document.createElement('div');
      container.innerHTML = html;
      const heading = findHeadingByText(container as any, /practice\s*problems/i);
      if (!heading) return html;

      // Collect candidate problem texts from existing structures
      const collected: string[] = [];
      let n: Element | null = heading.nextElementSibling;
      while (n && !(/^H[1-6]$/.test(n.tagName))) {
        if (n.tagName === 'OL' || n.tagName === 'UL') {
          const lis = Array.from(n.querySelectorAll(':scope > li')) as HTMLLIElement[];
          lis.forEach(li => {
            const text = (li.textContent || '').replace(/^\s*\d+\.?\s+/, '').trim();
            if (text) collected.push(text);
          });
        } else if ((n as HTMLElement).dataset?.problemList === 'true') {
          const blocks = Array.from(n.querySelectorAll(':scope > [data-problem-item]')) as HTMLElement[];
          blocks.forEach(b => {
            const p = b.querySelector('p');
            const text = (p?.textContent || b.textContent || '').trim();
            if (text) collected.push(text);
          });
        }
        n = n.nextElementSibling;
      }

      // Remove everything after heading up to (but not including) the next section heading
      let cur = heading.nextSibling as ChildNode | null;
      while (cur && !(cur.nodeType === 1 && /^H[1-6]$/.test((cur as Element).nodeName))) {
        const next = cur.nextSibling;
        heading.parentElement?.removeChild(cur);
        cur = next;
      }

      // Enforce count and build new structure
      let problems = collected;
      const isObjective = (t: string) => /^(apply|recognize|identify|understand|explore|work with|review|practice)\b/i.test(t) && !/[?]$/.test(t);
      const isPlaceholder = (t: string) => /^(problem\s*\d+\s*:?)$/i.test(t.trim()) || t.trim().length < 12;
      problems = problems.filter(t => t && !isObjective(t) && !isPlaceholder(t));
      if (required && required > 0) {
        if (problems.length > required) problems = problems.slice(0, required);
        if (problems.length < required) {
          const start = problems.length + 1;
          for (let i = start; i <= required; i++) problems.push(generateDefaultProblem(i));
        }
      }

      const wrap = document.createElement('div');
      wrap.setAttribute('data-problem-list', 'true');
      problems.forEach(text => {
        const div = document.createElement('div');
        div.setAttribute('data-problem-item', 'true');
        const p = document.createElement('p');
        p.textContent = text;
        div.appendChild(p);
        wrap.appendChild(div);
      });
      heading.insertAdjacentElement('afterend', wrap);
      return container.innerHTML;
    } catch (e) {
      console.warn('normalizePracticeProblemsSection failed', e);
      return html;
    }
  }

  function generateDefaultProblem(i: number): string {
    const templates = [
      (n: number) => `Given that two angles are complementary and one angle measures ${20 + (n % 5) * 5}°, what is the measure of the other angle?`,
      (n: number) => `In triangle ABC, angles A and B measure ${30 + (n % 4) * 10}° and ${40 + (n % 3) * 10}° respectively. What is the measure of angle C?`,
      (n: number) => `Lines l₁ ∥ l₂. A transversal forms an exterior angle of ${110 - (n % 4) * 5}°. What is the measure of the corresponding interior angle?`,
      (n: number) => `Angles x and y are supplementary. If x = ${60 + (n % 4) * 10}°, find y.`,
      (n: number) => `A triangle has one angle measuring ${45 + (n % 3) * 15}°. The other two angles are equal. What is the measure of each of the equal angles?`,
    ];
    const f = templates[(i - 1) % templates.length];
    return f(i);
  }

  async function addSolutionsToPracticeProblems(html: string): Promise<string> {
    try {
      const container = document.createElement('div');
      container.innerHTML = html;

      // Locate practice problems container
      const heading = findHeadingByText(container as any, /practice\s*problems/i);
      if (!heading) return html;
      let n: Element | null = heading.nextElementSibling;
      while (n && !((n as HTMLElement).dataset?.problemList === 'true' || /^H[1-6]$/.test(n.tagName))) {
        n = n.nextElementSibling;
      }
      // If no normalized wrapper, convert the first following list into our normalized structure
      if (!n || (n as HTMLElement).dataset?.problemList !== 'true') {
        // Try to find a list between heading and next heading
        let probe: Element | null = heading.nextElementSibling;
        let list: HTMLOListElement | HTMLUListElement | null = null;
        while (probe && !/^H[1-6]$/.test(probe.tagName)) {
          if (probe.tagName === 'OL' || probe.tagName === 'UL') { list = probe as any; break; }
          probe = probe.nextElementSibling;
        }
        if (!list) return html; // Nothing to normalize
        // Convert list items into normalized problem blocks
        const wrapCreated = document.createElement('div');
        wrapCreated.setAttribute('data-problem-list', 'true');
        const lis = Array.from(list.querySelectorAll(':scope > li')) as HTMLLIElement[];
        lis.forEach(li => {
          const div = document.createElement('div');
          div.setAttribute('data-problem-item', 'true');
          const p = document.createElement('p');
          const text = (li.textContent || '').replace(/^\s*\d+\.?\s+/, '').trim();
          p.textContent = text;
          div.appendChild(p);
          wrapCreated.appendChild(div);
        });
        // Remove any stray solution/answer nodes right after the original list
        let cleanup: Element | null = list.nextElementSibling;
        while (cleanup && !/^H[1-6]$/.test(cleanup.tagName)) {
          const text = (cleanup.textContent || '').trim();
          if (cleanup.tagName === 'P' && (/^solution\s*:?$/i.test(text) || /^answer\s*:/i.test(text))) {
            const toRemove = cleanup;
            cleanup = cleanup.nextElementSibling;
            toRemove.remove();
            continue;
          }
          if (cleanup.tagName === 'OL' || cleanup.tagName === 'UL') {
            const toRemove = cleanup;
            cleanup = cleanup.nextElementSibling;
            toRemove.remove();
            continue;
          }
          cleanup = cleanup.nextElementSibling;
        }
        list.replaceWith(wrapCreated);
        n = wrapCreated;
      }
      const wrap = n as HTMLElement;
      const items = Array.from(wrap.querySelectorAll(':scope > [data-problem-item]')) as HTMLElement[];
      if (items.length === 0) return html;

      // Gather problems and request solutions for all (preserve order)
      const problems: string[] = items.map(div => {
        const p = div.querySelector('p');
        return (p?.textContent || div.textContent || '').trim();
      });
      const solutions = await openaiService.generateProblemSolutions(problems);

      // Helper to detect an existing solution card matching the required structure
      const hasExistingCard = (div: HTMLElement): boolean => {
        // Remove any legacy solution box before checking
        div.querySelectorAll('[data-solution], [data-solution-toggle], [data-solution-body]').forEach(el => el.remove());
        const maybeCard = Array.from(div.children).find(child => {
          if (!(child instanceof HTMLElement)) return false;
          const style = (child.getAttribute('style') || '').replace(/\s+/g, ' ').trim();
          // Accept both multiline and single-line style declarations
          const normalizedTarget = 'background: #f5f5f5; padding: 16px; margin-bottom: 16px; border-radius: 8px; border: 1px solid #EEE;';
          const normalizedStyle = style
            .replace(/;\s*/g, '; ')
            .replace(/^;\s*/, '')
            .trim();
          // Consider match if all required fragments are present
          const required = [
            'background: #f5f5f5',
            'padding: 16px',
            'margin-bottom: 16px',
            'border-radius: 8px',
            'border: 1px solid #EEE'
          ];
          const styleHasAll = required.every(f => normalizedStyle.includes(f));
          const hasHeader = !!(child.querySelector('p')?.textContent || '').toLowerCase().includes('solution');
          const hasAnswer = !!Array.from(child.querySelectorAll('p')).find(p => /^\s*answer\s*:/i.test(p.textContent || ''));
          return styleHasAll && hasHeader && hasAnswer;
        });
        return !!maybeCard;
      };

      // Expected style string with newlines to match the provided spec
      const cardStyle = [
        '',
        'background: #f5f5f5;',
        'padding: 16px;',
        'margin-bottom: 16px;',
        'border-radius: 8px;',
        'border: 1px solid #EEE;',
        ''
      ].join('\n');

      items.forEach((div, idx) => {
        // Clean up any previously injected or AI-provided solution/answer artifacts inside this block
        Array.from(div.querySelectorAll(':scope > p, :scope > ol, :scope > ul')).forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          const text = (node.textContent || '').trim();
          if (node.tagName === 'P' && (/^solution\s*:?$/i.test(text) || /^answer\s*:/i.test(text))) {
            node.remove();
          }
          if (node.tagName === 'OL' || node.tagName === 'UL') {
            node.remove();
          }
        });
        const sol = solutions[idx];
        if (!sol) return;
        if (hasExistingCard(div)) return; // Skip if already has correct card

        // Build the required card structure
        const card = document.createElement('div');
        card.setAttribute('style', cardStyle);

        // Header: Solution:
        const headerP = document.createElement('p');
        headerP.className = 'text-gray-700 leading-relaxed mb-4 draggable-block';
        headerP.setAttribute('draggable', 'true');
        headerP.setAttribute('style', 'position: relative;');
        headerP.textContent = 'Solution:';
        card.appendChild(headerP);

        // Steps list
        if (sol.steps && sol.steps.length > 0) {
          const ol = document.createElement('ol');
          ol.className = 'list-decimal list-outside ml-6 space-y-2 mb-4 draggable-block';
          ol.setAttribute('draggable', 'true');
          ol.setAttribute('style', 'position: relative;');
          sol.steps.forEach(s => {
            const li = document.createElement('li');
            li.className = 'mb-2 text-gray-700 draggable-block';
            li.setAttribute('draggable', 'true');
            li.setAttribute('style', 'position: relative;');

            const p = document.createElement('p');
            p.className = 'text-gray-700 leading-relaxed mb-4';
            p.textContent = s;
            li.appendChild(p);
            ol.appendChild(li);
          });
          card.appendChild(ol);
        }

        // Answer paragraph
        if (sol.answer) {
          const ansP = document.createElement('p');
          ansP.className = 'text-gray-700 leading-relaxed mb-4 draggable-block';
          ansP.setAttribute('draggable', 'true');
          ansP.setAttribute('style', 'position: relative;');
          ansP.textContent = `Answer: ${sol.answer}`;
          card.appendChild(ansP);
        }

        // Append card after the problem text inside the same problem block
        div.appendChild(card);
      });

      return container.innerHTML;
    } catch (e) {
      console.warn('Failed to add solutions', e);
      return html;
    }
  }

  // Merge only the Practice Problems section from newHtml into originalHtml
  function mergePracticeProblemsOnly(originalHtml: string, newHtml: string, prompt: string): string {
    const intentIsPracticeOnly = /(practice\s+problems|practice\s+questions)/i.test(prompt);
    // If the intent isn't clearly about practice problems, return newHtml as-is
    // (caller may still enforce counts but we won't block broader edits explicitly requested)
    if (!intentIsPracticeOnly) return newHtml;

    try {
      const current = document.createElement('div');
      current.innerHTML = originalHtml;

      const incoming = document.createElement('div');
      incoming.innerHTML = newHtml;

      const { headingEl: curHeading, listEl: curList } = findPracticeSection(current);
      const { listEl: incomingList } = findPracticeSection(incoming);

      // If we didn't get a clear list from the model, try a generic first list fallback
      const fallbackIncomingList = incomingList || (incoming.querySelector('ol, ul') as HTMLOListElement | HTMLUListElement | null);
      if (!fallbackIncomingList) {
        // Nothing to merge; keep original
        return originalHtml;
      }

      // Prepare cloned list to avoid cross-document issues
      const newList = fallbackIncomingList.cloneNode(true) as HTMLOListElement | HTMLUListElement;

      if (curHeading) {
        // Replace or insert list under existing Practice Problems heading
        if (curList) {
          curList.replaceWith(newList);
        } else {
          curHeading.insertAdjacentElement('afterend', newList);
        }
      } else {
        // No existing section; insert before Notes if present, else append to end
        const notesHeading = findHeadingByText(current, /\bnotes\b/i);
        const header = document.createElement('h2');
        header.textContent = 'Practice Problems';
        if (notesHeading) {
          // Insert header first, then list after it so enforcement finds the list
          notesHeading.insertAdjacentElement('beforebegin', header);
          header.insertAdjacentElement('afterend', newList);
        } else {
          current.appendChild(header);
          header.insertAdjacentElement('afterend', newList);
        }
      }

      return current.innerHTML;
    } catch {
      return originalHtml;
    }
  }

  function findPracticeSection(container: HTMLElement): { headingEl: HTMLElement | null; listEl: HTMLOListElement | HTMLUListElement | null } {
    const headingEl = findHeadingByText(container, /practice\s*problems/i);
    if (!headingEl) return { headingEl: null, listEl: null };
    // Find the nearest following list after the heading (siblings until next section)
    let n: Element | null = headingEl.nextElementSibling;
    while (n && !(n.tagName === 'OL' || n.tagName === 'UL' || /^H[1-6]$/.test(n.tagName))) {
      n = n.nextElementSibling;
    }
    const listEl = n && (n.tagName === 'OL' || n.tagName === 'UL') ? (n as HTMLOListElement | HTMLUListElement) : null;
    return { headingEl, listEl };
  }

  function findHeadingByText(container: HTMLElement, re: RegExp): HTMLElement | null {
    const heads = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')) as HTMLElement[];
    return heads.find(h => re.test(h.textContent || '')) || null;
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

  // Delegate click handling for solution toggle links (works within TipTap-rendered content)
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const toggle = target.closest('[data-solution-toggle]') as HTMLElement | null;
      if (!toggle) return;
      e.preventDefault();
      const box = toggle.closest('[data-solution="true"]') as HTMLElement | null;
      if (!box) return;
      const bodies = Array.from(box.querySelectorAll('[data-solution-body]')) as HTMLElement[];
      if (!bodies.length) return;
      // Determine current state from first body
      const isHidden = bodies[0].style.display === 'none' || bodies[0].style.display === '';
      bodies.forEach(b => { b.style.display = isHidden ? 'block' : 'none'; });
      toggle.textContent = isHidden ? 'Hide solution' : 'See solution';
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, []);

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
        <div className="max-w-4xl mx-auto" data-lesson-plan-id={selectedLessonPlanId || ''}>
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
        {isLoading ? (
          <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CopilotLoadingAnimation size="sm" />
              <span>Processing your request…</span>
            </div>
          </div>
        ) : pendingChange ? (
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
                onClick={async () => {
                  try {
                    // Persist accepted changes immediately (prefer TipTap JSON for fidelity)
                    const json = editorInstance?.getJSON?.();
                    const contentToSave = json ? JSON.stringify(json) : (editorInstance?.getHTML?.() || lessonContent);

                    // Update store and persist regardless of edit mode
                    if (selectedLessonPlanId) {
                      updateLessonPlan(selectedLessonPlanId, contentToSave);
                      await saveLessonPlan(selectedLessonPlanId);
                    } else {
                      // Fallback to auto-save path if no plan id available
                      await forceSave(contentToSave);
                    }
                    setPendingChange(null);
                  } catch (e) {
                    console.error('Failed to save accepted changes', e);
                  }
                }}
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
