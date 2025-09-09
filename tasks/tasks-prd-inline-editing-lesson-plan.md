## Relevant Files

- `src/components/copilot/views/LessonPlanDetail.tsx` - Main component for the lesson plan detail view, where the inline editor will be integrated.
- `src/stores/copilotStore.ts` - Zustand store for managing application state, including lesson plan data and save status.
- `src/services/openaiService.ts` - Existing service to be leveraged for AI integration.
- `src/types/index.ts` - May need updates for new data structures related to editable content blocks.
- `src/utils/cn.ts` - Utility for combining Tailwind CSS classes.
- `src/components/ui/Card.tsx` - Reusable UI component.
- `src/components/ui/Button.tsx` - Reusable UI component.
- `src/components/ui/Tooltip.tsx` - Reusable UI component.
- `src/components/ui/FormInput.tsx` - Reusable UI component.
- `src/components/ui/FormTextarea.tsx` - Reusable UI component.
- `src/components/ui/FormSelect.tsx` - Reusable UI component.
- `src/components/ui/SearchSelect.tsx` - Reusable UI component.
- `src/components/ui/ImageModal.tsx` - Reusable UI component.
- `src/components/copilot/CopilotInput.tsx` - Existing input component, AI integration will leverage `openaiService`.
- `src/components/copilot/CopilotBody.tsx` - Renders different views, including `LessonPlanDetail`.
- `src/components/copilot/CopilotLoadingAnimation.tsx` - Reusable UI component.
- `src/components/copilot/MessageFeedback.tsx` - Reusable UI component.
- `src/components/copilot/FileAttachment.tsx` - Reusable UI component.
- `src/components/copilot/FileAttachmentList.tsx` - Reusable UI component.
- `src/components/copilot/ToolsPopover.tsx` - Reusable UI component.
- `src/components/copilot/StudentSelector.tsx` - Reusable UI component.
- `src/components/copilot/CopilotHeader.tsx` - Reusable UI component.
- `src/components/copilot/CopilotTab.tsx` - Reusable UI component.
- `src/components/copilot/CopilotDialog.tsx` - Reusable UI component.
- `src/components/copilot/CopilotPanel.tsx` - Reusable UI component.
- `src/components/copilot/ActionButton.tsx` - Reusable UI component.
- `src/components/copilot/GradientText.tsx` - Reusable UI component.
- `src/components/copilot/views/SessionBriefsList.tsx` - View that links to Lesson Plan Detail.
- `src/components/copilot/views/SessionBriefDetail.tsx` - View that links to Lesson Plan Detail.
- `src/components/copilot/views/LessonPlanGenerator.tsx` - View that generates lesson plans.
- `src/components/copilot/views/ChatHistoryList.tsx` - View that displays chat history.
- `src/components/copilot/views/UploadsArtifactsList.tsx` - View that displays uploads and artifacts.
- `src/components/lessons/LessonCard.tsx` - Component that can link to Lesson Plan Detail.
- `src/components/lessons/UpcomingLessons.tsx` - Component that contains Lesson Cards.
- `src/components/ai/AIToolCard.tsx` - Component that can link to Lesson Plan Generator.
- `src/components/ai/AITools.tsx` - Component that contains AI Tool Cards.
- `src/components/availability/AvailabilitySchedule.tsx` - Component for availability.
- `src/components/resources/TutorResources.tsx` - Component for tutor resources.
- `src/components/layout/Header.tsx` - Main application header.
- `src/components/ui/TutorCopilotButton.tsx` - Reusable UI component.
- `src/components/ui/Dropdown.tsx` - Reusable UI component.
- `src/components/ui/PopoverHeader.tsx` - Reusable UI component.
- `src/components/ui/ResizeHandle.tsx` - Reusable UI component.
- `src/components/ui/ConfirmationModal.tsx` - Reusable UI component.
- `src/hooks/useCopilot.ts` - Custom hook for Copilot panel state.
- `src/hooks/useDraggable.ts` - Custom hook for draggable elements.
- `src/hooks/useResizable.ts` - Custom hook for resizable elements.
- `src/hooks/useFileAttachments.ts` - Custom hook for file attachments.
- `src/data/mockData.ts` - Mock data for various components.
- `src/data/mockSessionBriefs.ts` - Mock data for session briefs and lesson plans.
- `src/data/mockChatHistory.ts` - Mock data for chat history.
- `src/data/mockUploadsArtifacts.ts` - Mock data for uploads and artifacts.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- The implementation of the rich text editor will likely involve adding new sub-components within `src/components/copilot/views/LessonPlanDetail.tsx` for the floating menu, slash command menu, and specific content block renderers.
- For saving lesson plan data, consider adapting `src/services/chatThreadsService.ts` or creating a new dedicated service if the data structure for lesson plans differs significantly from chat threads.
- Leverage the existing `src/services/openaiService.ts` for all AI-related interactions, ensuring consistency and reusability.

## Tasks

- [x] 1.0 Set up the Rich Text Editor Framework
  - [x] 1.1 Research and select a headless rich text editor library (e.g., TipTap, Slate.js) suitable for React and inline editing.
  - [x] 1.2 Install the chosen library and its necessary dependencies.
  - [x] 1.3 Integrate the editor into `src/components/copilot/views/LessonPlanDetail.tsx`.
  - [x] 1.4 Initialize a basic editor instance and configure it to render the existing lesson plan content from `mockLessonPlans`.
  - [x] 1.5 Ensure the editor can correctly display all current static content types (headings, paragraphs, lists).

