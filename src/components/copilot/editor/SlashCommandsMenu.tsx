import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { cn } from '../../../utils/cn';
import { uploadImageAndGetPublicUrl } from '../../../services/uploadService';
import katex from 'katex';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  command: (editor: Editor) => void;
}

interface SlashCommandsMenuProps {
  editor: Editor;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  query: string;
}

export const SlashCommandsMenu: React.FC<SlashCommandsMenuProps> = ({
  editor,
  isVisible,
  position,
  onClose,
  query
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [showMathInput, setShowMathInput] = useState(false);
  const [mathLatex, setMathLatex] = useState('');
  const [mathPreviewHtml, setMathPreviewHtml] = useState('');
  const [mathError, setMathError] = useState<string | null>(null);

  // Define available commands
  const commands: Command[] = [
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h16"/></svg>,
      keywords: ['h1', 'heading', 'title', 'large'],
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      id: 'image',
      title: 'Image',
      description: 'Upload and insert an image',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
          <circle cx="8.5" cy="10.5" r="1.5"/>
          <path d="M21 19l-7-7-4 4-2-2-5 5"/>
        </svg>
      ),
      keywords: ['image', 'photo', 'picture', 'upload'],
      command: (editor) => {
        // Create a file input dynamically
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (!files || files.length === 0) return;

          const file = files[0];
          try {
            // Try uploading to Supabase for a persistent URL
            const publicUrl = await uploadImageAndGetPublicUrl(file);
            let src: string;

            if (publicUrl) {
              src = publicUrl;
            } else {
              // Fallback to object URL if upload unavailable
              src = URL.createObjectURL(file);
            }

            editor.chain().focus().setImage({ src, alt: file.name }).run();
          } catch (error) {
            console.error('Failed to insert image:', error);
            alert('Image upload failed. Please try again.');
          }
        };
        input.click();
      }
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h14M4 6h14M4 18h14"/></svg>,
      keywords: ['h2', 'heading', 'subtitle', 'medium'],
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h12M4 6h12M4 18h12"/></svg>,
      keywords: ['h3', 'heading', 'subtitle', 'small'],
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
    {
      id: 'paragraph',
      title: 'Paragraph',
      description: 'Regular text block',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h12"/></svg>,
      keywords: ['p', 'paragraph', 'text'],
      command: (editor) => editor.chain().focus().setParagraph().run()
    },
    {
      id: 'bullet-list',
      title: 'Bullet List',
      description: 'Create a bulleted list',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>,
      keywords: ['bullet', 'list', 'unordered'],
      command: (editor) => editor.chain().focus().toggleBulletList().run()
    },
    {
      id: 'ordered-list',
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>,
      keywords: ['numbered', 'list', 'ordered'],
      command: (editor) => editor.chain().focus().toggleOrderedList().run()
    },
    {
      id: 'math',
      title: 'Math Equation',
      description: 'Insert a mathematical equation',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M8 6l4 12 4-12"/></svg>,
      keywords: ['math', 'equation', 'formula', 'katex'],
      command: () => {
        setShowMathInput(true);
        setMathLatex('');
        setMathPreviewHtml('');
        setMathError(null);
      }
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Insert a code block',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/></svg>,
      keywords: ['code', 'codeblock', 'programming'],
      command: (editor) => editor.chain().focus().toggleCodeBlock().run()
    }
  ];

  // Filter commands based on search query
  useEffect(() => {
    const filtered = commands.filter(command => {
      const searchQuery = query.toLowerCase().replace('/', '');
      if (!searchQuery) return true;
      
      return (
        command.title.toLowerCase().includes(searchQuery) ||
        command.description.toLowerCase().includes(searchQuery) ||
        command.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
      );
    });
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible && !showMathInput) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!showMathInput) setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!showMathInput) setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (!showMathInput && filteredCommands[selectedIndex]) {
            // Delete the typed slash query before running the command
            try {
              const { from } = editor.state.selection;
              const len = (query || '').length;
              if (len > 0 && query.startsWith('/')) {
                editor.chain().focus().deleteRange({ from: Math.max(0, from - len), to: from }).run();
              }
            } catch {}
            filteredCommands[selectedIndex].command(editor);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (showMathInput) {
            setShowMathInput(false);
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, filteredCommands, editor, onClose, showMathInput]);

  // Position menu and handle click outside
  useEffect(() => {
    if (!menuRef.current || (!isVisible && !showMathInput)) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (showMathInput) {
          setShowMathInput(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose, showMathInput]);

  if (!isVisible && !showMathInput) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200"
      style={{
        top: position.y + 24,
        left: position.x
      }}
    >
      {!showMathInput && (
        <div className="w-72 overflow-hidden">
          {/* Search input feedback */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              {query ? `Search for "${query}"` : 'Type to search...'}
            </p>
          </div>

          {/* Commands list */}
          <div className="max-h-72 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No commands found
              </div>
            ) : (
          filteredCommands.map((command, index) => (
            <button
              key={command.id}
              className={cn(
                'w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors duration-100',
                selectedIndex === index && 'bg-brand-primary/5'
              )}
              onClick={() => {
                try {
                  const { from } = editor.state.selection;
                  const len = (query || '').length;
                  if (len > 0 && query.startsWith('/')) {
                    editor.chain().focus().deleteRange({ from: Math.max(0, from - len), to: from }).run();
                  }
                } catch {}
                command.command(editor);
                if (command.id !== 'math') onClose();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-gray-600">
                    {command.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{command.title}</div>
                    <div className="text-sm text-gray-500">{command.description}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {showMathInput && (
        <div className="w-[28rem] p-3">
          <div className="mb-2">
            <label className="text-sm font-medium text-gray-700">LaTeX</label>
            <input
              className="mt-1 w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              placeholder="e.g., E = mc^2"
              value={mathLatex}
              onChange={(e) => {
                const v = e.target.value;
                setMathLatex(v);
                try {
                  const html = katex.renderToString(v, { throwOnError: false });
                  setMathPreviewHtml(html);
                  setMathError(null);
                } catch (err) {
                  setMathError('Unable to render preview');
                }
              }}
            />
          </div>
          <div className="mb-3">
            <div className="text-sm text-gray-700 mb-1">Preview</div>
            <div className="min-h-[48px] p-2 border border-gray-100 rounded bg-gray-50">
              {mathError ? (
                <div className="text-sm text-red-600">{mathError}</div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: mathPreviewHtml }} />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowMathInput(false)}
              className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const latex = mathLatex.trim();
                if (!latex) return;
                editor.chain().focus().insertBlockMath({ latex }).run();
                setShowMathInput(false);
                onClose();
              }}
              className="px-3 py-1.5 text-sm rounded bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              Insert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
