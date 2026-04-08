-- Add user_id column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing projects to have a default user_id (optional - only if you have existing data)
-- UPDATE projects SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;

-- Allow users to view their own projects OR allow service role to view all
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Allow users to create projects with their user_id
CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Allow users to update their own projects
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Allow service role to delete (for admin purposes)
CREATE POLICY "Service role can delete projects"
  ON projects FOR DELETE
  USING (auth.role() = 'service_role');
