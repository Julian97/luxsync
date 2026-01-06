-- Change user_tag_id from UUID to TEXT if it's currently UUID
-- First, we need to drop the foreign key constraint
ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_user_tag_id_fkey;

-- Change the column type from UUID to TEXT
-- Since we can't directly change UUID to TEXT, we'll need to handle this carefully
-- If the column is already TEXT, this won't cause issues
-- If it's UUID, we'll need to handle the conversion

-- Check current column type
DO $$
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type 
    INTO column_type
    FROM information_schema.columns 
    WHERE table_name = 'photos' AND column_name = 'user_tag_id';
    
    IF column_type = 'uuid' THEN
        -- If it's UUID, drop the column and recreate it as TEXT
        ALTER TABLE photos ADD COLUMN user_tag_id_new TEXT;
        UPDATE photos SET user_tag_id_new = CAST(user_tag_id AS TEXT) WHERE user_tag_id IS NOT NULL;
        ALTER TABLE photos DROP COLUMN user_tag_id;
        ALTER TABLE photos RENAME COLUMN user_tag_id_new TO user_tag_id;
    END IF;
END $$;

-- Recreate the foreign key constraint
ALTER TABLE photos ADD CONSTRAINT photos_user_tag_id_fkey 
FOREIGN KEY (user_tag_id) REFERENCES users(id);