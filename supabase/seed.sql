-- Create the 'private' bucket
INSERT INTO storage.buckets 
  ("id", "name", "created_at", "updated_at", "public", "avif_autodetection")
VALUES
  ('private', 'private', '2024-05-21 23:43:16.762796+00', '2024-05-21 23:43:16.762796+00', true, false),
  ('spaces', 'spaces', '2024-05-21 23:43:16.762796+00', '2024-05-21 23:43:16.762796+00', true, false);
