-- Remove duplicates first, keeping only the most recent entry for each b2_file_key
DELETE FROM photos 
WHERE id NOT IN (
  SELECT DISTINCT ON (b2_file_key) id 
  FROM photos 
  ORDER BY b2_file_key, created_at DESC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE photos ADD CONSTRAINT unique_b2_file_key UNIQUE (b2_file_key);