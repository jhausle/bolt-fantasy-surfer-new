/*
  # Add mock data for Pipeline event

  1. New Data
    - WSL rosters for Pipeline
    - Fantasy Surfer rosters for Pipeline
    - Surfer points for both leagues
    - Contest standings calculated from points

  2. Changes
    - Add rosters for all users
    - Add realistic point distributions
    - Calculate and insert standings
*/

-- Insert WSL rosters for Pipeline
INSERT INTO world_surf_league_rosters (
  user_id,
  contest_id,
  surfer_a1_id,
  surfer_a2_id,
  surfer_b1_id,
  surfer_b2_id,
  surfer_b3_id,
  surfer_b4_id,
  surfer_c1_id,
  surfer_c2_id,
  power_surfer_id
) VALUES
  -- John Hausle's roster
  ('47073f12-44c0-4899-bbc3-e9fce5562352'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid,
   '216ac271-cf8d-4d53-9737-009993647d9f'::uuid, -- John John Florence
   '77d3f11c-6536-4e00-a09a-50674740e2e8'::uuid, -- Gabriel Medina
   '18fdda6e-551d-4adb-aee2-5f337ccfa6ed'::uuid, -- Griffin Colapinto
   '77da25e7-11a1-43dc-badb-917ead6d805c'::uuid, -- Ethan Ewing
   'a35d7809-d11e-40c4-ba65-f3b95a5dbd87'::uuid, -- Jack Robinson
   '3665962c-b946-45b8-986b-2bf7268b8303'::uuid, -- Italo Ferreira
   'c533f332-7d18-4bf5-8f08-9f65553c4d29'::uuid, -- Kanoa Igarashi
   'ee704629-70b0-4599-b421-92a077ec82f0'::uuid, -- Cole Houshmand
   '216ac271-cf8d-4d53-9737-009993647d9f'::uuid  -- John John Florence (power)
  ),
  -- Nick Curci's roster
  ('01f71ebd-1f21-49cc-9de6-bbb2b04c2f0b'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid,
   'dffe60ed-17a3-48d8-a62a-bf0ffb83b756'::uuid, -- Filipe Toledo
   '77d3f11c-6536-4e00-a09a-50674740e2e8'::uuid, -- Gabriel Medina
   '18fdda6e-551d-4adb-aee2-5f337ccfa6ed'::uuid, -- Griffin Colapinto
   '77da25e7-11a1-43dc-badb-917ead6d805c'::uuid, -- Ethan Ewing
   'a35d7809-d11e-40c4-ba65-f3b95a5dbd87'::uuid, -- Jack Robinson
   '3665962c-b946-45b8-986b-2bf7268b8303'::uuid, -- Italo Ferreira
   'c533f332-7d18-4bf5-8f08-9f65553c4d29'::uuid, -- Kanoa Igarashi
   'ee704629-70b0-4599-b421-92a077ec82f0'::uuid, -- Cole Houshmand
   'dffe60ed-17a3-48d8-a62a-bf0ffb83b756'::uuid  -- Filipe Toledo (power)
  );

-- Insert Fantasy Surfer rosters for Pipeline
INSERT INTO fantasy_surfer_rosters (
  user_id,
  contest_id,
  surfer_1_id,
  surfer_1_price,
  surfer_2_id,
  surfer_2_price,
  surfer_3_id,
  surfer_3_price,
  surfer_4_id,
  surfer_4_price,
  surfer_5_id,
  surfer_5_price,
  surfer_6_id,
  surfer_6_price,
  surfer_7_id,
  surfer_7_price,
  surfer_8_id,
  surfer_8_price
) VALUES
  -- John Hausle's roster
  ('47073f12-44c0-4899-bbc3-e9fce5562352'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid,
   '216ac271-cf8d-4d53-9737-009993647d9f'::uuid, 22, -- John John Florence
   '77d3f11c-6536-4e00-a09a-50674740e2e8'::uuid, 20, -- Gabriel Medina
   '18fdda6e-551d-4adb-aee2-5f337ccfa6ed'::uuid, 18, -- Griffin Colapinto
   '77da25e7-11a1-43dc-badb-917ead6d805c'::uuid, 16, -- Ethan Ewing
   'a35d7809-d11e-40c4-ba65-f3b95a5dbd87'::uuid, 15, -- Jack Robinson
   '3665962c-b946-45b8-986b-2bf7268b8303'::uuid, 14, -- Italo Ferreira
   'c533f332-7d18-4bf5-8f08-9f65553c4d29'::uuid, 12, -- Kanoa Igarashi
   'ee704629-70b0-4599-b421-92a077ec82f0'::uuid, 10  -- Cole Houshmand
  ),
  -- Nick Curci's roster
  ('01f71ebd-1f21-49cc-9de6-bbb2b04c2f0b'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid,
   'dffe60ed-17a3-48d8-a62a-bf0ffb83b756'::uuid, 22, -- Filipe Toledo
   '77d3f11c-6536-4e00-a09a-50674740e2e8'::uuid, 20, -- Gabriel Medina
   '18fdda6e-551d-4adb-aee2-5f337ccfa6ed'::uuid, 18, -- Griffin Colapinto
   '77da25e7-11a1-43dc-badb-917ead6d805c'::uuid, 16, -- Ethan Ewing
   'a35d7809-d11e-40c4-ba65-f3b95a5dbd87'::uuid, 15, -- Jack Robinson
   '3665962c-b946-45b8-986b-2bf7268b8303'::uuid, 14, -- Italo Ferreira
   'c533f332-7d18-4bf5-8f08-9f65553c4d29'::uuid, 12, -- Kanoa Igarashi
   'ee704629-70b0-4599-b421-92a077ec82f0'::uuid, 10  -- Cole Houshmand
  );

