-- Seed data for Taleify MVP
-- Using LibriVox public domain audiobooks

-- Insert sample stories (regular audiobooks)
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

-- Insert sample stories with custom voices (My Voice section)
INSERT INTO stories (id, title, author, description, cover_url, voice_id, voice_name) VALUES
(
  '550e8400-e29b-41d4-a716-446655440004',
  'The Great Gatsby',
  'F. Scott Fitzgerald',
  'A tale of wealth, love, and the American Dream in the Roaring Twenties. Narrated in your own voice.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'custom_voice_001',
  'My Voice Clone'
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Frankenstein',
  'Mary Shelley',
  'The classic tale of science, ambition, and the monster within. Experience it with your personalized narration.',
  'https://images.unsplash.com/photo-1509248961895-40c8d8b7be5e?w=400&h=600&fit=crop',
  'custom_voice_002',
  'My Voice Clone'
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Dracula',
  'Bram Stoker',
  'The immortal vampire tale that defined a genre. Hear it narrated in your unique voice.',
  'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=400&h=600&fit=crop',
  'custom_voice_003',
  'My Voice Clone'
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

-- Insert chapters for voice-cloned stories
INSERT INTO chapters (story_id, title, order_index, audio_url, duration_ms) VALUES
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Chapter 1: In My Younger Years',
  1,
  'https://www.archive.org/download/great_gatsby_librivox/greatgatsby_01_fitzgerald.mp3',
  900000
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Chapter 2: The Valley of Ashes',
  2,
  'https://www.archive.org/download/great_gatsby_librivox/greatgatsby_02_fitzgerald.mp3',
  1080000
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Letter 1: To Mrs. Saville',
  1,
  'https://www.archive.org/download/frankenstein_1818_librivox/frankenstein_01_shelley.mp3',
  720000
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Letter 2: To Mrs. Saville',
  2,
  'https://www.archive.org/download/frankenstein_1818_librivox/frankenstein_02_shelley.mp3',
  600000
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Jonathan Harker''s Journal',
  1,
  'https://www.archive.org/download/dracula_librivox/dracula_01_stoker.mp3',
  1200000
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'Jonathan Harker''s Journal (Continued)',
  2,
  'https://www.archive.org/download/dracula_librivox/dracula_02_stoker.mp3',
  1320000
);
