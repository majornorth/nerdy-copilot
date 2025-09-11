# PRD — Drag Lesson Plan Elements to Whiteboard (Tutor Demo)

## 1. Introduction/Overview

Enable tutors to drag and drop any element in the Session Prep lesson plan side panel onto the live whiteboard. This improves demo flow by letting tutors visually compose boards from planned materials without editing mode or complex setup. Works on `/live`, single-user demo (no auth), using tldraw for the whiteboard and Supabase for persistence.

## 2. Goals

- Allow dragging lesson plan elements from the side panel and dropping them onto the whiteboard.
- Map common element types to appropriate shapes (text, image, grouped items).
- Provide consistent placement/size rules and minimal formatting preservation.
- Persist resulting board state with Supabase so refresh restores the board.

## 3. User Stories

- As a tutor, I can drag a paragraph or heading from Session Prep and drop it on the whiteboard as a text shape to illustrate a concept.
- As a tutor, I can drag an image/diagram from Session Prep and drop it on the whiteboard to annotate visually.
- As a tutor, I can drag an individual list item (e.g., a practice problem) and drop it as a text block to arrange exercises.
- As a tutor, I can use a keyboard-accessible “Add to board” alternative if I prefer not to drag.
- As a tutor, I can refresh the page and see the same board so the demo continues smoothly.

## 4. Functional Requirements

1. Drag Sources (Side Panel)
   1.1 The system must allow dragging these lesson plan elements when the user is NOT in edit mode:
       - Headings (H1–H3)
       - Paragraph text blocks
       - List items (bulleted and numbered) as individual items
       - Images/diagrams
       - Math blocks (KaTeX-rendered)
       - Practice problem blocks (text + optional diagram)
   1.2 Dragging must set standard DataTransfer payloads:
       - `text/plain` with sensible text for text-like elements
       - `text/uri-list` for images/diagrams with a usable URL
       - `text/html` as a light-weight representation when possible (fallback to plain text)
   1.3 Each drag must default to a copy action (not move) from the lesson plan.

2. Drop Target (Whiteboard)
   2.1 The system must accept HTML5 drops over the tldraw canvas on `/live`.
   2.2 The system must place new content at the drop pointer position.
   2.3 Content mapping on drop:
       - Text (paragraphs, headings, list items, math blocks as text): insert a tldraw text shape.
       - Image/diagram URL: insert a tldraw image shape; maintain aspect ratio.
       - Practice problem block: insert a grouped set (title text + body text and/or image) when possible; otherwise insert as a single text block.
   2.4 Repeated inserts within 1s should offset slightly to avoid perfect overlap.
   2.5 Default size constraints:
       - Text: max width ~480px before wrapping; font size 18px for headings, 14–16px for body.
       - Images: clamp width to ≤ 640px; preserve aspect.

3. Formatting Preservation
   3.1 The system should preserve minimal formatting where practical: bold, italic, line breaks.
   3.2 Lists should render as multiline text (prefix with bullets or numbers).
   3.3 Complex HTML should gracefully degrade to plain text if unsupported.

4. Images and Assets
   4.1 If the dragged image has a public URL, use the URL directly for the image shape.
   4.2 If the image is not publicly accessible or cross-origin blocked, the system should upload the dropped file (or fetched blob) to Supabase Storage (bucket `lesson-plan-images`) and use that URL.
   4.3 Failures (upload or fetch) should insert a text placeholder indicating the issue.

5. Metadata & Linking
   5.1 Inserted shapes must store metadata when available: `source: 'lesson'`, `lessonItemId`, `elementType`, and `createdAt`.
   5.2 The system must not require a live link-back; board shape edits do not affect the lesson content.

6. Accessibility & Alternatives
   6.1 Provide a keyboard-accessible “Add to board” action for each element (button or contextual menu) that performs the same mapping as drag-and-drop.
   6.2 All drag handles and actions must have ARIA labels and visible focus styles.

7. Persistence
   7.1 Board state must autosave to Supabase as JSON keyed by `board_id = 'demo'` with a 1–2s debounce.
   7.2 A `beforeunload` flush must attempt a final save when the user navigates away.
   7.3 On page load, the system must restore the latest board for `board_id = 'demo'`.

8. Routing & Scope
   8.1 Feature must work at route `/live` with the Session Prep side panel visible and collapsible.
   8.2 No auth required; this is a tutor-only demo.

## 5. Non-Goals (Out of Scope)

- Live collaboration (yjs/CRDT), presence, or role-based editing.
- Two-way sync between board shapes and lesson content (no live link-back updates).
- Drag from the board back into the lesson plan.
- Advanced text styling beyond minimal preservation (no rich text editor in shapes).
- Full fidelity KaTeX rendering inside tldraw shapes; treat as text or image fallback.

## 6. Design Considerations (Optional)

- Drag affordance: show a subtle grab cursor on hover for draggable blocks; optional small drag handle icon.
- Ghost preview: a simple translucent rectangle for text, thumbnail for images.
- Drop feedback: highlight the canvas drop area and show a small placement indicator at the pointer.
- Sidebar auto-scroll: if user drags near top/bottom of sidebar, scroll to reveal off-screen items.

## 7. Technical Considerations (Optional)

- Drag sources: Use HTML5 DnD on non-editable lesson plan DOM to emit `text/plain`, `text/uri-list`, and `text/html`.
- Drop target: Implement a drop bridge inside tldraw to convert DataTransfer payloads to `editor.putExternalContent` calls.
- Image handling: Prefer direct URLs; if blocked, fetch-and-upload or user upload prompt to Supabase Storage.
- Grouped practice problems: Compose multiple shapes and group them; store `lessonItemId` on group and children.
- Autosave: Debounced `whiteboardService.saveBoard('demo', data)`; `beforeunload` flush.
- Performance: Avoid heavy HTML parsing; strip HTML to text when in doubt.

## 8. Success Metrics

- Drag success rate: ≥ 95% of attempted drags create a shape (no error).
- Time to insert: local insert ≤ 100ms; visible on canvas immediately.
- Demo reliability: autosave success ≥ 99% (p95) over 30-minute session.
- Usage: at least 3 elements added per demo scenario.

## 9. Open Questions

- Should math blocks drop as rendered images for better fidelity, or remain text for MVP?
- For practice problems, do we have a standard structure (title, prompt, steps, answer) to map into grouped shapes?
- Should “Add to board” generate a placement preview cursor or just place at viewport center when not dropping?
- Should images always be copied to Storage for stability, or only when the source is not publicly accessible?

