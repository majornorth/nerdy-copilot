/*
  # Add Image Support to Chat Thread Messages

  1. Schema Changes
    - Update the `messages` JSONB column structure to support `imageUrl` field
    - No structural changes needed since JSONB is flexible
    - Add documentation for the new field structure

  2. Message Structure
    - Each message in the `messages` JSONB array can now include:
      - `id` (string): Unique message identifier
      - `content` (string): Text content of the message
      - `timestamp` (string): ISO timestamp when message was created
      - `type` (string): 'user' or 'assistant'
      - `status` (string, optional): 'pending', 'completed', or 'error'
      - `error` (string, optional): Error message if status is 'error'
      - `imageUrl` (string, optional): URL of generated image if present

  3. Notes
    - JSONB columns are schema-flexible, so no migration is needed
    - The application already handles the new field structure
    - Existing data remains compatible
*/

-- Add a comment to document the enhanced message structure
COMMENT ON COLUMN chat_threads.messages IS 'JSONB array of message objects. Each message can contain: id, content, timestamp, type, status, error, imageUrl';

-- Add a comment to document that images are stored as URLs
COMMENT ON TABLE chat_threads IS 'Chat threads with messages. Images are stored as URLs in the imageUrl field of message objects.';

-- Create an index to help with queries that might filter by messages containing images
-- This is optional but can improve performance for future features
CREATE INDEX IF NOT EXISTS idx_chat_threads_messages_with_images 
ON chat_threads USING gin ((messages::jsonb)) 
WHERE messages::text LIKE '%imageUrl%';