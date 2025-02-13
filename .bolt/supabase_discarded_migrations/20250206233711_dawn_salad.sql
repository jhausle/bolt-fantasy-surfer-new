/*
  # Initial Schema for WSL Fantasy Tracker

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `avatar_url` (text)

    - `contests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `location` (text)
      - `created_at` (timestamp)

    - `wsl_rosters`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key)
      - `contest_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `fantasy_rosters`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key)
      - `contest_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `surfers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image_url` (text)
      - `events` (integer)
      - `avg_score` (decimal)
      - `rank` (integer)
      - `created_at` (timestamp)

    - `roster_surfers`
      - `id` (uuid, primary key)
      - `roster_id` (uuid, foreign key)
      - `surfer_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admins have full access
    - Members can read all data but only modify their own rosters

  3. Relationships
    - Members have many WSL and Fantasy rosters
    - Contests have many rosters
    - Rosters belong to members and contests
    - Rosters have many surfers through roster_surfers
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  avatar_url text
);

-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create surfers table
CREATE TABLE IF NOT EXISTS surfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  events integer DEFAULT 0,
  avg_score decimal(4,2) DEFAULT 0,
  rank integer,
  created_at timestamptz DEFAULT now()
);

-- Create WSL rosters table
CREATE TABLE IF NOT EXISTS wsl_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, contest_id)
);

-- Create Fantasy rosters table
CREATE TABLE IF NOT EXISTS fantasy_rosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, contest_id)
);

-- Create roster_surfers junction table
CREATE TABLE IF NOT EXISTS roster_surfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_id uuid NOT NULL,
  surfer_id uuid NOT NULL REFERENCES surfers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(roster_id, surfer_id)
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE surfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wsl_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_surfers ENABLE ROW LEVEL SECURITY;

-- Create policies for members
CREATE POLICY "Members can view all members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update their own profile"
  ON members FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for contests
CREATE POLICY "Anyone can view contests"
  ON contests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage contests"
  ON contests FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members 
    WHERE id = auth.uid() 
    AND is_admin = true
  ));

-- Create policies for surfers
CREATE POLICY "Anyone can view surfers"
  ON surfers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage surfers"
  ON surfers FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members 
    WHERE id = auth.uid() 
    AND is_admin = true
  ));

-- Create policies for WSL rosters
CREATE POLICY "Members can view all WSL rosters"
  ON wsl_rosters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can manage their own WSL rosters"
  ON wsl_rosters FOR ALL
  TO authenticated
  USING (member_id = auth.uid());

-- Create policies for Fantasy rosters
CREATE POLICY "Members can view all Fantasy rosters"
  ON fantasy_rosters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can manage their own Fantasy rosters"
  ON fantasy_rosters FOR ALL
  TO authenticated
  USING (member_id = auth.uid());

-- Create policies for roster_surfers
CREATE POLICY "Members can view all roster surfers"
  ON roster_surfers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can manage their own roster surfers"
  ON roster_surfers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wsl_rosters 
      WHERE id = roster_surfers.roster_id 
      AND member_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fantasy_rosters 
      WHERE id = roster_surfers.roster_id 
      AND member_id = auth.uid()
    )
  );