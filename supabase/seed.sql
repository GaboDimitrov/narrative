-- Seed data for Taleify MVP
-- Using LibriVox public domain audiobooks

-- Insert sample stories
INSERT INTO stories (id, title, author, description, cover_url) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'The Time Machine',
  'H.G. Wells',
  'A Victorian scientist travels through time to discover the fate of humanity in this groundbreaking science fiction classic. Experience the eerie world of the Eloi and the terrifying Morlocks.',
  'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=600&fit=crop'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'The Adventures of Sherlock Holmes',
  'Arthur Conan Doyle',
  'Join the world''s greatest detective and his faithful companion Dr. Watson as they solve the most mysterious cases in Victorian London. A masterpiece of detective fiction.',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Pride and Prejudice',
  'Jane Austen',
  'Follow Elizabeth Bennet as she navigates love, family, and society in Regency England. A timeless romance filled with wit, charm, and unforgettable characters.',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
);

-- Insert chapters for The Time Machine
-- Using actual LibriVox recordings
INSERT INTO chapters (story_id, title, order_index, audio_url, duration_ms) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Introduction',
  1,
  'https://www.archive.org/download/time_machine_librivox/timemachine_01_wells.mp3',
  720000
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'The Time Traveller Returns',
  2,
  'https://www.archive.org/download/time_machine_librivox/timemachine_02_wells.mp3',
  840000
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'The Journey Through Time',
  3,
  'https://www.archive.org/download/time_machine_librivox/timemachine_03_wells.mp3',
  960000
);

-- Insert chapters for Sherlock Holmes
INSERT INTO chapters (story_id, title, order_index, audio_url, duration_ms) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  'A Scandal in Bohemia',
  1,
  'https://www.archive.org/download/adventures_sherlock_holmes_1012_librivox/adventuresholmes_01_doyle.mp3',
  1800000
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'The Red-Headed League',
  2,
  'https://www.archive.org/download/adventures_sherlock_holmes_1012_librivox/adventuresholmes_02_doyle.mp3',
  1680000
);

-- Insert chapters for Pride and Prejudice
INSERT INTO chapters (story_id, title, order_index, audio_url, duration_ms) VALUES
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Chapter 1: It is a truth universally acknowledged',
  1,
  'https://www.archive.org/download/pride_prejudice_librivox/prideandprejudice_01_austen.mp3',
  420000
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Chapter 2: Mr. Bennet was among the earliest',
  2,
  'https://www.archive.org/download/pride_prejudice_librivox/prideandprejudice_02_austen.mp3',
  360000
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Chapter 3: Not all that Mrs. Bennet said',
  3,
  'https://www.archive.org/download/pride_prejudice_librivox/prideandprejudice_03_austen.mp3',
  480000
);
