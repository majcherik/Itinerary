-- Migration: Create shared_trips table for trip sharing functionality
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS shared_trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    password_hash TEXT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups by share_token
CREATE INDEX IF NOT EXISTS idx_shared_trips_share_token ON shared_trips(share_token);

-- Create index for faster lookups by trip_id
CREATE INDEX IF NOT EXISTS idx_shared_trips_trip_id ON shared_trips(trip_id);

-- Enable Row Level Security
ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to create share links for their own trips
CREATE POLICY "Users can create share links for their trips"
ON shared_trips
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = shared_trips.trip_id
        AND trips.user_id = auth.uid()
    )
);

-- Policy: Allow users to view share links for their own trips
CREATE POLICY "Users can view their own share links"
ON shared_trips
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = shared_trips.trip_id
        AND trips.user_id = auth.uid()
    )
);

-- Policy: Allow anyone to view active, non-expired share links (for public sharing)
CREATE POLICY "Anyone can view active share links by token"
ON shared_trips
FOR SELECT
USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
);

-- Policy: Allow users to update their own share links
CREATE POLICY "Users can update their own share links"
ON shared_trips
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = shared_trips.trip_id
        AND trips.user_id = auth.uid()
    )
);

-- Policy: Allow users to delete their own share links
CREATE POLICY "Users can delete their own share links"
ON shared_trips
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = shared_trips.trip_id
        AND trips.user_id = auth.uid()
    )
);

-- Create function to generate random share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
    characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(characters, floor(random() * length(characters) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE shared_trips IS 'Stores shareable links for trips with optional password protection and expiration';
COMMENT ON COLUMN shared_trips.share_token IS 'Unique token used in the share URL';
COMMENT ON COLUMN shared_trips.password_hash IS 'Bcrypt hash of password if the share link is protected';
COMMENT ON COLUMN shared_trips.expires_at IS 'Timestamp when the share link expires (NULL = never expires)';
COMMENT ON COLUMN shared_trips.is_active IS 'Whether the share link is currently active';
