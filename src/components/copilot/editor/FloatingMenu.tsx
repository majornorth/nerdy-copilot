import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, Code, Link, Palette, Highlighter, Sparkle } from '../../ui/Icon';
import { cn } from '../../../utils/cn';
import { openaiService } from '../../../services/openaiService';

interface FloatingMenuProps {
  editor: Editor;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * Floating formatting menu that appears when text is selected
 * Provides rich text formatting options including bold, italic, colors, etc.
 */
export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  editor,
  isVisible,
  position,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showAIInput, setShowAIInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Common text colors
  const textColors = [
    { name: 'Default', value: '#374151' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Brand', value: '#4A4BB6' }
  ];

  // Common highlight colors
  const highlightColors = [
    { name: 'None', value: null },
    { name: 'Yellow', value: '#FEF3C7' },
    { name: 'Green', value: '#D1FAE5' },
    { name: 'Blue', value: '#DBEAFE' },
    { name: 'Purple', value: '#E9D5FF' },
    { name: 'Pink', value: '#FCE7F3' },
    { name: 'Red', value: '#FEE2E2' },
    { name: 'Orange', value: '#FED7AA' }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      if (event.key === 'Escape') {
        if (showAIInput) {
          setShowAIInput(false);
          setAiPrompt('');
          setAiResponse(null);
          setAiError(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose, showAIInput]);

  // Get current link URL if selection is a link
  useEffect(() => {
    if (editor && isVisible) {
      const { href } = editor.getAttributes('link');
      setLinkUrl(href || '');
    }
  }, [editor, isVisible]);

  if (!isVisible) return null;

  const handleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const handleUnderline = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  const handleStrikethrough = () => {
    editor.chain().focus().toggleStrike().run();
  };

  const handleCode = () => {
    editor.chain().focus().toggleCode().run();
  };

  const handleTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const handleHighlight = (color: string | null) => {
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    setShowHighlightPicker(false);
  };

  const handleLink = () => {
    if (showLinkInput) {
      // Apply link
      if (linkUrl) {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  };

  // Ask AI handling
  const handleAskAI = async () => {
    setAiError(null);
    setAiResponse(null);
    const { state } = editor;
    const { from, to } = state.selection;
    const selected = from !== to ? state.doc.textBetween(from, to, '\n') : '';

    const baseInstruction = selected
      ? `Improve the following selection. Provide only the improved text.\n\nSELECTION:\n${selected}\n\n` 
      : `Provide a helpful, concise improvement relevant to a lesson plan document. Provide only the suggested text.\n\n`;

    const message = `${baseInstruction}${aiPrompt}`.trim();

    setAiLoading(true);
    try {
      const res = await openaiService.sendMessage(message, []);
      setAiResponse(res.message?.trim() || '');
    } catch (err: any) {
      setAiError(err?.message || 'Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const replaceSelectionWithAI = () => {
    if (!aiResponse) return;
    editor.chain().focus().insertContent(aiResponse).run();
    setShowAIInput(false);
    setAiPrompt('');
    setAiResponse(null);
  };

  const insertAfterSelectionWithAI = () => {
    if (!aiResponse) return;
    // Move cursor to end of selection then insert a space and the response
    const { state, view } = editor;
    const pos = state.selection.to;
    editor.commands.setTextSelection(pos);
    editor.chain().focus().insertContent(' ' + aiResponse).run();
    setShowAIInput(false);
    setAiPrompt('');
    setAiResponse(null);
  };

  const handleLinkKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLink();
    } else if (event.key === 'Escape') {
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[999999] bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
      style={{
        left: position.x,
        top: position.y - 50, // Position above the selection
        transform: 'translateX(-50%)'
      }}
    >
      {/* Basic formatting buttons */}
      <button
        onClick={handleBold}
        className={cn(
          'p-2 rounded hover:bg-gray-100 transition-colors',
          editor.isActive('bold') && 'bg-brand-primary-50 text-brand-primary'
        )}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} weight="regular" />
      </button>

      <button
        onClick={handleItalic}
        className={cn(
          'p-2 rounded hover:bg-gray-100 transition-colors',
          editor.isActive('italic') && 'bg-brand-primary-50 text-brand-primary'
        )}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} weight="regular" />
      </button>

      <button
        onClick={handleUnderline}
        className={cn(
          'p-2 rounded hover:bg-gray-100 transition-colors',
          editor.isActive('underline') && 'bg-brand-primary-50 text-brand-primary'
        )}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} weight="regular" />
      </button>

      <button
        onClick={handleStrikethrough}
        className={cn(
          'p-2 rounded hover:bg-gray-100 transition-colors',
          editor.isActive('strike') && 'bg-brand-primary-50 text-brand-primary'
        )}
        title="Strikethrough"
      >
        <Strikethrough size={16} weight="regular" />
      </button>

      <button
        onClick={handleCode}
        className={cn(
          'p-2 rounded hover:bg-gray-100 transition-colors',
          editor.isActive('code') && 'bg-brand-primary-50 text-brand-primary'
        )}
        title="Inline Code"
      >
        <Code size={16} weight="regular" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Text color picker */}
      <div className="relative">
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
            setShowLinkInput(false);
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Text Color"
        >
          <Palette size={16} weight="regular" />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-1 min-w-[120px]">
            {textColors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleTextColor(color.value)}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Highlight color picker */}
      <div className="relative">
        <button
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
            setShowLinkInput(false);
          }}
          className={cn(
            'p-2 rounded hover:bg-gray-100 transition-colors',
            editor.isActive('highlight') && 'bg-brand-primary-50 text-brand-primary'
          )}
          title="Highlight"
        >
          <Highlighter size={16} weight="regular" />
        </button>

