/*
  # Insert WSL Championship Tour Events for 2025

  1. Data Changes
    - Insert 12 WSL Championship Tour events for 2025 season
    - Events span from January (Pipeline) to September (Cloudbreak Finals)
    - One event (Pipeline) marked as currently active
  
  2. Notes
    - All events are part of the 2025 World Surf League Championship Tour
    - Dates are set for the entire 2025 season
    - Geographic diversity: Events across USA, Australia, Portugal, Brazil, UAE, etc.
*/

INSERT INTO contests (
  id,
  name,
  description,
  year,
  country,
  start_date,
  end_date,
  last_updated_at,
  is_active,
  is_completed
) VALUES
  ('01359d79-ea8d-40ef-b965-e796ecf42b50', 'WSL Finals - Cloudbreak', 'World Surf League Championship Tour Event', 2025, 'Fiji', '2025-08-27', '2025-09-04', '2025-02-02 15:49:47', false, false),
  ('21c1c4dc-9a6c-4ed0-a9aa-e521debc4441', 'Punta Roca', 'World Surf League Championship Tour Event', 2025, 'El Salvador', '2025-04-02', '2025-04-12', '2025-02-02 15:49:47', false, false),
  ('28bf45dc-de15-47c1-98f9-bf89d76b87bf', 'Teahupo''o', 'World Surf League Championship Tour Event', 2025, 'French Polynesia', '2025-08-07', '2025-08-16', '2025-02-02 15:49:47', false, false),
  ('61475ece-c201-4f5d-9699-327241b544fe', 'Banzai Pipeline', 'World Surf League Championship Tour Event', 2025, 'USA', '2025-01-27', '2025-02-08', '2025-02-02 15:49:47', true, false),
  ('650f64a5-53e5-43ef-a33d-64e59d7f107e', 'Jeffreys Bay', 'World Surf League Championship Tour Event', 2025, 'South Africa', '2025-07-11', '2025-07-20', '2025-02-02 15:49:47', false, false),
  ('96e6960b-9b12-4b9a-a750-eafde32cb5d8', 'Surf Abu Dhabi', 'World Surf League Championship Tour Event', 2025, 'UAE', '2025-02-14', '2025-02-16', '2025-02-02 15:49:47', false, false),
  ('9b4b83c9-44e1-4ed3-9c62-58b3392337a2', 'Margaret River', 'World Surf League Championship Tour Event', 2025, 'Australia', '2025-05-17', '2025-05-27', '2025-02-02 15:49:47', false, false),
  ('c24754bc-b88b-48f8-8925-6ac27e641b47', 'Bells Beach', 'World Surf League Championship Tour Event', 2025, 'Australia', '2025-04-18', '2025-04-28', '2025-02-02 15:49:47', false, false),
  ('d3b289ce-ee25-4227-b749-14106afd32a5', 'Snapper Rocks', 'World Surf League Championship Tour Event', 2025, 'Australia', '2025-05-03', '2025-05-13', '2025-02-02 15:49:47', false, false),
  ('f0d23bfc-3b03-4692-84df-3c002a0ef16e', 'Peniche', 'World Surf League Championship Tour Event', 2025, 'Portugal', '2025-03-15', '2025-03-25', '2025-02-02 15:49:47', false, false),
  ('f100b652-17a4-4f97-bb67-7e9fa514bb23', 'Saquarema', 'World Surf League Championship Tour Event', 2025, 'Brazil', '2025-06-21', '2025-06-29', '2025-02-02 15:49:47', false, false),
  ('fc971eee-6438-4e22-9c2b-bcaf2ca5cb28', 'Lower Trestles', 'World Surf League Championship Tour Event', 2025, 'USA', '2025-06-09', '2025-06-17', '2025-02-02 15:49:47', false, false);