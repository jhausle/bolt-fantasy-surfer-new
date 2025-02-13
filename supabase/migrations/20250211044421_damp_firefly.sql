/*
  # Add stop number to contests table

  1. Changes
    - Add stop_number column to contests table
    - Add NOT NULL constraint since every contest needs a stop number
    - Add CHECK constraint to ensure stop number is positive
*/

ALTER TABLE contests 
ADD COLUMN stop_number integer NOT NULL DEFAULT 1 
CHECK (stop_number > 0);

-- Add comment to explain the column
COMMENT ON COLUMN contests.stop_number IS 'The stop number for this contest in the tour (e.g., Stop #1, Stop #2, etc.)';