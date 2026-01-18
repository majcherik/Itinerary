-- Migration: Fix shared_trips foreign key constraint to handle user deletions
-- This migration updates the created_by foreign key to SET NULL on user deletion
-- instead of blocking the deletion

-- Drop the existing foreign key constraint
ALTER TABLE shared_trips DROP CONSTRAINT IF EXISTS shared_trips_created_by_fkey;

-- Recreate it with ON DELETE SET NULL
-- This allows users to be deleted without error, and sets created_by to NULL
-- for any shared trips they created
ALTER TABLE shared_trips
ADD CONSTRAINT shared_trips_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE SET NULL;

COMMENT ON CONSTRAINT shared_trips_created_by_fkey ON shared_trips IS
'Foreign key to auth.users with ON DELETE SET NULL - allows user deletion while preserving shared trip records';
