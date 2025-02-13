/*
  # Recalculate Pipeline contest standings

  1. Changes
    - Recalculate WSL standings for Pipeline contest
    - Recalculate Fantasy Surfer standings for Pipeline contest
*/

-- Recalculate WSL standings for Pipeline
WITH pipeline_contest AS (
  SELECT id FROM contests WHERE name ILIKE '%Pipeline%' AND year = 2025 LIMIT 1
)
DELETE FROM contest_standings
WHERE contest_id = (SELECT id FROM pipeline_contest)
AND league_type = 'wsl';

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
  'wsl' as league_type,
  SUM(
    CASE 
      WHEN s.surfer_id = r.power_surfer_id THEN s.points * 2
      ELSE s.points
    END
  ) as total_points
FROM world_surf_league_rosters r
JOIN surfer_points s ON (
  s.surfer_id IN (
    r.surfer_a1_id, r.surfer_a2_id,
    r.surfer_b1_id, r.surfer_b2_id, r.surfer_b3_id, r.surfer_b4_id,
    r.surfer_c1_id, r.surfer_c2_id
  )
  AND s.contest_id = r.contest_id
  AND s.league_type = 'wsl'
)
WHERE r.contest_id = (SELECT id FROM pipeline_contest)
GROUP BY r.user_id, r.contest_id;

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