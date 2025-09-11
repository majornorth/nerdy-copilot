import React from 'react';
import { Tldraw, useEditor } from '@tldraw/tldraw';
import { registerInsertHandler, InsertPayload } from '../../services/whiteboardBridge';
import { latexToSvgFile } from '../../utils/latexToSvg';
import '@tldraw/tldraw/tldraw.css';

/**
 * Minimal Live Learning Space
 * - Full-height tldraw canvas
 * - Simple toolbar to insert text or image-by-URL
 */
export const LiveLearningSpace: React.FC = () => {
  return (
    <div className="h-full relative">
      <Tldraw persistenceKey="live-demo">
        <BoardDropBridge />
      </Tldraw>
    </div>
  );
};

const BoardDropBridge: React.FC = () => {
  const editor = useEditor();
  const lastRef = React.useRef<{ t: number; n: number }>({ t: 0, n: 0 });
  React.useEffect(() => {
    // Register programmatic insert handler for "Add to board" actions
    const unregister = (() => {
      const ins = async (payload: InsertPayload) => {
        const vp = editor.getViewportScreenBounds();
        const pt = editor.screenToPage({ x: vp.midX, y: vp.midY });
        if ((payload as any).type === 'url') {
          await placeUrlAsImagePrefer((payload as any).url, pt);
        } else if ((payload as any).type === 'math') {
          const file = await latexToSvgFile((payload as any).latex, (payload as any).display ?? true);
          await editor.putExternalContent({ type: 'files', files: [file], point: pt });
        } else if ((payload as any).type === 'html') {
          // Strip to text for now
          const tmp = document.createElement('div');
          tmp.innerHTML = (payload as any).html;
          const text = (tmp.innerText || tmp.textContent || '').trim();
          if (text) await editor.putExternalContent({ type: 'text', text, point: pt });
        } else {
          await editor.putExternalContent({ type: 'text', text: (payload as any).text, point: pt });
        }
      };
      registerInsertHandler(ins);
      return () => registerInsertHandler(() => {});
    })();

    const container = editor.getContainer();

    const onDragOver = (e: DragEvent) => {
      // Allow drops from external sources
      e.preventDefault();
      try { if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; } catch {}
    };

    const onDrop = async (e: DragEvent) => {
      try {
        e.preventDefault();
        const dt = e.dataTransfer;
        if (!dt) return;

        // Determine point on page where to insert
        let pagePt = editor.screenToPage({ x: e.clientX, y: e.clientY });
        // Small offset for repeated inserts within 1s to avoid overlap
        const now = Date.now();
        if (now - lastRef.current.t < 1000) {
          lastRef.current.n = (lastRef.current.n + 1) % 6;
        } else {
          lastRef.current.n = 0;
        }
        lastRef.current.t = now;
        const offset = lastRef.current.n * 16;
        pagePt = { x: pagePt.x + offset, y: pagePt.y + offset };

        const custom = dt.getData('application/x-vt-lesson') || '';
        let customPayload: any = null;
        try { if (custom) customPayload = JSON.parse(custom); } catch {}
        const uriList = dt.getData('text/uri-list') || '';
        const textPlain = dt.getData('text/plain') || '';
        const textHtml = dt.getData('text/html') || '';

        // Prefer custom payload first (e.g., math latex) before generic text/url
        if (customPayload) {
          const img = customPayload.imageUrl as string | undefined;
          const txt = (customPayload.text as string | undefined)?.trim();
          const latex = (customPayload.latex as string | undefined)?.trim();
          const isMath = ((customPayload.elementType as string | undefined) === 'math-block') || !!latex;
          if (isMath && latex) {
            const file = await latexToSvgFile(latex, true);
            await editor.putExternalContent({ type: 'files', files: [file], point: pagePt });
            return;
          }
          if (img) {
            await placeUrlAsImagePrefer(img, pagePt);
            return;
          }
          if (txt) {
            await editor.putExternalContent({ type: 'text', text: txt, point: pagePt });
            return;
          }
        }

        // If HTML contains a KaTeX/TipTap math render with data-latex, prefer math SVG
        if (textHtml && textHtml.includes('data-latex')) {
          const match = textHtml.match(/data-latex=["']([^"']+)["']/);
          const latex = (match?.[1] || '').trim();
          if (latex) {
            const file = await latexToSvgFile(latex, true);
            await editor.putExternalContent({ type: 'files', files: [file], point: pagePt });
            return;
          }
        }

        if (uriList) {
          await placeUrlAsImagePrefer(uriList, pagePt);
          return;
        }
        // If plain text looks like a URL, treat as URL; else try math, then text shape
        if (textPlain) {
          const txt = textPlain.trim();
          const looksUrl = /^https?:\/\//i.test(txt);
          if (looksUrl) {
            await placeUrlAsImagePrefer(txt, pagePt);
          } else if (looksLikeLatex(txt)) {
            try {
              const file = await latexToSvgFile(txt, true);
              await editor.putExternalContent({ type: 'files', files: [file], point: pagePt });
            } catch {
              await editor.putExternalContent({ type: 'text', text: txt, point: pagePt });
            }
          } else {
            await editor.putExternalContent({ type: 'text', text: txt, point: pagePt });
          }
          return;
        }
        if (textHtml) {
          // Fallback: strip tags to text
          const tmp = document.createElement('div');
          tmp.innerHTML = textHtml;
          const text = tmp.innerText || tmp.textContent || '';
          if (text.trim()) {
            await editor.putExternalContent({ type: 'text', text: text.trim(), point: pagePt });
          }
          return;
        }
      } catch (err) {
        console.warn('BoardDropBridge drop failed', err);
      }
    };

    // Helper: Prefer inserting URL as an image (fetch -> File), fallback to bookmark if needed
    const placeUrlAsImagePrefer = async (url: string, point: { x: number; y: number }) => {
      try {
        const resp = await fetch(url, { mode: 'cors' });
        const blob = await resp.blob();
        // Gate on actual image content-type
        if (!blob.type.startsWith('image/')) throw new Error('Not an image');
        const fileName = url.split('/').pop() || 'image';
        const file = new File([blob], fileName, { type: blob.type || 'image/png' });
        await editor.putExternalContent({ type: 'files', files: [file], point });
      } catch (err) {
        // Fallback to url embed/bookmark
        await editor.putExternalContent({ type: 'url', url, point });
      }
    };

    function looksLikeLatex(s: string): boolean {
      // Heuristic: contains TeX control sequences or superscripts/subscripts
      return /\\(frac|sqrt|sum|int|left|right|begin|end|alpha|beta|gamma)|\^|_/.test(s);
    }

    container.addEventListener('dragover', onDragOver);
    container.addEventListener('drop', onDrop);
    return () => {
      container.removeEventListener('dragover', onDragOver);
      container.removeEventListener('drop', onDrop);
      unregister?.();
    };
  }, [editor]);
  return null;
};

export default LiveLearningSpace;
