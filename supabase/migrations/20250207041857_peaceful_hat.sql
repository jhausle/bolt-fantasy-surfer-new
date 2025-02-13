/*
  # Insert initial users data

  1. Data Changes
    - Insert 15 initial users with their WSL and Fantasy Surfer credentials
  
  2. Notes
    - All users are pre-configured with their WSL and Fantasy Surfer IDs
    - One user (bmill666) is marked as admin in the data
*/

INSERT INTO users (
  id,
  email,
  secondary_email,
  first_name,
  last_name,
  wsl_name,
  wsl_id,
  fantasy_surfer_name,
  fantasy_surfer_id
) VALUES
  ('01f71ebd-1f21-49cc-9de6-bbb2b04c2f0b', 'curcikid@example.com', 'curcikid@example.com', 'Nick', 'Curci', 'curcikid', '1292901', 'curcikid', '196595'),
  ('0d40b4ec-e4c3-4d0b-8b47-5c119c8c16fa', 'nest13@example.com', 'sneste@example.com', 'Spencer', 'Neste', 'Nest13', '1311163', 'Sneste', '250651'),
  ('1a0c388d-a1fc-489f-8915-d2ca553a1775', 'dballer69@example.com', 'dballer69@example.com', 'Denton', 'VanDuzer', 'Dballer69', '1310175', 'dballer69', '249507'),
  ('38eb254e-078b-45e5-8820-e36f380caad3', 'mrbuckets@example.com', 'mrbucketsss@example.com', 'Hunter', 'VanDuzer', 'MrBuckets', '1315880', 'MrBucketsss', '250691'),
  ('47073f12-44c0-4899-bbc3-e9fce5562352', 'jhausle@example.com', 'jhausle@example.com', 'John', 'Hausle', 'jhausle', '1303227', 'jhausle', '245816'),
  ('644f6eb8-3ca8-495e-85b0-ea1eabdf2402', '29thstreet@example.com', '29thstreet@example.com', 'Connor', 'Davidge', '29thstreet', '1271756', '29thStreet', '170694'),
  ('676f767c-3fe1-47ec-ad0c-be34b58ad8d2', 'eggy_guy@example.com', 'EGGYGUY@example.com', 'Dana', 'Tuttle', 'EGGY_GUY', '1305420', 'EGGYGUY', '175725'),
  ('6a066145-a8dd-4d01-8422-49de5468d3b4', 'dropindev@example.com', 'dsoujaboy@example.com', 'Devon', 'Sousa', 'Drop-inDev', '1295843', 'dsoujaboy', '64989'),
  ('70cd9549-cadf-4a6c-9d50-ebd1501e9c5f', 'jmonk92@example.com', 'jmonk92@example.com', 'Julian', 'Monk', 'JMonk92', '1302380', 'Jmonk92', '247890'),
  ('70fc8f8b-57f5-4039-a784-822b409c6a82', 'jake_miller@example.com', 'jmiller@example.com', 'Jake', 'Miller', 'jake_miller', '1302333', 'jmiller', '155865'),
  ('7a8fd753-0a27-435d-8caf-2841475e3c9e', 'gnarf@example.com', 'gnarf310@example.com', 'Gnarf', NULL, 'gnarf', '1295830', 'gnarf310', '232353'),
  ('ad341901-dad3-4ca8-8942-941a572a3db7', 'brycemiller6@example.com', 'bmill666@example.com', 'Bryce', 'Miller', 'Brycemiller6', '1293240', 'bmill666', '115705'),
  ('b5b8dbbe-379d-4495-be8d-ea5222ec7773', 'backsidemccutty@example.com', 'backsidemccutty@example.com', 'Chaz', 'James', 'BacksideMcCutty', '1296461', 'backsidemccutty', '250375'),
  ('e971429f-d1aa-4b91-abe8-f42f4477554c', 'ebronner@example.com', 'ebronzer@example.com', 'Evan', 'Bronner', 'Ebronner', '1296568', 'ebronzer', '131763'),
  ('f1679464-d68d-4729-9060-07124a4040c7', 'bobbyp@example.com', 'rcparucha@example.com', 'Robert', 'Parucha', 'BobbyP', '1327479', 'rcparucha', '224809');