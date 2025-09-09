# Chat-Driven Lesson Edits and AI Image/Diagram Generation PRD

## 1. Introduction/Overview

This feature enables tutors to edit lesson plans via a chat input and to generate images/diagrams directly from the lesson plan editor using an “Ask AI” action (triggered by spacebar). Tutors can request edits (e.g., “add 8 practice problems on factoring quadratics”) and the system will send the entire lesson plan as context to OpenAI, apply changes immediately, and surface a confirmation info box with options to Undo or Keep. Tutors can also invoke AI image/diagram generation at either the row level or the lesson plan level; the system will determine the insertion location based on where “Ask AI” was initiated. Formatting must match the lesson plan edit mode (TipTap HTML/JSON structure, including KaTeX and image nodes).

Primary goals:
- Reduce time to make bulk or nuanced edits to lesson plans.
- Provide rapid image/diagram generation for math/science concepts inline with content.

Target user: Tutors. Surfaces: All editor surfaces where lesson content is editable.

## 2. Goals

- Enable chat-driven content edits with full-lesson context for high-quality responses.
- Apply edits immediately while reusing the existing confirmation info box (Undo or Keep).
- Support image/diagram generation via spacebar-triggered “Ask AI” at row or plan level.
- Preserve existing formatting conventions in lesson plan edit mode (TipTap HTML/JSON blocks and node types).
- Store generated images reliably and attach alt text/captions; allow quick edits.
- Ensure all edits and insertions respect auto-save/versioning patterns already in place.

## 3. User Stories

- As a tutor, I can type a request like “add 8 practice problems on solving systems by substitution” and have the plan updated immediately, with an option to Undo or Keep.
- As a tutor, I can highlight a section and request “rewrite this objective for grade 6” and see the localized replacement applied immediately, with Undo/Keep.
- As a tutor, I can trigger “Ask AI” with the spacebar at a row to generate a diagram (e.g., a triangle with labeled angles) inserted at that row.
- As a tutor, I can trigger “Ask AI” at the plan level to insert a supportive image or diagram in a sensible location (e.g., at the end of the current section).
- As a tutor, I can rely on consistent formatting matching the rest of the plan (headings, lists, KaTeX), and the same confirmation UI.

## 4. Functional Requirements

Chat-Driven Edits
1. The system must send the entire lesson plan as prompt context (prefer TipTap JSON; fallback to full HTML) for chat-driven edit requests entered in the lesson plan chat input.
2. The context may include references to images and KaTeX equations; the system must preserve these in the edited output.
3. The system must apply changes immediately to the in-memory lesson plan model and render them in the editor.
4. After applying, the chat input area must be replaced by the existing gray info box prompting the tutor to Undo or Keep (reuse existing component and behavior).
5. If the tutor highlighted text or a specific row is selected, the system must treat the request as localized: pass the selection/row content as focus context and prefer replace/insert at that anchor.
6. If no selection is present, the system must let AI infer the best target section from the full context and apply updates accordingly.
7. The system must preserve formatting style already used in the editor (TipTap nodes such as paragraphs, lists, headings, images, and KaTeX).
8. The system must trigger auto-save (and any version history hooks) upon applying changes and again upon Undo/Keep resolution.
9. The system must provide a deterministic response application protocol for AI outputs:
   - For localized edits: expect a minimal payload with operation and HTML content.
   - For global edits: expect section-scoped replacements addressed by heading text or identifiers.

AI Images/Diagrams
10. Pressing spacebar on the “Ask AI” action in edit mode must open a prompt input to describe the image/diagram desired.
   - When pressed on an empty line, insert a visible AI placeholder element that acts as an anchor for subsequent AI output replacement. After apply/undo, the placeholder is removed.
11. The system must decide insertion location based on initiation scope:
    - Row-level: insert immediately at the cursor/row.
    - Plan-level: insert at a sensible default (e.g., end of current section) with fallback below the current block if no section is identified.
12. The system must support generating both images and diagrams for math and science (geometry, algebra, biology, chemistry, physics) with an instructional/technical diagram style.
13. When AI returns an image URL, insert a TipTap image node at the anchor with alt text and a caption paragraph sourced from the returned explanation text.
14. The system must attach alt text and a short caption. If not provided by the user, auto-generate them and allow quick edits.
15. The system must store generated images in the lesson plan images bucket and reference them in the editor (support external URL fallback if storage/upload fails; background import is acceptable).
16. The system must select output sizes automatically based on context (row vs plan-level) and layout; default to 1024x1024 and allow wider sizes for section-level diagrams.

Response Formats (for deterministic application)
16. Localized Edit Response (JSON in a fenced code block):
    ```json
    { "mode": "replace" | "insert-below", "content_html": "..." }
    ```
17. Global Edit Response (section patch list as JSON in a fenced code block):
    ```json
    { "patches": [ { "section_heading": "Objectives", "action": "replace", "content_html": "..." } ] }
    ```
18. Image/Diagram Response:
    - Primary JSON: { "image_url": "https://...", "explanation": "...", "alt": "...", "size": "1024x1024" }
    - Optional (math): include a Python/Matplotlib code block in the assistant message for reproducible diagrams (not auto-inserted as code in the plan).

