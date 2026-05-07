ALTER TABLE profiles ADD COLUMN IF NOT EXISTS teams text[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  game        text,
  team        text,
  type        text NOT NULL DEFAULT 'standard',
  color       text NOT NULL DEFAULT '#7c3aed',
  owner_id    text NOT NULL,
  member_ids  text[] DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sprints (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  goal        text,
  start_date  date,
  end_date    date,
  status      text NOT NULL DEFAULT 'planned',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  due_date    date,
  status      text NOT NULL DEFAULT 'open',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id     uuid REFERENCES sprints(id) ON DELETE SET NULL,
  milestone_id  uuid REFERENCES milestones(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  status        text NOT NULL DEFAULT 'backlog',
  priority      text NOT NULL DEFAULT 'medium',
  stage         text,
  assignee_id   text,
  creator_id    text NOT NULL,
  due_date      date,
  external_url  text,
  embed_url     text,
  position      integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx   ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx  ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx     ON tasks(due_date);
CREATE INDEX IF NOT EXISTS sprints_project_id_idx ON sprints(project_id);

GRANT ALL ON TABLE projects  TO anon, authenticated;
GRANT ALL ON TABLE tasks     TO anon, authenticated;
GRANT ALL ON TABLE sprints   TO anon, authenticated;
GRANT ALL ON TABLE milestones TO anon, authenticated;
ALTER TABLE projects   DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks      DISABLE ROW LEVEL SECURITY;
ALTER TABLE sprints    DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
