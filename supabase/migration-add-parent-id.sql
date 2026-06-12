-- Safe migration: add parent_id to services if not present
-- This is safe to run even if the column already exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'parent_id'
  ) THEN
    EXECUTE 'ALTER TABLE services ADD COLUMN parent_id text REFERENCES services(id) ON DELETE CASCADE';
    RAISE NOTICE 'Column parent_id added to services table';
  ELSE
    RAISE NOTICE 'Column parent_id already exists in services table';
  END IF;
END $$;

-- Ensure index exists (harmless if already present)
CREATE INDEX IF NOT EXISTS idx_services_parent ON services(parent_id);
