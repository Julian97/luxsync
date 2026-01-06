-- Add optimized_url column to photos table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'photos' AND column_name = 'optimized_url') THEN
    ALTER TABLE photos ADD COLUMN optimized_url TEXT;
  END IF;
END $$;