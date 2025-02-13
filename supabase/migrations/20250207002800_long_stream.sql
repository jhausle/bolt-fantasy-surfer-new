/*
  # Initial Schema Setup for Surf Competition Tracking

  1. Tables
    - surfers: Professional surfers' information
    - contests: Competition events
    - users: User accounts with WSL and Fantasy Surfer identifiers
    - fantasy_surfer_rosters: Fantasy Surfer team rosters
    - world_surf_league_rosters: WSL team rosters
    - surfer_points: Points earned by surfers in contests
    - contest_standings: User rankings in contests

  2. Security
    - RLS enabled on all tables
    - Basic read/write policies for authenticated users
*/

-- Create enum for league types
CREATE TYPE league_type AS ENUM ('wsl', 'fantasy_surfer', 'total');

-- Create enum for surfer stances
CREATE TYPE stance_type AS ENUM ('regular', 'goofy');

-- Create surfers table
CREATE TABLE surfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  country text,
  birth_date date,
  stance stance_type,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contests table
CREATE TABLE contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  year smallint NOT NULL,
  country text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  secondary_email text,
  first_name text,
  last_name text,
  wsl_name text,
  wsl_id text,
  fantasy_surfer_name text,
  fantasy_surfer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fantasy surfer rosters table
CREATE TABLE fantasy_surfer_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  surfer_1_id uuid NOT NULL REFERENCES surfers(id),
  surfer_1_price integer NOT NULL,
  surfer_2_id uuid NOT NULL REFERENCES surfers(id),
  surfer_2_price integer NOT NULL,
  surfer_3_id uuid NOT NULL REFERENCES surfers(id),
  surfer_3_price integer NOT NULL,
  surfer_4_id uuid NOT NULL REFERENCES surfers(id),
  surfer_4_price integer NOT NULL,
  surfer_5_id uuid NOT NULL REFERENCES surfers(id),
  surfer_5_price integer NOT NULL,
  surfer_6_id uuid NOT NULL REFERENCES surfers(id),
  surfer_6_price integer NOT NULL,
  surfer_7_id uuid NOT NULL REFERENCES surfers(id),
  surfer_7_price integer NOT NULL,
  surfer_8_id uuid NOT NULL REFERENCES surfers(id),
  surfer_8_price integer NOT NULL,
  surfer_alt_id uuid REFERENCES surfers(id),
  surfer_alt_price integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contest_id)
);

-- Create world surf league rosters table
CREATE TABLE world_surf_league_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  surfer_a1_id uuid NOT NULL REFERENCES surfers(id),
  surfer_a2_id uuid NOT NULL REFERENCES surfers(id),
  surfer_b1_id uuid NOT NULL REFERENCES surfers(id),
  surfer_b2_id uuid NOT NULL REFERENCES surfers(id),
  surfer_b3_id uuid NOT NULL REFERENCES surfers(id),
  surfer_b4_id uuid NOT NULL REFERENCES surfers(id),
  surfer_c1_id uuid NOT NULL REFERENCES surfers(id),
  surfer_c2_id uuid NOT NULL REFERENCES surfers(id),
  power_surfer_id uuid NOT NULL REFERENCES surfers(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contest_id)
);

-- Create surfer points table
CREATE TABLE surfer_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surfer_id uuid NOT NULL REFERENCES surfers(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  league_type league_type NOT NULL,
  points decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(surfer_id, contest_id, league_type)
);

-- Create contest standings table
CREATE TABLE contest_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  league_type league_type NOT NULL,
  points decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contest_id, league_type)
);

-- Create indexes for better query performance
CREATE INDEX idx_surfers_name ON surfers(last_name, first_name);
CREATE INDEX idx_contests_dates ON contests(start_date, end_date);
CREATE INDEX idx_contests_active ON contests(is_active) WHERE is_active = true;
CREATE INDEX idx_surfer_points_contest ON surfer_points(contest_id, league_type);
CREATE INDEX idx_contest_standings_contest ON contest_standings(contest_id, league_type);

-- Enable Row Level Security
ALTER TABLE surfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_surfer_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_surf_league_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE surfer_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_standings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Public surfers are viewable by everyone" ON surfers
  FOR SELECT USING (true);

CREATE POLICY "Contests are viewable by everyone" ON contests
  FOR SELECT USING (true);

CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all fantasy surfer rosters" ON fantasy_surfer_rosters
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own fantasy surfer rosters" ON fantasy_surfer_rosters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all WSL rosters" ON world_surf_league_rosters
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own WSL rosters" ON world_surf_league_rosters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Surfer points are viewable by everyone" ON surfer_points
  FOR SELECT USING (true);

CREATE POLICY "Contest standings are viewable by everyone" ON contest_standings
  FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_surfers_updated_at
  BEFORE UPDATE ON surfers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surfer_points_updated_at
  BEFORE UPDATE ON surfer_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contest_standings_updated_at
  BEFORE UPDATE ON contest_standings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();