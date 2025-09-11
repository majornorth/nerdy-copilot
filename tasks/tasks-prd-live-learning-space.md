## Relevant Files

- `tasks/prd-live-learning-space.md` - Source PRD for scoping and requirements.
- `package.json` - Add `@tldraw/tldraw` dependency and scripts if needed.
- `src/App.tsx` - Detect `/live` path and render the Live Learning Space; auto-open Session Prep.
- `src/main.tsx` - Entry; no routing lib used, path check will occur in `App`.
- `src/index.css` - Ensure any required tldraw styles are imported if global CSS is used.
- `src/components/live/LiveLearningSpace.tsx` - New component rendering the tldraw canvas and demo controls.
- `src/services/whiteboardService.ts` - New service for Supabase JSON persistence (board_id = 'demo').
- `src/services/uploadService.ts` - Existing image upload utility; extend/reuse for whiteboard assets.
- `src/services/openaiService.ts` - Generate AI content to insert into whiteboard as shapes.
- `src/components/copilot/CopilotPanel.tsx` - Ensure Session Prep is visible in `/live`; add “Add to board” actions.
- `src/components/copilot/views/LessonPlanDetail.tsx` - Hook lesson items to “Add to board” actions.
- `src/stores/copilotStore.ts` - If needed, expose selected lesson items and actions for insertion.
- `supabase/migrations/` - Add migrations for `whiteboards` table and (optional) `whiteboard-assets` bucket/policies.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- For this demo, keep the route simple (`/live`) and avoid adding a router; use `location.pathname` checks.
- Reuse `src/services/uploadService.ts` and existing public bucket (`lesson-plan-images`) for simplicity, or create a dedicated `whiteboard-assets` bucket via migration.

## Tasks

- [ ] 1.0 Add tldraw dependency and basic setup
  - [ ] 1.1 Add `@tldraw/tldraw` to dependencies in `package.json` and install
  - [ ] 1.2 Import any required tldraw styles (if applicable) in `src/index.css` or the component
  - [ ] 1.3 Verify TypeScript types compile; add a `types/tldraw.d.ts` shim if needed
  - [ ] 1.4 Create a minimal example shape insertion helper to confirm the library renders

- [ ] 2.0 Implement LiveLearningSpace component with tldraw canvas
  - [ ] 2.1 Create `src/components/live/LiveLearningSpace.tsx` rendering a full-height tldraw canvas
  - [ ] 2.2 Initialize a tldraw store and keep a ref for programmatic inserts
  - [ ] 2.3 Add helper functions: `insertText`, `insertImage`, `insertGroup` (for practice problems)
  - [ ] 2.4 Add simple toolbar buttons for quick verification (e.g., “Add Text”, “Add Image by URL”)
  - [ ] 2.5 Expose an insertion bridge (see 6.x) that other components can call

- [ ] 3.0 Wire `/live` path in App to render the whiteboard and auto-open Session Prep
  - [ ] 3.1 In `src/App.tsx`, detect `location.pathname === '/live'`
  - [ ] 3.2 If `/live`, render `LiveLearningSpace` as the main content instead of dashboard
  - [ ] 3.3 Auto-open Copilot side panel (Session Prep) on mount when on `/live`
  - [ ] 3.4 Use `useCopilotStore()` to set `currentView` to `lesson-plan-detail` (or suitable prep view)
  - [ ] 3.5 Select a default sample lesson plan ID in the store for the demo

- [ ] 4.0 Build Supabase persistence (JSON state, board_id = 'demo') with debounced autosave
  - [ ] 4.1 Create `src/services/whiteboardService.ts` with `loadBoard(boardId)`, `saveBoard(boardId, data)`
  - [ ] 4.2 Implement Upsert to `whiteboards` table keyed by `board_id = 'demo'`
  - [ ] 4.3 In `LiveLearningSpace`, on mount load JSON into the tldraw store (or default)
  - [ ] 4.4 Listen to store changes and debounce `saveBoard` (1–2s) to Supabase
  - [ ] 4.5 Add `beforeunload` flush to save immediately on tab close
  - [ ] 4.6 Fallback to localStorage/IndexedDB if Supabase is unavailable; push on reconnect (last-write-wins)

