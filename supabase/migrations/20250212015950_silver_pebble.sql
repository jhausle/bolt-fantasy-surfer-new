/*
  # Make Fantasy Surfer roster fields optional

  1. Changes
    - Make all surfer fields optional except surfer_1_id
    - Make all price fields optional except surfer_1_price
    - This allows rosters to have any number of surfers from 1-9

  2. Notes
    - surfer_1 remains required to ensure at least one surfer per roster
    - All other surfer/price fields become optional
    - Maintains existing foreign key relationships
*/

-- Modify surfer fields to be optional
ALTER TABLE fantasy_surfer_rosters
  ALTER COLUMN surfer_2_id DROP NOT NULL,
  ALTER COLUMN surfer_3_id DROP NOT NULL,
  ALTER COLUMN surfer_4_id DROP NOT NULL,
  ALTER COLUMN surfer_5_id DROP NOT NULL,
  ALTER COLUMN surfer_6_id DROP NOT NULL,
  ALTER COLUMN surfer_7_id DROP NOT NULL,
  ALTER COLUMN surfer_8_id DROP NOT NULL;

-- Modify price fields to match their corresponding surfer fields
ALTER TABLE fantasy_surfer_rosters
  ALTER COLUMN surfer_2_price DROP NOT NULL,
  ALTER COLUMN surfer_3_price DROP NOT NULL,
  ALTER COLUMN surfer_4_price DROP NOT NULL,
  ALTER COLUMN surfer_5_price DROP NOT NULL,
  ALTER COLUMN surfer_6_price DROP NOT NULL,
  ALTER COLUMN surfer_7_price DROP NOT NULL,
  ALTER COLUMN surfer_8_price DROP NOT NULL;