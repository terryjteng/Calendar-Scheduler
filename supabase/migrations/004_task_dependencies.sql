ALTER TABLE tasks ADD COLUMN IF NOT EXISTS depends_on uuid[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at    timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at  timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS size_estimate text;
