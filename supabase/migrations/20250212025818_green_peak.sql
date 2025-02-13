/*
  # Add Ian Gentil's Fantasy Surfer points

  1. Changes
    - Add Fantasy Surfer points (42) for Ian Gentil at Pipeline
*/

-- Get Pipeline contest ID and Ian Gentil's surfer ID
WITH pipeline_contest AS (
  SELECT id FROM contests WHERE name ILIKE '%Pipeline%' AND year = 2025 LIMIT 1
),
ian_gentil AS (
  SELECT id FROM surfers WHERE first_name = 'Ian' AND last_name = 'Gentil' LIMIT 1
)
-- Insert or update the points
INSERT INTO surfer_points (
  surfer_id,
  contest_id,
  league_type,
  points
)
SELECT 
  (SELECT id FROM ian_gentil),
  (SELECT id FROM pipeline_contest),
  'fantasy_surfer',
  42
ON CONFLICT (surfer_id, contest_id, league_type) DO UPDATE
SET 
  points = 42,
  updated_at = now();

-- Recalculate Fantasy Surfer standings for Pipeline
WITH pipeline_contest AS (
  SELECT id FROM contests WHERE name ILIKE '%Pipeline%' AND year = 2025 LIMIT 1
)
DELETE FROM contest_standings
WHERE contest_id = (SELECT id FROM pipeline_contest)
AND league_type = 'fantasy_surfer';

WITH pipeline_contest AS (
  SELECT id FROM contests WHERE name ILIKE '%Pipeline%' AND year = 2025 LIMIT 1
)
INSERT INTO contest_standings (
  user_id,
  contest_id,
  league_type,
  points
)
SELECT
  r.user_id,
  r.contest_id,
  'fantasy_surfer' as league_type,
  SUM(s.points) as total_points
FROM fantasy_surfer_rosters r
JOIN surfer_points s ON (
  s.surfer_id IN (
    r.surfer_1_id, r.surfer_2_id, r.surfer_3_id, r.surfer_4_id,
    r.surfer_5_id, r.surfer_6_id, r.surfer_7_id, r.surfer_8_id
  )
  AND s.contest_id = r.contest_id
  AND s.league_type = 'fantasy_surfer'
)
WHERE r.contest_id = (SELECT id FROM pipeline_contest)
GROUP BY r.user_id, r.contest_id;