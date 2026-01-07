import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { Selection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Mathematics from '@tiptap/extension-mathematics';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import 'katex/dist/katex.min.css';
import { FloatingMenu } from './FloatingMenu';
import { SlashCommandsMenu } from './SlashCommandsMenu';

interface InlineEditorProps {
  content: string;
  onChange: (content: string) => void;
  onContentChange?: (content: string, hasChanges: boolean) => void;
  onSave?: (content: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autoSaveDelay?: number;
  onEditorReady?: (editor: Editor) => void;
  onReorder?: (content: string) => void;
  // Bubble up Ask AI selection to parent (e.g., to prefill chat input)
  onAskAISelection?: (selectedText: string) => void;
}

/**
 * TipTap-based inline editor component for rich text editing
 * Supports formatting, math equations, images, and Notion-like editing experience
 * Emits content change events for auto-save functionality
 */
export const InlineEditor: React.FC<InlineEditorProps> = ({
  content,
  onChange,
  onContentChange,
  onSave,
  placeholder = "Start typing...",
  className = "",
  editable = true,
  autoSaveDelay = 2000,
  onEditorReady,
  onReorder,
  onAskAISelection
}) => {
  // Auto-save integration
  const {
    triggerSave,
    isSaving,
    lastSaved,
    hasError,
    error,
    retry
  } = useAutoSave({
    onSave: onSave || (async () => {}),
    delay: autoSaveDelay,
    enabled: !!onSave && editable
  });
  const [initialContent, setInitialContent] = React.useState<string>(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(false);
  const [showFloatingMenu, setShowFloatingMenu] = React.useState(false);
  const [floatingMenuPosition, setFloatingMenuPosition] = React.useState({ x: 0, y: 0 });
  
  // Slash commands state
  const [showSlashMenu, setShowSlashMenu] = React.useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = React.useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = React.useState('');

  const editor = useEditor({
    extensions: [
      // Configure StarterKit once with all necessary options
      // Disable conflicting extensions from StarterKit
      StarterKit.configure({
        dropcursor: false,
        gapcursor: false,
        textStyle: false,
        heading: { levels: [1, 2, 3] },
        paragraph: {
          HTMLAttributes: {
            class: 'text-gray-700 leading-relaxed mb-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-6 space-y-2 mb-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-6 space-y-2 mb-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-2 text-gray-700',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-brand-primary pl-4 italic text-gray-600 my-4',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 text-gray-800 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
          },
        },
        // Configure hardBreak to allow line breaks within blocks
        hardBreak: {
          keepMarks: false,
          HTMLAttributes: {
            class: 'line-break',
          },
        },
        // Enable basic formatting
        bold: true,
        italic: true,
        strike: false,
        history: true,
      }),
      // Add additional extensions that aren't part of StarterKit
      TextStyle.configure(),
      Strike,
      Underline,
      Placeholder.configure({
        // Dynamic placeholder per node
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            const level = (node.attrs && node.attrs.level) || 1;
            return `Heading ${level}`;
          }
          if (node.type.name === 'paragraph') {
            return placeholder;
          }
          return '';
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
        // Ensure placeholders are shown inside nested nodes (e.g., list items, blockquotes)
        includeChildren: true,
        emptyEditorClass: 'is-editor-empty',
      }),
      // Remove duplicate TextStyle to avoid extension name conflicts
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'px-1 rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-primary hover:text-brand-primary-hover underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg border border-gray-200 my-4',
        },
      }),
      Mathematics.configure({
        HTMLAttributes: {
          class: 'math-equation',
        },
        katexOptions: {
          throwOnError: false,
        },
      }),
      Dropcursor.configure({
        color: '#4A4BB6',
        width: 2,
      }),
      Gapcursor,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      // Ensure math nodes are draggable after content changes
      try {
        const root = editor.view.dom as HTMLElement;
        root.querySelectorAll('[data-type="block-math"]').forEach(el => {
          if (!(el as HTMLElement).getAttribute('draggable')) {
            (el as HTMLElement).setAttribute('draggable', 'true');
            (el as HTMLElement).classList.add('draggable-node');
            el.addEventListener('dragstart', () => (el as HTMLElement).classList.add('dragging'));
            el.addEventListener('dragend', () => (el as HTMLElement).classList.remove('dragging'));
          }
        });
        // Re-initialize drag handles for top-level blocks in case the DOM was re-rendered
        initializeDraggableBlocks(root, editor);
      } catch {}
      const newContent = editor.getHTML();
      const hasChanges = newContent !== initialContent;
      
      // Update local state
      setHasUnsavedChanges(hasChanges);
      
      // Call the original onChange callback
      onChange(newContent);
      
      // Call the new onContentChange callback with change detection
      onContentChange?.(newContent, hasChanges);

      // Trigger auto-save if enabled
      if (hasChanges) {
        triggerSave(newContent);
      }

      // Handle slash commands
      const { selection } = editor.state;
      const { empty, from } = selection;
      
      if (!empty) {
        setShowSlashMenu(false);
        return;
      }

      // Get the text content before the cursor
      const textBeforeCursor = editor.state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        "\n"
      );

      // Check if we're at the start of a line or block
      const isStartOfLine = textBeforeCursor.endsWith('\n') || textBeforeCursor === '';
      const lastWord = textBeforeCursor.split(/\s/).pop() || '';

      if (lastWord.startsWith('/')) {
        // Show slash menu and update query
        setShowSlashMenu(true);
        setSlashQuery(lastWord);
        
        // Get cursor position and convert to container-relative for absolute positioning
        const coords = editor.view.coordsAtPos(from);
        const containerRect = (editor.view.dom as HTMLElement).getBoundingClientRect();
        setSlashMenuPosition({ x: coords.left - containerRect.left, y: coords.top - containerRect.top });
      } else {
        setShowSlashMenu(false);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (!editable) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { setShowFloatingMenu(false); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { to } = editor.state.selection;
      if ((rect?.width || 0) > 0 || (rect?.height || 0) > 0) {
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        setFloatingMenuPosition({ x, y });
        setShowFloatingMenu(true);
      } else {
        const coords = editor.view.coordsAtPos(to);
        setFloatingMenuPosition({ x: coords.left, y: coords.top });
        setShowFloatingMenu(true);
      }
    },
    onCreate: ({ editor }) => {
      // Set initial content when editor is created
      setInitialContent(editor.getHTML());
      setHasUnsavedChanges(false);
      // Notify parent about editor instance
      if (typeof onEditorReady === 'function') {
        onEditorReady(editor);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[2rem] px-0 py-0',
      },
      handleClick: (view, pos, event) => {
        if (!editable) {
          // Allow native selection / dragging in read-only mode
          return false;
        }
        
        // Ensure the editor is focused
        if (!view.hasFocus()) {
          view.focus();
        }
        
        // Set cursor position to the exact click location
        const { state, dispatch } = view;
        const transaction = state.tr.setSelection(
          state.doc.resolve(pos).textSelection || 
          Selection.near(state.doc.resolve(pos))
        );
        dispatch(transaction);
        
        return false; // Let TipTap handle the click normally after our positioning
      },
      handleKeyDown: (view, event) => {
        if (!editable) {
          // Do not block keyboard selection/navigation in read-only mode
          return false;
        }

        // Spacebar-to-AI: when on an empty line, open chat and insert a visual placeholder
        if (event.key === ' ' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
          try {
            const { state } = view as any;
            const { $from } = state.selection;
            const parent = $from.parent;
            const isEmpty = !parent || parent.content.size === 0 || (parent.textContent || '').trim() === '';
            if (isEmpty) {
              event.preventDefault();
              // Insert a visible placeholder span the user will later replace with AI output
              const placeholderText = "Editing with AI...ask the AI to generate an image, diagram, or add other text to this section";
              // Guard: if there's already our placeholder in this block, don't duplicate
              const blockEl = (view.domAtPos($from.pos)?.node as HTMLElement) || (view.dom as HTMLElement);
              const existing = (blockEl && (blockEl.closest('.ProseMirror') as HTMLElement)?.querySelector('[data-ai-placeholder="true"]')) as HTMLElement | null;
              if (!existing) {
                editor?.chain().focus().insertContent(`<span class=\"ai-editing-placeholder\" data-ai-placeholder=\"true\">${placeholderText}</span>`).run();
              }
              // Focus the chat input textarea
              const textarea = document.querySelector('.copilot-input-container textarea') as HTMLTextAreaElement | null;
              textarea?.focus();
              return true;
            }
          } catch {}
        }
        
        // Handle keyboard shortcuts for formatting
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'b':
              event.preventDefault();
              editor?.chain().focus().toggleBold().run();
              return true;
            case 'i':
              event.preventDefault();
              editor?.chain().focus().toggleItalic().run();
              return true;
            case 'u':
              event.preventDefault();
              editor?.chain().focus().toggleUnderline().run();
              return true;
          }
        }
        
        // Handle Shift+Enter for line breaks within blocks
        if (event.key === 'Enter' && event.shiftKey) {
          const { state, dispatch } = view;
          const { selection } = state;
          
          // Insert a hard break (line break) instead of creating a new block
          const transaction = state.tr.replaceSelectionWith(
            state.schema.nodes.hardBreak.create()
          );
          dispatch(transaction);
          
          event.preventDefault();
          return true;
        }

        // Handle Enter on empty list item: exit the list to a new paragraph
        if (event.key === 'Enter' && !event.shiftKey) {
          try {
            const { state } = view;
            const { $from } = state.selection as any;
            const parent = $from.parent;
            const isListItem = parent?.type?.name === 'listItem';
            const isEmpty = !parent || parent.content.size === 0 || (parent.textContent || '').trim() === '';
            if (isListItem && isEmpty) {
              event.preventDefault();
              // Lift out of the list item into a paragraph
              editor?.chain().focus().liftListItem('listItem').run();
              return true;
            }
          } catch {}
        }

        return false; // Let TipTap handle other key events
      },
      handleDOMEvents: {
        // Ensure all DOM events work properly for editing
        mousedown: (view, event) => {
          if (!editable) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        focus: (view, event) => {
          if (editable && !view.hasFocus()) {
            view.focus();
          }
          return false;
        }
      }
    },
  });

  // In case onCreate doesn't fire reliably in StrictMode, notify parent when editor becomes available
  React.useEffect(() => {
    if (editor && typeof onEditorReady === 'function') {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update editor content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
      setInitialContent(content);
      setHasUnsavedChanges(false);
    }
  }, [editor, content]);

  // Make existing math nodes draggable once editor is ready
  React.useEffect(() => {
    if (!editor) return;
    try {
      const root = editor.view.dom as HTMLElement;
      // Initialize draggable behavior for top-level blocks and math nodes
      initializeDraggableBlocks(root, editor);
    } catch {}
  }, [editor]);

  // Helper to initialize draggable behavior for reordering top-level blocks
  function initializeDraggableBlocks(root: HTMLElement, ed: any) {
    const planContainer = root.closest('[data-lesson-plan-id]') as HTMLElement | null;
    const lessonPlanId = planContainer?.getAttribute('data-lesson-plan-id') || undefined;
    const getLatexFromBlock = (el: HTMLElement | null): string | undefined => {
      if (!el) return undefined;
      const direct = el.getAttribute('data-latex');
      if (direct) return direct;
      const inner = el.querySelector('.tiptap-mathematics-render') as HTMLElement | null;
      const latex = inner?.getAttribute('data-latex') || undefined;
      return latex;
    };
    // Make nearest block under pointer draggable just-in-time to ensure native drag starts
    const ensureDraggable = (target: HTMLElement | null) => {
      if (!target) return null;
      const block = target.closest(
        'p, h1, h2, h3, ul > li, ol > li, blockquote, pre, img, figure'
      ) as HTMLElement | null;
      if (!block) return null;
      if (!block.getAttribute('draggable')) {
        block.setAttribute('draggable', 'true');
        block.classList.add('draggable-block');
      }
      return block;
    };

    // JIT set draggable on pointerdown before drag begins
    const onPointerDown = (e: Event) => {
      ensureDraggable(e.target as HTMLElement);
    };
    root.addEventListener('pointerdown', onPointerDown, { passive: true });

    // Attach a capturing dragstart to set payloads robustly (only once)
    const rAny = root as any;
    if (!rAny.__vtDragStartBound) {
      const onRootDragStart = (e: DragEvent) => {
        try {
          const target = e.target as HTMLElement | null;
          if (!target || !e.dataTransfer) return;
          const block = target.closest('p, h1, h2, h3, ul > li, ol > li, blockquote, pre, img, figure, [data-type="block-math"]') as HTMLElement | null;
          if (!block) return;
          // If no standard payloads yet, set them now
          const img = block.tagName.toLowerCase() === 'img' ? (block as HTMLImageElement) : (block.querySelector('img') as HTMLImageElement | null);
          const text = (block.innerText || '').trim();
          if (!e.dataTransfer.getData('text/uri-list') && img?.src) {
            e.dataTransfer.setData('text/uri-list', img.src);
            e.dataTransfer.setData('text/plain', img.src);
          }
          if (!e.dataTransfer.getData('text/plain') && text) {
            e.dataTransfer.setData('text/plain', text);
          }
          if (!e.dataTransfer.getData('text/html')) {
            const outer = block.outerHTML || '';
            if (outer) e.dataTransfer.setData('text/html', outer);
          }
          // Custom payload
          const payload = {
            source: 'lesson',
            lessonItemId: lessonPlanId,
            elementType: (block.getAttribute('data-type') || block.tagName || '').toLowerCase(),
            text: text.slice(0, 5000),
            imageUrl: img?.src || undefined,
            latex: block.matches('[data-type="block-math"]') ? getLatexFromBlock(block) : undefined,
          };
          e.dataTransfer.setData('application/x-vt-lesson', JSON.stringify(payload));
          e.dataTransfer.effectAllowed = 'copy';
        } catch {}
      };
      root.addEventListener('dragstart', onRootDragStart, true);
      rAny.__vtDragStartBound = true;
    }

    // Top-level block nodes
    Array.from(root.children).forEach((el) => {
      const block = el as HTMLElement;
      if (!block || block.classList.contains('draggable-block')) return;

      block.classList.add('draggable-block');
      block.setAttribute('draggable', 'true');

      block.style.position = block.style.position || 'relative';

      function setDragRange(e: DragEvent) {
        const state = ed.view.state;
        const fromPos = ed.view.posAtDOM(block, 0);
        const node = state.doc.nodeAt(fromPos);
        let rangeFrom = fromPos;
        let rangeTo = fromPos + (node?.nodeSize || 0);
        if (!state.selection.empty) {
          const $f = state.selection.$from;
          const $t = state.selection.$to;
          rangeFrom = $f.before(1);
          rangeTo = $t.after(1);
        }
        e.dataTransfer?.setData('application/x-prosemirror-drag-pos', String(rangeFrom));
        e.dataTransfer?.setData('application/x-prosemirror-drag-range-from', String(rangeFrom));
        e.dataTransfer?.setData('application/x-prosemirror-drag-range-to', String(rangeTo));
        block.classList.add('dragging');
      }

      block.addEventListener('dragstart', (e: DragEvent) => {
        try {
          setDragRange(e);
          // Also expose generic payloads for external drop targets (e.g., tldraw canvas)
          const img = block.querySelector('img') as HTMLImageElement | null;
          if (img?.src) {
            e.dataTransfer?.setData('text/uri-list', img.src);
            e.dataTransfer?.setData('text/plain', img.src);
          } else {
            const text = (block.innerText || '').trim();
            if (text) {
              e.dataTransfer?.setData('text/plain', text);
            }
            // Provide minimal HTML for richer targets; keep it small to avoid issues
            const outer = block.outerHTML || '';
            if (outer) {
              e.dataTransfer?.setData('text/html', outer);
            }
          }
          // Custom payload for richer mapping on drop
          const payload = {
            source: 'lesson',
            lessonItemId: lessonPlanId,
            elementType: (block.tagName || '').toLowerCase(),
            text: (block.innerText || '').trim().slice(0, 5000),
            imageUrl: (block.querySelector('img') as HTMLImageElement | null)?.src || undefined,
          };
          e.dataTransfer?.setData('application/x-vt-lesson', JSON.stringify(payload));
        } catch {}
      });

      block.addEventListener('dragend', () => {
        block.classList.remove('dragging', 'drop-before', 'drop-after');
      });

      block.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        const rect = block.getBoundingClientRect();
        const isTop = (e.clientY - rect.top) < rect.height / 2;
        block.classList.toggle('drop-before', isTop);
        block.classList.toggle('drop-after', !isTop);
      });

      block.addEventListener('dragleave', () => {
        block.classList.remove('drop-before', 'drop-after');
      });

      block.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        try {
          const dt = e.dataTransfer;
          const rfStr = dt?.getData('application/x-prosemirror-drag-range-from');
          const rtStr = dt?.getData('application/x-prosemirror-drag-range-to');
          let from = -1, to = -1;
          if (rfStr && rtStr) {
            from = parseInt(rfStr, 10);
            to = parseInt(rtStr, 10);
          } else {
            const fromStr = dt?.getData('application/x-prosemirror-drag-pos');
            if (!fromStr) return;
            from = parseInt(fromStr, 10);
            const nodeSingle = ed.view.state.doc.nodeAt(from);
            to = from + (nodeSingle?.nodeSize || 0);
          }
          if (from < 0 || to <= from) return;
          
          const beforePos = ed.view.posAtDOM(block, 0);
          const afterPos = ed.view.posAtDOM(block, (block.childNodes?.length ?? 0));
          const isBefore = block.classList.contains('drop-before');
          let target = isBefore ? beforePos : afterPos;

          // Prevent dropping within the dragged range
          if (target >= from && target <= to) return;
          const state = ed.view.state;
          const slice = state.doc.slice(from, to);
          const movedSize = to - from;
          if (from < target) target -= movedSize;
          const tr = state.tr.delete(from, to).insert(target, slice.content);
          ed.view.dispatch(tr.scrollIntoView());
          // Explicitly trigger save after reorder
          try {
            const html = ed.getHTML();
            if (typeof onReorder === 'function') onReorder(html);
          } catch {}
        } catch (err) {
          console.error('Drop reorder failed:', err);
        } finally {
          block.classList.remove('drop-before', 'drop-after');
        }
      });
    });

    // Also attach handles to each list item so the handle sits outside bullets
    root.querySelectorAll('ul > li, ol > li').forEach((liEl) => {
      const li = liEl as HTMLElement;
      if (!li || li.classList.contains('draggable-block')) return;
      li.classList.add('draggable-block');
      li.setAttribute('draggable', 'true');
      li.style.position = li.style.position || 'relative';

      const setDragRange = (e: DragEvent) => {
        const state = ed.view.state;
        const fromPos = ed.view.posAtDOM(li, 0);
        const node = state.doc.nodeAt(fromPos);
        let rangeFrom = fromPos;
        let rangeTo = fromPos + (node?.nodeSize || 0);
        if (!state.selection.empty) {
          const $f = state.selection.$from; const $t = state.selection.$to;
          rangeFrom = $f.before(1); rangeTo = $t.after(1);
        }
        e.dataTransfer?.setData('application/x-prosemirror-drag-pos', String(rangeFrom));
        e.dataTransfer?.setData('application/x-prosemirror-drag-range-from', String(rangeFrom));
        e.dataTransfer?.setData('application/x-prosemirror-drag-range-to', String(rangeTo));
        li.classList.add('dragging');
      };

      li.addEventListener('dragstart', (e: DragEvent) => {
        try {
          setDragRange(e);
          // External payloads
          const img = li.querySelector('img') as HTMLImageElement | null;
          if (img?.src) {
            e.dataTransfer?.setData('text/uri-list', img.src);
            e.dataTransfer?.setData('text/plain', img.src);
          } else {
            const text = (li.innerText || '').trim();
            if (text) {
              e.dataTransfer?.setData('text/plain', text);
            }
            const outer = li.outerHTML || '';
            if (outer) {
              e.dataTransfer?.setData('text/html', outer);
            }
          }
          const payload = {
            source: 'lesson',
            lessonItemId: lessonPlanId,
            elementType: 'li',
            text: (li.innerText || '').trim().slice(0, 5000),
            imageUrl: (li.querySelector('img') as HTMLImageElement | null)?.src || undefined,
          };
          e.dataTransfer?.setData('application/x-vt-lesson', JSON.stringify(payload));
        } catch {}
      });
      li.addEventListener('dragend', () => { li.classList.remove('dragging','drop-before','drop-after'); });
      li.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault(); const rect = li.getBoundingClientRect();
        const isTop = (e.clientY - rect.top) < rect.height / 2;
        li.classList.toggle('drop-before', isTop);
        li.classList.toggle('drop-after', !isTop);
      });
      li.addEventListener('dragleave', () => { li.classList.remove('drop-before','drop-after'); });
      li.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        try {
          const rfStr = e.dataTransfer?.getData('application/x-prosemirror-drag-range-from');
          const rtStr = e.dataTransfer?.getData('application/x-prosemirror-drag-range-to');
          let from = -1, to = -1;
          if (rfStr && rtStr) { from = parseInt(rfStr,10); to = parseInt(rtStr,10); }
          else { const fromStr = e.dataTransfer?.getData('application/x-prosemirror-drag-pos'); if (!fromStr) return; from = parseInt(fromStr,10); const nodeSingle = ed.view.state.doc.nodeAt(from); to = from + (nodeSingle?.nodeSize||0); }
          if (from < 0 || to <= from) return;
          const beforePos = ed.view.posAtDOM(li, 0);
          const afterPos = ed.view.posAtDOM(li, (li.childNodes?.length ?? 0));
          const isBefore = li.classList.contains('drop-before'); let target = isBefore ? beforePos : afterPos;
          if (target >= from && target <= to) return;
          const state = ed.view.state; const slice = state.doc.slice(from, to); const movedSize = to - from;
          if (from < target) target -= movedSize;
          const tr = state.tr.delete(from, to).insert(target, slice.content);
          ed.view.dispatch(tr.scrollIntoView());
          try { if (typeof onReorder === 'function') onReorder(ed.getHTML()); } catch {}
        } catch (err) { console.error('Drop reorder failed:', err); }
        finally { li.classList.remove('drop-before','drop-after'); }
      });
    });

    // Math blocks (ensure draggable + cursor)
    root.querySelectorAll('[data-type="block-math"]').forEach((el) => {
      const bm = el as HTMLElement;
      bm.setAttribute('draggable', 'true');
      bm.classList.add('draggable-node');
      bm.addEventListener('dragstart', (e: DragEvent) => {
        try {
          const text = (bm.innerText || '').trim();
          if (text) e.dataTransfer?.setData('text/plain', text);
          const html = bm.outerHTML || '';
          if (html) e.dataTransfer?.setData('text/html', html);
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
          const payload = {
            source: 'lesson',
            lessonItemId: lessonPlanId,
            elementType: 'math-block',
            text: (bm.innerText || '').trim().slice(0, 5000),
            latex: getLatexFromBlock(bm) || undefined,
          };
          e.dataTransfer?.setData('application/x-vt-lesson', JSON.stringify(payload));
        } catch {}
      });
    });

    // Add explicit "+" button on images (even if nested)
    root.querySelectorAll('img').forEach((imgEl) => {
      const img = imgEl as HTMLImageElement;
      const parent = (img.closest('figure') as HTMLElement) || (img.parentElement as HTMLElement | null);
      if (!parent) return;
      parent.style.position = parent.style.position || 'relative';
      parent.classList.add('draggable-block');
    });

    // Hint to drop targets that copy is preferred
    root.addEventListener('dragstart', (e: DragEvent) => {
      try { if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy'; } catch {}
    });
  }

  // Ensure floating menu updates on mouseup/keyup selection changes
  React.useEffect(() => {
    if (!editor || !editable) return;
    const updateFromDOM = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { setShowFloatingMenu(false); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if ((rect?.width || 0) > 0 || (rect?.height || 0) > 0) {
        setFloatingMenuPosition({ x: rect.left + rect.width / 2, y: rect.top });
        setShowFloatingMenu(true);
      } else {
        const { to } = editor.state.selection;
        const coords = editor.view.coordsAtPos(to);
        setFloatingMenuPosition({ x: coords.left, y: coords.top });
        setShowFloatingMenu(true);
      }
    };
    document.addEventListener('mouseup', updateFromDOM);
    document.addEventListener('keyup', updateFromDOM);
    document.addEventListener('selectionchange', updateFromDOM);
    return () => {
      document.removeEventListener('mouseup', updateFromDOM);
      document.removeEventListener('keyup', updateFromDOM);
      document.removeEventListener('selectionchange', updateFromDOM);
    };
  }, [editor, editable]);

  // Update editable state when prop changes
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Method to mark content as saved (resets the change tracking)
  const markAsSaved = React.useCallback(() => {
    if (editor) {
      setInitialContent(editor.getHTML());
      setHasUnsavedChanges(false);
    }
  }, [editor]);

  // Create ref type
  interface EditorHandle {
    markAsSaved: () => void;
    hasUnsavedChanges: boolean;
  }

  // Expose methods via ref
  React.useImperativeHandle<unknown, EditorHandle>(
    React.createRef(), 
    () => ({
      markAsSaved,
      hasUnsavedChanges
    }), 
    [markAsSaved, hasUnsavedChanges]
  );
  
  const handleCloseFloatingMenu = () => {
    setShowFloatingMenu(false);
  };

  // Format the last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return lastSaved.toLocaleDateString();
  };

  return (
    <div className={`inline-editor relative ${className} ${editable ? 'cursor-text' : 'cursor-default'}`}>
      {/* Save status indicator */}
      {onSave && (
        <div className="absolute top-2 right-2 flex items-center gap-2 text-sm">
          {isSaving && (
            <span className="text-gray-500 flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          )}
          {!isSaving && !hasError && lastSaved && (
            <span className="text-green-600 flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Saved {getLastSavedText()}
            </span>
          )}
          {hasError && (
            <div className="text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="flex items-center gap-2">
                Save failed
                <button
                  onClick={() => retry()}
                  className="text-brand-primary hover:text-brand-primary-hover underline text-sm"
                >
                  Retry
                </button>
              </span>
            </div>
          )}
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="w-full"
      />
      
      {/* Floating formatting menu */}
      {editor && (
        <FloatingMenu
          editor={editor}
          isVisible={showFloatingMenu}
          position={floatingMenuPosition}
          onClose={handleCloseFloatingMenu}
          onAskAISelection={onAskAISelection}
        />
      )}

      {/* Floating Ask AI chip removed to reduce bugs */}

      {/* Slash commands menu */}
      {editor && (
        <SlashCommandsMenu
          editor={editor}
          isVisible={showSlashMenu}
          position={slashMenuPosition}
          onClose={() => setShowSlashMenu(false)}
          query={slashQuery}
        />
      )}
      
      {/* Custom styles for the editor */}
      <style>{`
        .inline-editor .ProseMirror {
          outline: none;
          border: none;
          box-shadow: none;
          background: transparent;
          white-space: pre-wrap;
        }

        /* Ensure selection is allowed in read-only mode */
        .inline-editor .ProseMirror[contenteditable="false"] {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        .inline-editor .ProseMirror[contenteditable="false"] * {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
        
        .inline-editor .ProseMirror {
          cursor: ${editable ? 'text' : 'default'};
        }
        
        .inline-editor .ProseMirror * {
          cursor: inherit;
        }
        
        /* Remove any default editor styling */
        .inline-editor .ProseMirror:focus {
          outline: none;
          border: none;
          box-shadow: none;
        }
        
        /* Remove padding and margins from editor container */
        .inline-editor .ProseMirror {
          padding: 0;
          margin: 0;
        }
        
        .inline-editor .ProseMirror h1,
        .inline-editor .ProseMirror h2,
        .inline-editor .ProseMirror h3,
        .inline-editor .ProseMirror p,
        .inline-editor .ProseMirror li,
        .inline-editor .ProseMirror ul,
        .inline-editor .ProseMirror ol,
        .inline-editor .ProseMirror blockquote {
          cursor: ${editable ? 'text' : 'default'} !important;
          position: relative;
        }
        
        /* Hover states for editable content */
        .inline-editor .ProseMirror h1:hover,
        .inline-editor .ProseMirror h2:hover,
        .inline-editor .ProseMirror h3:hover,
        .inline-editor .ProseMirror p:hover,
        .inline-editor .ProseMirror li:hover,
        .inline-editor .ProseMirror ul:hover,
        .inline-editor .ProseMirror ol:hover,
        .inline-editor .ProseMirror blockquote:hover {
          background-color: ${editable ? 'rgba(74, 75, 182, 0.02)' : 'transparent'};
          border-radius: 2px;
          transition: background-color 0.1s ease;
          cursor: ${editable ? 'text' : 'default'};
        }
        
        /* Active states for immediate feedback */
        .inline-editor .ProseMirror h1:active,
        .inline-editor .ProseMirror h2:active,
        .inline-editor .ProseMirror h3:active,
        .inline-editor .ProseMirror p:active,
        .inline-editor .ProseMirror li:active,
        .inline-editor .ProseMirror ul:active,
        .inline-editor .ProseMirror ol:active,
        .inline-editor .ProseMirror blockquote:active {
          background-color: ${editable ? 'rgba(74, 75, 182, 0.04)' : 'transparent'};
        }
        
        /* Ensure text cursor on all text content when editable */
        .inline-editor .ProseMirror[contenteditable="true"] h1,
        .inline-editor .ProseMirror[contenteditable="true"] h2,
        .inline-editor .ProseMirror[contenteditable="true"] h3,
        .inline-editor .ProseMirror[contenteditable="true"] p,
        .inline-editor .ProseMirror[contenteditable="true"] li,
        .inline-editor .ProseMirror[contenteditable="true"] strong,
        .inline-editor .ProseMirror[contenteditable="true"] em,
        .inline-editor .ProseMirror[contenteditable="true"] code,
        .inline-editor .ProseMirror[contenteditable="true"] span {
          cursor: text !important;
        }
        
        /* Ensure default cursor on all content when not editable */
        .inline-editor .ProseMirror[contenteditable="false"] *,
        .inline-editor .ProseMirror:not([contenteditable]) * {
          cursor: default !important;
        }
        
        /* Special handling for empty editor placeholder */
        .inline-editor .ProseMirror.is-editor-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          cursor: ${editable ? 'text' : 'default'};
        }

        /* Show placeholder text inside any empty node that TipTap marks */
        .inline-editor .ProseMirror [data-placeholder]::before,
        .inline-editor .ProseMirror .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af; /* gray-400 */
          pointer-events: none;
          height: 0;
          opacity: 1;
        }
        
        /* Line break styling */
        .inline-editor .ProseMirror br.line-break {
          display: block;
          content: "";
          margin: 0.25em 0;
        }
        
        /* Multi-line paragraph support */
        .inline-editor .ProseMirror p {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Multi-line list item support */
        .inline-editor .ProseMirror li {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Margin adjustments */
        .inline-editor .ProseMirror h1:first-child,
        .inline-editor .ProseMirror h2:first-child,
        .inline-editor .ProseMirror h3:first-child {
          margin-top: 0;
        }

        /* Heading typography */
        .inline-editor .ProseMirror h1 {
          font-size: 1.5rem; /* 24px */
          line-height: 1.25;
          font-weight: 700;
          color: #111827; /* gray-900 */
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .inline-editor .ProseMirror h2 {
          font-size: 1.25rem; /* 20px */
          line-height: 1.3;
          font-weight: 600;
          color: #111827;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .inline-editor .ProseMirror h3 {
          font-size: 1.125rem; /* 18px */
          line-height: 1.35;
          font-weight: 600;
          color: #111827;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .inline-editor .ProseMirror p:last-child,
        .inline-editor .ProseMirror ul:last-child,
        .inline-editor .ProseMirror ol:last-child {
          margin-bottom: 0;
        }
        
        /* Selection styling */
        .inline-editor .ProseMirror ::selection {
          background-color: rgba(74, 75, 182, 0.2);
        }
        
        /* Link styling */
        .inline-editor .ProseMirror a {
          color: #4A4BB6;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .inline-editor .ProseMirror a:hover {
          color: #3d3e9a;
        }

        /* Block math centering */
        .inline-editor .ProseMirror .block-math-inner {
          text-align: center;
          margin: 1rem 0;
          font-size: 1.25em; /* Increase block math size */
        }

        /* Increase inline math size slightly for legibility */
        .inline-editor .ProseMirror .tiptap-mathematics-render {
          font-size: 1.15em;
        }

        /* Visual cue for draggable block nodes */
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node {
          cursor: grab;
          border-radius: 6px;
          transition: background-color 0.12s ease, box-shadow 0.12s ease, outline-color 0.12s ease;
        }
        /* Ensure all children inside the math block inherit the grab cursor */
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node * {
          cursor: inherit !important;
        }
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node.dragging {
          cursor: grabbing;
          opacity: 0.85;
        }
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node:hover {
          background: rgba(74, 75, 182, 0.03); /* subtle brand tint */
          outline: 1px dashed rgba(74, 75, 182, 0.35);
          outline-offset: 3px;
          box-shadow: 0 0 0 2px rgba(74, 75, 182, 0.06) inset;
        }
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node:active {
          background: rgba(74, 75, 182, 0.06);
        }
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node:focus,
        .inline-editor .ProseMirror [data-type="block-math"].draggable-node:focus-within {
          outline: 1px dashed rgba(74, 75, 182, 0.45);
          outline-offset: 3px;
        }

        /* Generic draggable top-level blocks */
        .inline-editor .ProseMirror > .draggable-block {
          position: relative;
          cursor: grab;
        }
        .inline-editor .ProseMirror > .draggable-block.dragging {
          cursor: grabbing;
          opacity: 0.9;
        }
        .inline-editor .ProseMirror > .draggable-block:hover {
          background: rgba(74, 75, 182, 0.02);
        }
        /* Add-to-board button - hidden when not in edit mode */
        .inline-editor .ProseMirror .vt-add-to-board {
          display: none !important;
        }
        /* Hide drag handle UI entirely */
        .inline-editor .ProseMirror > .draggable-block .drag-handle { display: none !important; }
        .inline-editor .ProseMirror > .draggable-block::before { content: none !important; display: none !important; }
        /* Drop indicators for top/bottom */
        .inline-editor .ProseMirror > .draggable-block.drop-before::after,
        .inline-editor .ProseMirror > .draggable-block.drop-after::after {
          content: '';
          position: absolute;
          left: -18px;
          right: -4px;
          height: 2px;
          background: rgba(74, 75, 182, 0.55);
        }
        .inline-editor .ProseMirror > .draggable-block.drop-before::after {
          top: -3px;
        }
        .inline-editor .ProseMirror > .draggable-block.drop-after::after {
          bottom: -3px;
        }

        /* Highlight styling with dynamic colors */
        .inline-editor .ProseMirror mark {
          padding: 0.1em 0.2em;
          border-radius: 0.2em;
        }

        /* AI editing placeholder styling */
        .inline-editor .ProseMirror .ai-editing-placeholder {
          display: block;
          background: #f3f4f6; /* gray-100 */
          color: #374151; /* gray-700 */
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};
