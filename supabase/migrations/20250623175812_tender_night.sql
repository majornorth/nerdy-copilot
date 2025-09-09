/*
  # Create chat threads table

  1. New Tables
    - `chat_threads`
      - `id` (uuid, primary key)
      - `title` (text) - derived from first user message
      - `messages` (jsonb) - array of message objects with id, content, timestamp, type, status
      - `conversation_history` (jsonb) - OpenAI conversation format for context
      - `student_context` (text) - which student the chat is about ("All students" or specific name)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid) - for future user authentication, nullable for now

  2. Security
    - Enable RLS on `chat_threads` table
    - Add policy for public access (since no auth yet)
    - Add policy for future authenticated users

  3. Indexes
    - Index on created_at for sorting
    - Index on user_id for future user filtering
    - GIN index on messages for searching within message content
*/

CREATE TABLE IF NOT EXISTS chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  conversation_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  student_context text NOT NULL DEFAULT 'All students',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid -- nullable for now, will be required when auth is added
);

-- Enable RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (temporary until auth is implemented)
CREATE POLICY "Allow public read access to chat_threads"
  ON chat_threads
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to chat_threads"
  ON chat_threads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to chat_threads"
  ON chat_threads
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to chat_threads"
  ON chat_threads
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at ON chat_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_messages_gin ON chat_threads USING GIN (messages);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();