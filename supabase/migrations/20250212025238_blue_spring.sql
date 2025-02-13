/*
  # Update Ethan Ewing's WSL points

  1. Changes
    - Update Ethan Ewing's WSL points for Pipeline from 56.2 to 28.1
    - Recalculate WSL standings for Pipeline contest
*/

-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS update_wsl_standings_on_points_change ON surfer_points;

-- Get Pipeline contest ID and Ethan Ewing's surfer ID
WITH pipeline_contest AS (
  SELECT id FROM contests WHERE name ILIKE '%Pipeline%' AND year = 2025 LIMIT 1
),
ethan_ewing AS (
  SELECT id FROM surfers WHERE first_name = 'Ethan' AND last_name = 'Ewing' LIMIT 1
)
-- Update the points
UPDATE surfer_points
SET 
  points = 28.1,
  updated_at = now()
WHERE surfer_id = (SELECT id FROM ethan_ewing)
AND contest_id = (SELECT id FROM pipeline_contest)
AND league_type = 'wsl';

-- Delete existing standings
WITH pipeline_contest AS (
  SELECT id FROM contests WHERE name ILIKE '%Pipeline%' AND year = 2025 LIMIT 1
)
DELETE FROM contest_standings
WHERE contest_id = (SELECT id FROM pipeline_contest)
AND league_type = 'wsl';

-- Calculate and insert new standings
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

-- Re-enable the trigger
CREATE TRIGGER update_wsl_standings_on_points_change
  AFTER INSERT OR UPDATE OR DELETE ON surfer_points
  FOR EACH ROW
  EXECUTE FUNCTION handle_points_change();