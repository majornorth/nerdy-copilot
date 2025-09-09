import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import katex from 'katex';

interface MathEquationModalProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export const MathEquationModal: React.FC<MathEquationModalProps> = ({ editor, isOpen, onClose }) => {
  const [latex, setLatex] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLatex('');
      setPreviewHtml('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const html = katex.renderToString(latex || '', { throwOnError: false });
      setPreviewHtml(html);
      setError(null);
    } catch {
      setError('Unable to render preview');
    }
  }, [latex, isOpen]);

  if (!isOpen) return null;

  const insert = () => {
    const v = latex.trim();
    if (!v) return;
    editor.chain().focus().insertBlockMath({ latex: v }).run();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[28rem] max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 p-3">
        <div className="mb-2">
          <label className="text-sm font-medium text-gray-700">LaTeX</label>
          <input
            className="mt-1 w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            placeholder="e.g., E = mc^2"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <div className="text-sm text-gray-700 mb-1">Preview</div>
          <div className="min-h-[48px] p-2 border border-gray-100 rounded bg-gray-50">
            {error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={insert}
            className="px-3 py-1.5 text-sm rounded bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

