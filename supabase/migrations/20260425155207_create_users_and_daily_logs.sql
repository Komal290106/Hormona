/*
  # Create users and daily_logs tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key, defaults to auth.uid())
      - `email` (text, unique, not null)
      - `password` (text, not null) — hashed password for email/password auth
      - `name` (text, not null)
      - `age` (integer, nullable)
      - `age_range` (text, nullable) — 'under18' | '18-24' | '25-34' | '35+'
      - `last_period_date` (date, nullable)
      - `avg_cycle_length` (integer, default 28)
      - `cycle_variation` (text, default 'regular')
      - `avg_period_duration` (integer, default 5)
      - `typical_flow` (text, default 'medium')
      - `ever_diagnosed_pcod` (text, nullable)
      - `avg_sleep_hours` (numeric, default 7)
      - `sleep_quality` (text, default 'okay')
      - `avg_stress_level` (integer, default 5)
      - `avg_water_intake` (integer, default 6)
      - `exercise_frequency` (text, default '2-3')
      - `diet_type` (text, default 'balanced')
      - `sugar_intake` (text, default 'medium')
      - `symptoms` (text array, default '{}')
      - `recent_mood_trend` (text, default 'okay')
      - `recent_sleep_trend` (text, default 'stable')
      - `recent_stress_trend` (text, default 'stable')
      - `goal` (text, default 'understand')
      - `onboarding_complete` (boolean, default false)
      - `created_at` (timestamptz, default now())

    - `daily_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, not null)
      - `date` (date, default today)
      - `sleep_hours` (numeric, default 7)
      - `stress_level` (integer, default 5)
      - `hydration` (integer, default 6)
      - `sugar_intake` (text, default 'medium')
      - `cycle_status` (text, default 'none')
      - `flow` (text, default 'none')
      - `mood` (text, default 'okay')
      - `symptoms` (text array, default '{}')
      - `notes` (text, default '')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Users can only read/update their own data
    - Users can only create/read their own daily logs
    - No unauthenticated access

  3. Important Notes
    1. The users table uses a plain UUID id (not auth.uid()) because the app
       manages its own auth flow with bcrypt-hashed passwords stored in the table.
    2. The daily_logs table references users.id via foreign key.
    3. All RLS policies restrict access to the owning user only.
*/

-- ── Users table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  age integer,
  age_range text,
  last_period_date date,
  avg_cycle_length integer DEFAULT 28,
  cycle_variation text DEFAULT 'regular',
  avg_period_duration integer DEFAULT 5,
  typical_flow text DEFAULT 'medium',
  ever_diagnosed_pcod text,
  avg_sleep_hours numeric DEFAULT 7,
  sleep_quality text DEFAULT 'okay',
  avg_stress_level integer DEFAULT 5,
  avg_water_intake integer DEFAULT 6,
  exercise_frequency text DEFAULT '2-3',
  diet_type text DEFAULT 'balanced',
  sugar_intake text DEFAULT 'medium',
  symptoms text[] DEFAULT '{}',
  recent_mood_trend text DEFAULT 'okay',
  recent_sleep_trend text DEFAULT 'stable',
  recent_stress_trend text DEFAULT 'stable',
  goal text DEFAULT 'understand',
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own row
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- For the app's custom auth, we also need service-role access
-- (the edge functions will use the service role key)

-- ── Daily logs table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  sleep_hours numeric DEFAULT 7,
  stress_level integer DEFAULT 5,
  hydration integer DEFAULT 6,
  sugar_intake text DEFAULT 'medium',
  cycle_status text DEFAULT 'none',
  flow text DEFAULT 'none',
  mood text DEFAULT 'okay',
  symptoms text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own logs
CREATE POLICY "Users can read own logs"
  ON daily_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own logs
CREATE POLICY "Users can update own logs"
  ON daily_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own logs
CREATE POLICY "Users can delete own logs"
  ON daily_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
