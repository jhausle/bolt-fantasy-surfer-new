/*
  # Insert WSL Championship Tour Surfers

  1. Data Changes
    - Insert 34 professional surfers
    - Include personal details: name, country, stance, birth date
    - Mix of regular and goofy stances
    - International representation from multiple countries
  
  2. Notes
    - All surfers are active WSL Championship Tour competitors
    - Birth dates preserved for accurate age tracking
    - Stance information included for all surfers
*/

INSERT INTO surfers (
  id,
  first_name,
  last_name,
  country,
  stance,
  birth_date
) VALUES
  ('0402189c-f180-460c-96c4-2bd1d5e2d121', 'Liam', 'O''Brien', 'Australia', 'regular', '1999-05-02'),
  ('069cd16b-1a2b-448f-b199-68fbd0dd1274', 'Caio', 'Ibelli', 'Brazil', 'regular', '1993-10-11'),
  ('1046f95d-899e-4280-994e-eeb2b7ab2072', 'Yago', 'Dora', 'Brazil', 'goofy', '1996-05-18'),
  ('18fdda6e-551d-4adb-aee2-5f337ccfa6ed', 'Griffin', 'Colapinto', 'USA', 'regular', '1998-07-29'),
  ('1d3eb0b0-4a79-4938-a2be-3bf9104cbd43', 'Kade', 'Matson', 'USA', 'regular', '2002-05-16'),
  ('216ac271-cf8d-4d53-9737-009993647d9f', 'John John', 'Florence', 'Hawaii', 'regular', '1992-11-18'),
  ('2ba6b6d0-7a39-4a95-a5aa-d99845c4c8fc', 'Imaikalani', 'deVault', 'Hawaii', 'regular', '1997-11-12'),
  ('2beb021e-6004-4d21-afa4-58e56fbcb712', 'Rio', 'Waida', 'Indonesia', 'regular', '2000-01-25'),
  ('3460d564-36b3-4db6-beb9-420be6e11fa8', 'Leonardo', 'Fioravanti', 'Italy', 'regular', '1997-12-08'),
  ('3665962c-b946-45b8-986b-2bf7268b8303', 'Italo', 'Ferreira', 'Brazil', 'goofy', '1994-05-06'),
  ('3eeb8ebe-36bd-44c7-81ca-753291882ead', 'Ramzi', 'Boukhiam', 'Morocco', 'goofy', '1993-09-14'),
  ('57cb3a2d-1010-4b3d-829b-5f8ddd08a956', 'Callum', 'Robson', 'Australia', 'regular', '2000-11-27'),
  ('583352e7-e586-4787-a6ed-19771576f8ac', 'Crosby', 'Colapinto', 'USA', 'regular', '2001-07-15'),
  ('667b99b3-fd2b-481e-a15f-cfbfb9333439', 'Ryan', 'Callinan', 'Australia', 'goofy', '1992-05-27'),
  ('7139a0ff-c5d0-4dbf-86e3-4f431fd1b317', 'Joao', 'Chianca', 'Brazil', 'regular', '2000-08-30'),
  ('71779143-5b2b-4011-b0cd-bcf705984b0e', 'Seth', 'Moniz', 'Hawaii', 'regular', '1997-08-09'),
  ('77d3f11c-6536-4e00-a09a-50674740e2e8', 'Gabriel', 'Medina', 'Brazil', 'goofy', '1993-12-22'),
  ('77da25e7-11a1-43dc-badb-917ead6d805c', 'Ethan', 'Ewing', 'Australia', 'regular', '1998-09-02'),
  ('7ff12687-1728-4db0-9d62-37767fec602c', 'Jacob', 'Wilcox', 'Australia', 'goofy', '1997-06-02'),
  ('87a9a83b-d510-4dd2-a9db-5a6f8d4644c2', 'Ian', 'Gentil', 'Hawaii', 'regular', '1996-12-02'),
  ('8b138159-51b3-4842-9f52-fab77284b614', 'Kelly', 'Slater', 'USA', 'regular', '1972-12-11'),
  ('8b24a23e-ad63-4a1a-8c46-2840958b90b4', 'Jake', 'Marshall', 'USA', 'regular', '1998-11-12'),
  ('9a18a04a-cb14-478f-bd98-1e822bf14bce', 'Miguel', 'Pupo', 'Brazil', 'goofy', '1991-11-19'),
  ('a35d7809-d11e-40c4-ba65-f3b95a5dbd87', 'Jack', 'Robinson', 'Australia', 'regular', '1997-12-27'),
  ('a3787d6b-7bde-48ad-9566-09c8cc833c8c', 'Deivid', 'Silva', 'Brazil', 'goofy', '1995-02-10'),
  ('a3a7b21e-6579-44c6-97bc-3d5b92a9e45b', 'Baron', 'Mamiya', 'Hawaii', 'regular', '2000-01-27'),
  ('a9b4ee68-ea39-4ec2-9fda-77751a01afc8', 'Connor', 'O''Leary', 'Japan', 'goofy', '1993-10-12'),
  ('b14da6ee-3078-4a23-9cdc-f1b3d0a6a70b', 'Frederico', 'Morais', 'Portugal', 'regular', '1992-01-03'),
  ('c437ba61-ced5-43bf-b311-f78c1772a1c8', 'Samuel', 'Pupo', 'Brazil', 'regular', '1992-11-18'),
  ('c533f332-7d18-4bf5-8f08-9f65553c4d29', 'Kanoa', 'Igarashi', 'Japan', 'regular', '1997-10-01'),
  ('c9b11d67-4074-4f7b-a4ae-7b7a6ed618bb', 'Matthew', 'McGillivray', 'Hawaii', 'regular', '1997-03-26'),
  ('dffe60ed-17a3-48d8-a62a-bf0ffb83b756', 'Filipe', 'Toledo', 'Brazil', 'regular', '1995-04-16'),
  ('e316f8eb-2384-4bfa-b415-dad0ba50e6ea', 'Jordy', 'Smith', 'South Africa', 'regular', '1988-02-11'),
  ('ee704629-70b0-4599-b421-92a077ec82f0', 'Cole', 'Houshmand', 'USA', 'goofy', '2000-12-27'),
  ('fb01e7c9-bb33-4592-82c3-01eb8b106cc9', 'Eli', 'Hanneman', 'Hawaii', 'regular', '2002-11-07');