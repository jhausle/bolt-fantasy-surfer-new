/*
  # Update WSL standings calculation

  1. Changes
    - Create a function to calculate WSL standings that properly doubles power surfer points
    - Create separate triggers for INSERT/UPDATE and DELETE operations
    - Create a trigger function specifically for points changes

  2. Security
    - Function and trigger are owned by postgres role
    - No direct user access required
*/

-- Create function to calculate WSL standings
CREATE OR REPLACE FUNCTION calculate_wsl_standings()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing WSL standings for affected contest
  DELETE FROM contest_standings
  WHERE contest_id = COALESCE(NEW.contest_id, OLD.contest_id)
  AND league_type = 'wsl';

  -- Insert updated standings
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
        WHEN s.surfer_id = r.power_surfer_id THEN s.points * 2  -- Double points for power surfer
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
  WHERE r.contest_id = COALESCE(NEW.contest_id, OLD.contest_id)
  GROUP BY r.user_id, r.contest_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle points changes
CREATE OR REPLACE FUNCTION handle_points_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.league_type = 'wsl') OR
     (TG_OP IN ('INSERT', 'UPDATE') AND NEW.league_type = 'wsl') THEN
    PERFORM calculate_wsl_standings();
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for roster changes
CREATE TRIGGER update_wsl_standings_on_roster_change
  AFTER INSERT OR UPDATE OR DELETE ON world_surf_league_rosters
  FOR EACH ROW
  EXECUTE FUNCTION calculate_wsl_standings();

-- Create trigger for point changes
CREATE TRIGGER update_wsl_standings_on_points_change
  AFTER INSERT OR UPDATE OR DELETE ON surfer_points
  FOR EACH ROW
  EXECUTE FUNCTION handle_points_change();

-- Recalculate all existing standings
DO $$
DECLARE
  contest_record RECORD;
BEGIN
  FOR contest_record IN SELECT DISTINCT contest_id FROM world_surf_league_rosters LOOP
    DELETE FROM contest_standings
    WHERE contest_id = contest_record.contest_id
    AND league_type = 'wsl';

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
          WHEN s.surfer_id = r.power_surfer_id THEN s.points * 2  -- Double points for power surfer
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
    WHERE r.contest_id = contest_record.contest_id
    GROUP BY r.user_id, r.contest_id;
  END LOOP;
END $$;