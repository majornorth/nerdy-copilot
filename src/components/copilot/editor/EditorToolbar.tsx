import React from 'react';
import { Editor } from '@tiptap/react';
import { cn } from '../../../utils/cn';
import { Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon, ListBullets, ListNumbers, TextHOne, TextHTwo, TextHThree, TextT } from '../../ui/Icon';

interface EditorToolbarProps {
  editor: Editor | null;
  className?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, className }) => {
  if (!editor) return null;

  const promptForLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', previousUrl);
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const applyHeading = (level: 1 | 2 | 3) => {
    // Try toggle; if it fails (e.g., inside lists or unsupported context), force via setParagraph -> setHeading
    const toggled = editor.chain().focus().toggleHeading({ level }).run();
    if (!toggled) {
      editor.chain().focus().clearNodes().setParagraph().setHeading({ level }).run();
    }
  };

  const applyParagraph = () => {
    editor.chain().focus().clearNodes().setParagraph().run();
  };

  return (
    <div className={cn('w-full bg-white border-b border-gray-100', className)}>
      <div className="px-4 py-2 flex flex-wrap items-center gap-1">
        {/* Text (paragraph) */}
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('paragraph') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={applyParagraph}
          title="Text"
        >
          <TextT size={16} />
        </button>

        {/* Divider between Text and Bold */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('bold') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('italic') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('underline') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('strike') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('code') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <Code size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('heading', { level: 1 }) && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => applyHeading(1)}
          title="Heading 1"
        >
          <TextHOne size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('heading', { level: 2 }) && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => applyHeading(2)}
          title="Heading 2"
        >
          <TextHTwo size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('heading', { level: 3 }) && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => applyHeading(3)}
          title="Heading 3"
        >
          <TextHThree size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('bulletList') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bulleted list"
        >
          <ListBullets size={16} />
        </button>
        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('orderedList') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListNumbers size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          className={cn('px-2 py-1 rounded hover:bg-gray-100', editor.isActive('link') && 'bg-brand-primary/10 text-brand-primary')}
          onClick={promptForLink}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Optional: future Ask AI button could be wired here */}
        {/* <button className="px-2 py-1 rounded hover:bg-gray-100" title="Ask AI">
          <Sparkle size={16} />
        </button> */}
      </div>
    </div>
  );
};
