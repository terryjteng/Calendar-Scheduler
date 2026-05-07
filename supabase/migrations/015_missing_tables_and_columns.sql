-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_token_expiry BIGINT;

-- Add weekly_overrides to availability
ALTER TABLE availability ADD COLUMN IF NOT EXISTS weekly_overrides JSONB DEFAULT '{}'::jsonb;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_hour INTEGER NOT NULL DEFAULT 9,
  end_hour INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_titles table
CREATE TABLE IF NOT EXISTS game_titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  author_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_alert_logs table
CREATE TABLE IF NOT EXISTS meeting_alert_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS size_estimate TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependency_ids UUID[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS embed_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

-- Add project columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS board_type TEXT DEFAULT 'kanban';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS game_title TEXT;

-- Create team_lead_requests table if missing
CREATE TABLE IF NOT EXISTS team_lead_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for all tables (dev environment)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_titles DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_alert_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sprints DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_lead_requests DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON events TO anon, authenticated;
GRANT ALL ON game_titles TO anon, authenticated;
GRANT ALL ON departments TO anon, authenticated;
GRANT ALL ON documents TO anon, authenticated;
GRANT ALL ON meeting_alert_logs TO anon, authenticated;
GRANT ALL ON sprints TO anon, authenticated;
GRANT ALL ON milestones TO anon, authenticated;
GRANT ALL ON team_lead_requests TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