        {showHighlightPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-1 min-w-[120px]">
            {highlightColors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleHighlight(color.value)}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: color.value || '#ffffff',
                  border: color.value ? '1px solid #d1d5db' : '2px solid #ef4444'
                }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Link button */}
      <div className="relative">
        <button
          onClick={() => {
            setShowLinkInput(!showLinkInput);
            setShowColorPicker(false);
            setShowHighlightPicker(false);
          }}
          className={cn(
            'p-2 rounded hover:bg-gray-100 transition-colors',
            editor.isActive('link') && 'bg-brand-primary-50 text-brand-primary'
          )}
          title="Link"
        >
          <Link size={16} weight="regular" />
        </button>

        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px]">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Enter URL..."
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              autoFocus
            />
            <div className="flex gap-1 mt-2">
              <button
                onClick={handleLink}
                className="px-2 py-1 text-xs bg-brand-primary text-white rounded hover:bg-brand-primary-hover transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ask AI */}
      <div className="relative">
        <button
          onClick={() => {
            setShowAIInput(!showAIInput);
            setShowColorPicker(false);
            setShowHighlightPicker(false);
            setShowLinkInput(false);
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Ask AI"
        >
          <Sparkle size={16} weight="regular" />
        </button>

        {showAIInput && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[260px] max-w-[360px]">
            <div className="text-sm text-gray-600 mb-2">Ask AI about the selection</div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Make this clearer for 9th graders"
              rows={3}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none"
            />
            {aiError && (
              <div className="mt-2 text-xs text-red-600">{aiError}</div>
            )}
            {aiResponse && (
              <div className="mt-2 p-2 border border-gray-100 rounded bg-gray-50 max-h-40 overflow-auto text-sm whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 justify-end">
              {!aiResponse ? (
                <button
                  onClick={handleAskAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className={cn('px-3 py-1.5 text-sm rounded text-white', aiLoading ? 'bg-gray-400' : 'bg-brand-primary hover:bg-brand-primary-hover')}
                >
                  {aiLoading ? 'Thinking…' : 'Ask'}
                </button>
              ) : (
                <>
                  <button
                    onClick={replaceSelectionWithAI}
                    className="px-3 py-1.5 text-sm rounded bg-brand-primary text-white hover:bg-brand-primary-hover"
                  >
                    Replace
                  </button>
                  <button
                    onClick={insertAfterSelectionWithAI}
                    className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Insert After
                  </button>
                  <button
                    onClick={() => { setShowAIInput(false); setAiPrompt(''); setAiResponse(null); }}
                    className="px-3 py-1.5 text-sm rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