- [x] 2.0 Implement Inline Editing Core Functionality
  - [x] 2.1 Configure the rich text editor to make all content types (headings, paragraphs, bullet lists, numbered lists) directly editable.
  - [x] 2.2 Implement logic to ensure that clicking on any text element within the editor immediately places the cursor for editing.
  - [x] 2.3 Verify that the cursor changes from a pointer to a text insertion bar when hovering over editable content areas.
  - [x] 2.4 Ensure that there are no visible edit indicators, buttons, or borders, maintaining a seamless Notion-like editing experience.
 - [x] 2.5 Implement support for multi-line editing within paragraph and list item content blocks.

- [x] 3.0 Implement Auto-save System
  - [x] 3.1 Configure the rich text editor to emit events or provide a mechanism for detecting content changes.
  - [x] 3.2 Implement a debouncing mechanism (e.g., using `setTimeout`) to delay save operations and prevent excessive API calls.
  - [x] 3.3 Integrate the debounced save functionality with the Zustand store (`src/stores/copilotStore.ts`) to update the lesson plan data.
  - [x] 3.4 Implement a subtle visual indicator (e.g., "Saving...", "Saved") to show the current save status to the user.
  - [x] 3.5 Implement basic error handling and retry logic for save operations in case of network failures or API errors.
  - [x] 3.6 Adapt `src/services/chatThreadsService.ts` or create a new service (e.g., `lessonPlanService.ts`) to handle saving the updated lesson plan structure to the backend.

- [x] 4.0 Implement Rich Text Formatting
  - [x] 4.1 Implement a floating formatting menu that appears upon text selection within the editor.
  - [x] 4.2 Add buttons to the formatting menu for applying:
    - [x] 4.2.1 Bold, Italic, Underline, Strikethrough.
    - [x] 4.2.2 Text color picker.
    - [x] 4.2.3 Background highlight color picker.
    - [x] 4.2.4 Link creation and editing.
    - [x] 4.2.5 Inline code formatting.
  - [x] 4.3 Integrate KaTeX library for rendering inline mathematical expressions (e.g., `$x^2 + y^2 = z^2$`).
  - [x] 4.4 Implement support for block-level math equations with proper centering and live preview within the editor.
  - [x] 4.5 Implement keyboard shortcuts for common formatting actions (e.g., Ctrl+B for bold, Ctrl+I for italic).
  - [x] 4.6 Ensure that formatting applies correctly and consistently to the selected text within the editor.

- [x] 5.0 Add Slash Commands and Content Block Management
  - [x] 5.1 Implement detection for typing "/" at the beginning of a new line or block to trigger a command menu.
  - [x] 5.2 Display a searchable and keyboard-navigable command menu with options for inserting content blocks.
  - [x] 5.3 Implement commands to insert new content blocks:
    - [x] 5.3.1 Headings (H1, H2, H3).
    - [x] 5.3.2 Paragraph.
    - [x] 5.3.3 Bullet list.
    - [x] 5.3.4 Numbered list.
    - [x] 5.3.5 Math equation block.
    - [x] 5.3.6 Code block.
  - [x] 5.4 Implement image upload and display functionality, including client-side handling and integration with a storage solution (e.g., Supabase Storage) for storing the image and displaying it within the editor.

- [ ] 6.0 Implement Drag and Drop Reordering
  - [ ] 6.1 Add subtle drag handles to each content block, visible on hover.
  - [ ] 6.2 Implement drag-and-drop functionality to allow users to reorder any section within the lesson plan.
  - [ ] 6.3 Provide clear visual feedback (e.g., a placeholder line) to indicate valid drop zones during the drag operation.
  - [ ] 6.4 Ensure that reordering actions trigger the auto-save system to persist changes.

- [x] 7.0 Implement AI Integration for Text Selection
  - [x] 7.1 Add an "Ask AI" option to the floating text selection formatting menu.
  - [x] 7.2 Implement a text input field or modal that appears when "Ask AI" is clicked, allowing the user to write a question or give instructions.
  - [x] 7.3 If text is selected/highlighted, ensure it is sent as prompt context along with the user's query to `openaiService.sendMessage`.
  - [x] 7.4 If no text is selected, send only the user's prompt to `openaiService.sendMessage`.
  - [x] 7.5 Display AI responses in an actionable manner within the editor (e.g., providing options to replace selected text, insert new content, or suggest changes).
  - [x] 7.6 Leverage the existing `src/services/openaiService.ts` for all OpenAI API calls.

- [ ] 8.0 Refine UI/UX and Polish
  - [ ] 8.1 Ensure the inline editor is fully responsive and provides a good user experience across different screen sizes (desktop, tablet, mobile).
  - [ ] 8.2 Verify keyboard navigation and screen reader compatibility for all editor functionalities to ensure accessibility.
  - [ ] 8.3 Ensure visual consistency of the editor elements, formatting menus, and command palette with the existing design system and brand colors.
  - [ ] 8.4 Implement smooth hover states, transitions, and micro-interactions for all interactive editor elements.
  - [ ] 8.5 Conduct thorough testing for various edge cases, input types, and error conditions to ensure robustness.