-- Insert surfer points for Pipeline
INSERT INTO surfer_points (
  surfer_id,
  contest_id,
  league_type,
  points
) VALUES
  -- WSL Points
  ('216ac271-cf8d-4d53-9737-009993647d9f'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 8500), -- John John Florence
  ('77d3f11c-6536-4e00-a09a-50674740e2e8'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 7800), -- Gabriel Medina
  ('18fdda6e-551d-4adb-aee2-5f337ccfa6ed'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 6500), -- Griffin Colapinto
  ('77da25e7-11a1-43dc-badb-917ead6d805c'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 6200), -- Ethan Ewing
  ('a35d7809-d11e-40c4-ba65-f3b95a5dbd87'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 5900), -- Jack Robinson
  ('3665962c-b946-45b8-986b-2bf7268b8303'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 5500), -- Italo Ferreira
  ('c533f332-7d18-4bf5-8f08-9f65553c4d29'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 4800), -- Kanoa Igarashi
  ('ee704629-70b0-4599-b421-92a077ec82f0'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 4200), -- Cole Houshmand
  ('dffe60ed-17a3-48d8-a62a-bf0ffb83b756'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, 7200), -- Filipe Toledo

  -- Fantasy Surfer Points
  ('216ac271-cf8d-4d53-9737-009993647d9f'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 187), -- John John Florence
  ('77d3f11c-6536-4e00-a09a-50674740e2e8'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 171), -- Gabriel Medina
  ('18fdda6e-551d-4adb-aee2-5f337ccfa6ed'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 143), -- Griffin Colapinto
  ('77da25e7-11a1-43dc-badb-917ead6d805c'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 136), -- Ethan Ewing
  ('a35d7809-d11e-40c4-ba65-f3b95a5dbd87'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 129), -- Jack Robinson
  ('3665962c-b946-45b8-986b-2bf7268b8303'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 121), -- Italo Ferreira
  ('c533f332-7d18-4bf5-8f08-9f65553c4d29'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 105), -- Kanoa Igarashi
  ('ee704629-70b0-4599-b421-92a077ec82f0'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 92),  -- Cole Houshmand
  ('dffe60ed-17a3-48d8-a62a-bf0ffb83b756'::uuid, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, 158); -- Filipe Toledo

-- Calculate and insert contest standings for Pipeline
WITH wsl_totals AS (
  SELECT
    r.user_id,
    SUM(CASE WHEN s.surfer_id = r.power_surfer_id THEN s.points * 2 ELSE s.points END) as total_points
  FROM world_surf_league_rosters r
  JOIN surfer_points s ON (
    s.surfer_id IN (
      r.surfer_a1_id, r.surfer_a2_id,
      r.surfer_b1_id, r.surfer_b2_id, r.surfer_b3_id, r.surfer_b4_id,
      r.surfer_c1_id, r.surfer_c2_id
    )
    AND s.contest_id = r.contest_id
    AND s.league_type = 'wsl'::league_type
  )
  WHERE r.contest_id = '61475ece-c201-4f5d-9699-327241b544fe'::uuid
  GROUP BY r.user_id
),
fs_totals AS (
  SELECT
    r.user_id,
    SUM(s.points) as total_points
  FROM fantasy_surfer_rosters r
  JOIN surfer_points s ON (
    s.surfer_id IN (
      r.surfer_1_id, r.surfer_2_id, r.surfer_3_id, r.surfer_4_id,
      r.surfer_5_id, r.surfer_6_id, r.surfer_7_id, r.surfer_8_id
    )
    AND s.contest_id = r.contest_id
    AND s.league_type = 'fantasy_surfer'::league_type
  )
  WHERE r.contest_id = '61475ece-c201-4f5d-9699-327241b544fe'::uuid
  GROUP BY r.user_id
)
INSERT INTO contest_standings (
  user_id,
  contest_id,
  league_type,
  points
)
SELECT user_id, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'wsl'::league_type, total_points
FROM wsl_totals
UNION ALL
SELECT user_id, '61475ece-c201-4f5d-9699-327241b544fe'::uuid, 'fantasy_surfer'::league_type, total_points
FROM fs_totals;