- [ ] 5.0 Hook up asset uploads via Supabase Storage and render image shapes
  - [ ] 5.1 Reuse `src/services/uploadService.ts` to upload files to `lesson-plan-images` bucket
  - [ ] 5.2 Add a dropzone or file picker in `LiveLearningSpace` to upload and insert
  - [ ] 5.3 Insert image shapes by URL; maintain aspect ratio and sane default size
  - [ ] 5.4 Enforce file size/type limits client-side (e.g., ≤ 10 MB; png/jpg/webp)

- [ ] 6.0 Integrate Session Prep: drag-and-drop and “Add to board” actions for lesson items
  - [ ] 6.1 Create `src/services/whiteboardBridge.ts` to register an insert handler from `LiveLearningSpace`
  - [ ] 6.2 In `LiveLearningSpace`, register an `insertItem(item)` function with the bridge
  - [ ] 6.3 In Session Prep components (e.g., `LessonPlanDetail.tsx` or list items), add “Add to board” button calling the bridge
  - [ ] 6.4 Map lesson items to shapes: text blocks → text shape, diagrams/images → image shape, problems → grouped shapes
  - [ ] 6.5 Optional: Add basic HTML5 drag-and-drop from sidebar and handle drop over the canvas to insert

- [ ] 7.0 Integrate AI: generate content via openaiService and insert as shapes
  - [ ] 7.1 Add quick actions in Session Prep (e.g., Explain concept, Create example, Practice problem)
  - [ ] 7.2 Use `openaiService.sendMessage` to generate text; on success, call bridge to insert text shape
  - [ ] 7.3 For images, reuse `openaiService.generateImage` (if available) or convert to text-only for MVP
  - [ ] 7.4 Store simple provenance on shapes (e.g., metadata fields on shape props)

- [ ] 8.0 Provide default sample lesson items for demo
  - [ ] 8.1 Add `src/data/whiteboardDemoItems.ts` with a small Algebra 1 sample set
  - [ ] 8.2 Ensure Session Prep sidebar shows these items when none selected
  - [ ] 8.3 Verify “Add to board” works for all sample types

- [ ] 9.0 Optional: Export board as PNG
  - [ ] 9.1 Add an “Export PNG” button in `LiveLearningSpace`
  - [ ] 9.2 Use tldraw export utilities to generate PNG from viewport or full board
  - [ ] 9.3 Optionally upload the PNG to Storage and show a link

- [ ] 10.0 Supabase migrations: `whiteboards` table and (optional) `whiteboard-assets` bucket
  - [ ] 10.1 Add migration to create `public.whiteboards (board_id text primary key, data jsonb, updated_at timestamptz)`
  - [ ] 10.2 Enable RLS or allow public read/write for demo (consistent with existing lesson_plans policies)
  - [ ] 10.3 (Optional) Add `whiteboard-assets` bucket; else reuse `lesson-plan-images`

- [ ] 11.0 Docs: env vars, migration steps, and demo instructions
  - [ ] 11.1 Document required env vars in `.env.example` and README
  - [ ] 11.2 Document how to run migrations locally with Supabase CLI
  - [ ] 11.3 Add a short demo script: open `/live`, show insertions, AI, persistence, and image upload

- [ ] 12.0 Smoke test the demo flow and persistence
  - [ ] 12.1 Verify `/live` loads within 2s and the board renders
  - [ ] 12.2 Insert text/image/problem via Session Prep; confirm appears on board
  - [ ] 12.3 Refresh `/live`; confirm board restores from Supabase
  - [ ] 12.4 Upload image; confirm URL is valid and shape renders
  - [ ] 12.5 Trigger AI quick action; confirm content appears and is saved
  - [ ] 12.6 Verify no console errors and acceptable performance with ~200 elements
