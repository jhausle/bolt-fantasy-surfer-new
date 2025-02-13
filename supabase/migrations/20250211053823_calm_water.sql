-- Drop existing RLS policies for world_surf_league_rosters
DROP POLICY IF EXISTS "Users can view all WSL rosters" ON world_surf_league_rosters;
DROP POLICY IF EXISTS "Users can manage their own WSL rosters" ON world_surf_league_rosters;

-- Create new RLS policies that allow service role full access
CREATE POLICY "Service role can manage all WSL rosters"
ON world_surf_league_rosters
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view all WSL rosters"
ON world_surf_league_rosters
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own WSL rosters"
ON world_surf_league_rosters
FOR ALL
USING (
  auth.role() = 'authenticated' AND
  auth.uid() = user_id
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = user_id
);

-- Update surfer_points policies
DROP POLICY IF EXISTS "Surfer points are viewable by everyone" ON surfer_points;

CREATE POLICY "Service role can manage all surfer points"
ON surfer_points
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view all surfer points"
ON surfer_points
FOR SELECT
USING (true);

-- Update contest_standings policies
DROP POLICY IF EXISTS "Contest standings are viewable by everyone" ON contest_standings;

CREATE POLICY "Service role can manage all contest standings"
ON contest_standings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view all contest standings"
ON contest_standings
FOR SELECT
USING (true);