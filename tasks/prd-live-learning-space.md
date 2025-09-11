# PRD — Live Learning Space (Tutor-Only Demo)

## 1. Introduction/Overview

A tutor-only demo of a live learning space that combines a whiteboard (tldraw) with the Session Prep sidebar. The goal is to let a tutor quickly demonstrate placing lesson plan elements and AI-generated materials onto a canvas during user interviews. This demo avoids authentication and session-specific routing to keep setup simple and reliable.

## 2. Goals

- Enable a single-click entry to a persistent whiteboard demo page with the Session Prep sidebar visible.
- Allow inserting lesson items (text, images/diagrams, practice problems) from the sidebar onto the whiteboard.
- Allow generating AI content (explanations, examples, practice problems) and inserting onto the whiteboard.
- Persist the board state so a page reload shows the latest state (using Supabase, with a simple fixed demo key).

## 3. User Stories

- As a tutor, I open the demo page and immediately see the whiteboard with the Session Prep sidebar so I can start demonstrating.
- As a tutor, I drag or click to add lesson items from the Session Prep sidebar onto the whiteboard so I can show how prep materials become interactive visuals.
- As a tutor, I generate AI content from the sidebar and insert it as shapes on the board so I can illustrate AI-assisted lesson building.
- As a tutor, I refresh the page and see the same board so I can continue the demo without losing progress.

## 4. Functional Requirements

1. Route
   - The system must provide a simple, unauthenticated route (e.g., `/live`) that opens the demo whiteboard with the Session Prep sidebar.

2. Whiteboard (tldraw)
   - The system must support core whiteboard operations: create/select/move/resize shapes; add text; insert images; basic arrows/connectors; grouping; layers; undo/redo.

3. Session Prep Sidebar
   - The system must display a sidebar with lesson items (e.g., text blocks, images/diagrams, practice problems) and basic metadata (title/thumbnail/type).
   - The sidebar must be collapsible and resizable.

4. Insert from Sidebar
   - The system must allow drag-and-drop of items from the sidebar to the board.
   - The system must provide an “Add to board” button for each item that inserts it near the viewport center (with a small offset if multiple inserts are repeated).

5. AI-Generated Content
   - The system must allow generating content via the existing `src/services/openaiService.ts` (e.g., explanation, example, or practice problem) from the sidebar.
   - The system must insert generated content as text and/or image shapes and store simple provenance (e.g., `source: 'ai'`, `model`, `promptSummary`).

6. Persistence (Supabase)
   - The system must persist the board as a JSON document using Supabase so that reloading `/live` restores the latest state.
   - The persistence model must use a fixed demo identifier (e.g., `board_id = 'demo'`) rather than session-specific IDs.
   - The system should debounce autosave (e.g., 1–2 seconds) and show a lightweight non-blocking error if saving fails, with retries.

7. Assets (Supabase Storage)
   - The system must upload image assets to a Supabase Storage bucket and reference them in image shapes using public or signed URLs.
   - The client must enforce a reasonable file size limit (e.g., 5–10 MB) and preserve aspect ratio when inserting images.

8. Defaults and Empty States
   - If no lesson plan is selected, the system should present sample lesson items suitable for the demo (e.g., “Algebra 1 — Linear Equations”).
   - The board should start with a simple, clean canvas; optional helper text/tooltips are acceptable but not required.

9. Export (Optional)
   - The system may allow exporting the current viewport or entire board as a PNG to demonstrate sharing.

## 5. Non-Goals (Out of Scope)

- No authentication or role management.
- No multi-user collaboration, presence indicators, or yjs/CRDT synchronization.
- No session-specific boards or routing (a single demo route and single stored board is sufficient).
- No video conferencing or recording features.
- No granular per-item permissions or locking.

## 6. Design Considerations (Optional)

- Layout: Whiteboard as the main canvas (left/center), Session Prep sidebar on the right; sidebar is resizable and collapsible.
- Insertion behavior: Items added via button appear near the viewport center; repeated inserts offset slightly to avoid overlap; images preserve aspect ratio.
- Basic keyboard shortcuts for common actions (select, text, delete, undo/redo) to speed demo flow.
- Use existing app styles and theming; no additional branding requirements.

## 7. Technical Considerations (Optional)

- Route: `/live` (no params) to simplify demo access.
- Whiteboard: Use tldraw’s store; serialize/deserialize JSON for persistence.
- Supabase Persistence: Use a single row keyed by `board_id = 'demo'` for the JSON state; debounce autosaves; include a manual “Save snapshot” button if desired.
- Supabase Storage: Use a bucket (e.g., `whiteboard-assets`) for image uploads; prefer signed URLs if bucket is private; otherwise public for demo simplicity.
- Fallback: Optionally maintain a local IndexedDB/localStorage copy as a fallback if Supabase is temporarily unavailable; on next successful save, overwrite the server copy (last-write-wins is acceptable for this single-user demo).

## 8. Success Metrics

- Demo readiness: `/live` loads in ≤ 2 seconds with ≤ 200 elements on broadband.
- Reliability: Autosave success rate ≥ 99% (p95) during a 30-minute demo.
- Functionality coverage: Tutor can insert at least text, image/diagram, and practice problem items from the sidebar and generate at least one AI item into the board.

## 9. Open Questions

- Which sample lesson items should appear by default if none are selected? Provide titles/thumbnails if known.
- Should export (PNG) be included in the demo, or is persistence alone sufficient?
- Should AI quick actions be limited to a specific set (e.g., “Explain concept”, “Create example”, “Practice problem”), and do we need any guardrails/messages for long outputs?
- Should uploaded images be kept public for simplicity or private with signed URLs?