Error and Edge Handling
19. If AI returns unusable format, show a non-blocking toast and fall back to inserting best-effort HTML content with Undo/Keep.
20. If image generation fails, insert the explanation text only and show a retry option.
21. Large documents: if token size exceeds threshold, prefer localized context (selection/section) or perform hierarchical summarization to keep requests within limits.

## 5. Non-Goals (Out of Scope)

- Adding new slash commands beyond the spacebar-triggered “Ask AI”.
- Changing existing editor structure or non-related toolbar features.
- Full visual diffing UI; use existing info box confirmation only.
- Comprehensive safety/moderation flows (ignored for now per input).

## 6. Design Considerations

- Reuse the existing gray info box UI for post-apply confirmation (Undo or Keep).
- Maintain the current lesson plan visual structure and typography (TipTap classes and node types).
- Image/diagram style: professional, clean, technical diagram aesthetic for educational clarity.
- Accessibility: ensure images include alt text; captions aid screen reader context.

## 7. Technical Considerations

- Models
  - Chat: use a tiered approach. Default to a high-quality, cost-effective model (e.g., GPT-4o mini) for most edits; route complex/global edits to GPT-4o when context is long or request complexity is high. Add environment-configurable defaults (e.g., `VITE_OPENAI_CHAT_MODEL` client-side and `OPENAI_CHAT_MODEL` in Edge); fall back to `gpt-3.5-turbo` when unavailable.
  - Images: use DALL·E 3 with a technical diagram prompt template; make size/style configurable via env flags; retain defaults for development parity.

- Existing Services Integration
  - Use existing services for text (sendMessage) and images (generateImageResponse/Edge openai-image).
  - Math/science: retain math detection that can supply Matplotlib code along with an image for precision; include code in the assistant message.
  - Auto-save: ensure updates use existing auto-save/version hooks in the editor store.

- Prompt Packaging
  - Chat edits: include full plan context (TipTap JSON preferred, HTML fallback). When selection exists, include both the full plan and a “focus excerpt,” with explicit instruction to return the deterministic JSON formats above.
  - Include notes about embedded images/KaTeX so the AI preserves them.
  - Enforce response format instructions and validate before applying.

- Application Logic
  - Localized: parse JSON; apply `replace` or `insert-below` with `content_html` at the anchor (placeholder/selection); render; show confirmation info box; trigger auto-save.
  - Global: parse section patches; map by heading text/IDs; apply replacements; render; show confirmation info box; trigger auto-save.
  - If JSON not present, treat the entire reply as `content_html` with `insert-below` and proceed.
  - Images: when response includes an image URL, insert an image node and a caption paragraph at the anchor; if configured, persist the image to the lesson-plan bucket and use that URL.

- Storage
  - Save generated images to the existing Supabase bucket for lesson plan images; persist file key and metadata (alt, caption, source, created_at).
  - Fallback to external URL reference if upload fails, with a background retry policy or background import.

- Token/Length Controls
  - Detect oversized context; for global edits switch to section-level inclusion or summarization of non-relevant sections.

## 8. Success Metrics

- Time-to-edit reduction: median time from request to applied change decreases by 50%.
- Usage: % of lesson plan sessions using chat-driven edits within first 2 weeks >= 30%.
- Completion: >90% of edits result in Keep (not Undo) on first try.
- Image success: >85% of image/diagram requests insert successfully with alt/caption.
- Error rate: <2% operations require manual recovery due to format/merge failures.

## 9. Acceptance Criteria

Chat-Driven Edits
- Entering “Add 8 factoring practice problems” updates the relevant practice section or creates one if missing, applies immediately, shows Undo/Keep info box, and triggers auto-save.
- Highlighting text and requesting a rewrite replaces only the highlighted portion, preserves KaTeX formatting, applies immediately, shows Undo/Keep, and triggers auto-save.
- With no selection, the system infers the correct section and applies changes that match editor formatting.
- Deterministic formats: localized/global JSON responses using `content_html` and patches are parsed and applied; on invalid format, app still inserts reasonable HTML content and shows a toast.

AI Images/Diagrams
- Pressing spacebar on “Ask AI” opens the prompt; entering “triangle with angles 30°, 60°, 90°” inserts a technical diagram at the row; image node includes alt and a caption paragraph; info box appears for Undo/Keep; auto-save runs.
- At plan level, “diagram of cell mitosis stages” inserts at the end of the current section with alt/caption; info box appears; auto-save runs.
- Math requests can include an image plus a Matplotlib code block in the assistant response.
- Failed image generation inserts explanation text only and offers retry; no crashes.
- Model configuration: chat/image models are selectable via environment variables; fallbacks apply seamlessly when preferred models are unavailable.

## 10. Open Questions

- Do we need SVG/vector support (e.g., Mermaid/PlantUML) in v1 or treat as a follow-up iteration?
- Should we parameterize model selection per environment (dev/stage/prod) and expose in settings?
- Any constraints on maximum image size or storage quotas for lesson plan images?
