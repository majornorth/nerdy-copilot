/*
  # Create lesson plans table

  1. New Tables
    - `lesson_plans`
      - `id` (uuid, primary key)
      - `title` (text) - lesson plan title
      - `content` (text) - rich text content of the lesson plan
      - `student` (text) - student name this lesson plan is for
      - `date` (text) - date string for the lesson
      - `last_modified` (timestamptz) - when the lesson plan was last updated
      - `version` (integer) - version number for conflict resolution
      - `created_at` (timestamptz)
      - `user_id` (uuid) - for future user authentication, nullable for now

  2. Security
    - Enable RLS on `lesson_plans` table
    - Add policy for public access (since no auth yet)
    - Add policy for future authenticated users

  3. Indexes
    - Index on last_modified for sorting
    - Index on user_id for future user filtering
    - Index on student for filtering by student
    - Full-text search index on title and content
*/

CREATE TABLE IF NOT EXISTS lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  student text NOT NULL,
  date text NOT NULL,
  last_modified timestamptz DEFAULT now(),
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  user_id uuid -- nullable for now, will be required when auth is added
);

-- Enable RLS
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (temporary until auth is implemented)
CREATE POLICY "Allow public read access to lesson_plans"
  ON lesson_plans
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to lesson_plans"
  ON lesson_plans
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to lesson_plans"
  ON lesson_plans
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to lesson_plans"
  ON lesson_plans
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_plans_last_modified ON lesson_plans(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_id ON lesson_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_student ON lesson_plans(student);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_date ON lesson_plans(date);

-- Create full-text search index for title and content
CREATE INDEX IF NOT EXISTS idx_lesson_plans_search ON lesson_plans USING gin(to_tsvector('english', title || ' ' || content));

-- Create function to automatically update last_modified timestamp
CREATE OR REPLACE FUNCTION update_lesson_plans_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update last_modified
CREATE TRIGGER update_lesson_plans_last_modified_trigger
  BEFORE UPDATE ON lesson_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_plans_last_modified();