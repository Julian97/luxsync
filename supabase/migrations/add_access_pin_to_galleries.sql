-- Add access_pin column to galleries table
ALTER TABLE galleries ADD COLUMN access_pin TEXT;

-- Optional: Add a comment to document the purpose of the column
COMMENT ON COLUMN galleries.access_pin IS 'PIN code required to access the gallery if not null';