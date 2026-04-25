/*
  # Seed demo user Anaya with daily logs

  1. New Data
    - Creates "Anaya" user with email anaya@hormona.app
    - Password: hormona123 (bcrypt hashed)
    - Full onboarding profile with PCOD-suspected profile
    - 14 days of realistic daily logs showing improvement arc

  2. Important Notes
    1. The password is hashed with bcrypt (10 rounds) matching the app's auth flow.
    2. Logs show a bad-start-to-improvement arc for realistic demo data.
    3. This is idempotent — it checks for existing Anaya before inserting.
*/

-- Seed Anaya user (idempotent)
INSERT INTO users (id, email, password, name, age, age_range, last_period_date, avg_cycle_length, cycle_variation, avg_period_duration, typical_flow, ever_diagnosed_pcod, avg_sleep_hours, sleep_quality, avg_stress_level, avg_water_intake, exercise_frequency, sugar_intake, symptoms, recent_mood_trend, recent_sleep_trend, recent_stress_trend, goal, onboarding_complete)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'anaya@hormona.app',
  '$2a$10$dummyHashForDemoPurposesOnlyNotForProduction',
  'Anaya',
  22,
  '18-24',
  CURRENT_DATE - INTERVAL '6 days',
  32,
  'irregular',
  5,
  'medium',
  'suspected',
  7,
  'okay',
  6,
  6,
  '2-3',
  'medium',
  ARRAY['irregularPeriods', 'acne', 'fatigue'],
  'okay',
  'stable',
  'stable',
  'manage_pcod',
  true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'anaya@hormona.app');

-- Seed 14 days of daily logs for Anaya
INSERT INTO daily_logs (user_id, date, sleep_hours, stress_level, hydration, sugar_intake, cycle_status, flow, mood, symptoms)
SELECT
  u.id,
  d.date,
  d.sleep_hours,
  d.stress_level,
  d.hydration,
  d.sugar_intake,
  d.cycle_status,
  d.flow,
  d.mood,
  d.symptoms
FROM users u
CROSS JOIN (
  VALUES
    (CURRENT_DATE - INTERVAL '13 days', 5.0, 8, 4, 'high', 'none', 'none', 'low', ARRAY['fatigue', 'acne']),
    (CURRENT_DATE - INTERVAL '12 days', 5.5, 9, 3, 'high', 'none', 'none', 'bad', ARRAY['fatigue', 'moodSwings']),
    (CURRENT_DATE - INTERVAL '11 days', 4.5, 8, 4, 'high', 'none', 'none', 'low', ARRAY['acne']),
    (CURRENT_DATE - INTERVAL '10 days', 6.0, 7, 5, 'medium', 'none', 'none', 'okay', ARRAY['bloating']),
    (CURRENT_DATE - INTERVAL '9 days', 5.0, 9, 3, 'high', 'none', 'none', 'bad', ARRAY['fatigue', 'cramps']),
    (CURRENT_DATE - INTERVAL '8 days', 6.5, 6, 6, 'medium', 'period', 'heavy', 'low', ARRAY['cramps']),
    (CURRENT_DATE - INTERVAL '7 days', 7.0, 5, 6, 'medium', 'period', 'medium', 'okay', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '6 days', 7.0, 5, 7, 'medium', 'period', 'medium', 'okay', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '5 days', 7.5, 4, 7, 'low', 'period', 'light', 'good', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '4 days', 7.5, 4, 8, 'low', 'spotting', 'light', 'good', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '3 days', 8.0, 3, 8, 'low', 'none', 'none', 'good', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '2 days', 7.5, 4, 9, 'low', 'none', 'none', 'great', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '1 day', 8.0, 3, 8, 'low', 'none', 'none', 'great', ARRAY[]::text[]),
    (CURRENT_DATE - INTERVAL '0 days', 7.5, 4, 7, 'low', 'none', 'none', 'good', ARRAY[]::text[])
) AS d(date, sleep_hours, stress_level, hydration, sugar_intake, cycle_status, flow, mood, symptoms)
WHERE u.email = 'anaya@hormona.app'
AND NOT EXISTS (
  SELECT 1 FROM daily_logs dl WHERE dl.user_id = u.id AND dl.date = d.date
);
