/*
  # Update surfer points

  1. Changes
    - Update specific surfer points record
*/

-- Drop existing triggers temporarily
DROP TRIGGER IF EXISTS update_wsl_standings_on_points_change ON surfer_points;

-- Update the points
UPDATE surfer_points
SET 
  points = 8.1,
  updated_at = now()
WHERE id = '752a4723-b62f-4f53-bb97-47920018f8c6';

-- Recreate the trigger
CREATE TRIGGER update_wsl_standings_on_points_change
  AFTER INSERT OR UPDATE OR DELETE ON surfer_points
  FOR EACH ROW
  EXECUTE FUNCTION handle_points_change();