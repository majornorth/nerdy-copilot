## Relevant Files

- `tasks/prd-drag-drop-lesson-elements.md` - Source PRD defining drag-and-drop scope and requirements.
- `src/components/live/LiveLearningSpace.tsx` - Whiteboard (tldraw) view; implement drop bridge and placement logic.
- `src/components/copilot/views/LessonPlanDetail.tsx` - Session Prep detail; expose elements for drag and "Add to board" actions.
- `src/components/copilot/editor/InlineEditor.tsx` - Ensure non-editable lesson content blocks emit correct DataTransfer payloads.
- `src/components/copilot/CopilotBody.tsx` - Renders Session Prep views; ensure correct view for `/live`.
- `src/services/whiteboardBridge.ts` - New: shared insertion bridge from sidebar to board (programmatic adds).
- `src/services/whiteboardService.ts` - New: Supabase load/save board JSON with debounce and beforeunload flush.
- `src/services/uploadService.ts` - Asset upload to Supabase Storage for images/diagrams.
- `src/stores/copilotStore.ts` - Optional: store state for selected lesson items and insertion actions.
- `src/data/mockSessionBriefs.ts` - Sample lesson data used in Session Prep.
- `supabase/migrations/` - Migration for `whiteboards` table and optional bucket/policy tweaks.

### Notes

- Keep drag sources working when the editor is not in edit mode.
- Favor HTML5 DnD (`text/plain`, `text/uri-list`, `text/html`) to maximize compatibility with tldraw `putExternalContent`.
- "Add to board" should call the same insertion path as drops to avoid divergence.

## Tasks

- [ ] 1.0 Implement drag sources in lesson panel (non-edit mode)
  - [ ] 1.1 Ensure non-editable lesson content blocks (H1–H3, paragraphs, list items, images, math blocks) get `draggable="true"` on pointerdown
  - [ ] 1.2 On `dragstart`, set DataTransfer payloads: `text/plain` (clean text), `text/uri-list` (for images), `text/html` (lightweight)
  - [ ] 1.3 Include custom JSON payload `application/x-vt-lesson` with `lessonItemId`, `elementType`, and raw text/URL when available
  - [ ] 1.4 Add subtle grab cursor on hover; avoid interfering with link clicks or selection
  - [ ] 1.5 Verify math blocks emit readable text (or optional data URL image later)
  - [ ] 1.6 Cross-browser sanity (Chrome/Safari/Edge): confirm drag starts without entering edit mode

- [ ] 2.0 Add board drop bridge and content mapping in tldraw
  - [ ] 2.1 Add a `BoardDropBridge` inside `LiveLearningSpace` to handle `dragover`/`drop`
  - [ ] 2.2 Parse DataTransfer preference: `text/uri-list` → image; else `text/plain` → text; else strip `text/html` → text
  - [ ] 2.3 Call `editor.putExternalContent({ type: 'url' | 'text', point })`; group practice problems when identified via custom payload
  - [ ] 2.4 Offset repeated inserts slightly to avoid overlap; clamp text width and image size
  - [ ] 2.5 Log and surface non-blocking toasts on mapping failures

- [ ] 3.0 Provide keyboard-accessible "Add to board" actions
  - [ ] 3.1 Create `src/services/whiteboardBridge.ts` with `registerInsert(handler)` and `insert(content)`
  - [ ] 3.2 Register the insert handler in `LiveLearningSpace` to call tldraw with pointer-centered placement
  - [ ] 3.3 In `LessonPlanDetail`, add per-element "Add to board" buttons (visible on focus/hover) that call `whiteboardBridge.insert(...)`
  - [ ] 3.4 Ensure buttons are tabbable, announce with ARIA, and work when not in edit mode

- [ ] 4.0 Handle images and assets (direct URL vs Storage upload)
  - [ ] 4.1 For `text/uri-list`, attempt direct insert; if CORS-blocked or data URL too large, upload to Supabase Storage
  - [ ] 4.2 For dropped `File` objects, upload via `uploadService` then insert returned URL
  - [ ] 4.3 Clamp image dimensions (max width 640px), preserve aspect ratio, compute natural size when possible
  - [ ] 4.4 Fallback to a text placeholder on upload errors, with a retry action

- [ ] 5.0 Add metadata to inserted shapes (lessonItemId, source)
  - [ ] 5.1 Define a metadata interface `{ source: 'lesson' | 'ai' | 'upload', lessonItemId?: string, elementType?: string, createdAt: string }`
  - [ ] 5.2 Store metadata on assets via `asset.meta`; for shapes, maintain a sidecar map `{ [shapeId]: Meta }` in the persisted board JSON
  - [ ] 5.3 Add helpers to attach metadata at creation time and restore it on load
  - [ ] 5.4 Expose a debug inspector to verify metadata on selected shape

- [ ] 6.0 Integrate Supabase autosave/restore for board state
  - [ ] 6.1 Create `whiteboardService.loadBoard('demo')` and `saveBoard('demo', data)` using a `whiteboards` table
  - [ ] 6.2 Debounce saves (1–2s) on store changes; add `beforeunload` flush
  - [ ] 6.3 Local fallback (IndexedDB/localStorage) when Supabase unavailable; last-write-wins on reconnect
  - [ ] 6.4 Migration: create `whiteboards(board_id text primary key, data jsonb, updated_at timestamptz)` and enable permissive RLS for demo

- [ ] 7.0 Error handling for blocked/large assets and unsupported content
  - [ ] 7.1 Detect oversized images (>10MB) and downscale client-side before upload
  - [ ] 7.2 Handle cross-origin fetch failures with graceful fallback messaging
  - [ ] 7.3 Unsupported HTML → plain text conversion; show a toast on lossy conversions
  - [ ] 7.4 Centralize errors in a lightweight notifier component

- [ ] 8.0 Accessibility and UX polish (drag affordances, auto-scroll)
  - [ ] 8.1 Add grab cursor/hover state to draggable elements; keep pointer semantics for links
  - [ ] 8.2 Implement sidebar auto-scroll during drag near edges
  - [ ] 8.3 Add drop zone highlight and pointer placement indicator
  - [ ] 8.4 Verify ARIA labels and keyboard flow for "Add to board" actions

- [ ] 9.0 Smoke tests on `/live` and demo script
  - [ ] 9.1 Drag text, list item, image, math, and a practice problem block → verify shapes created correctly
  - [ ] 9.2 Refresh `/live` → board restores
  - [ ] 9.3 Test failures: blocked image URL, large file, unsupported HTML → verify fallbacks
  - [ ] 9.4 Performance sanity with ~50 inserted elements

- [ ] 10.0 Update docs: env, usage, and limitations
  - [ ] 10.1 README: how to run `/live`, drag sources, and known limitations
  - [ ] 10.2 `.env.example`: confirm Supabase vars required for persistence and Storage
  - [ ] 10.3 Supabase migration notes and bucket policy reminder
