-- ============================================================================
-- Fix Profiles RLS Policy
-- ============================================================================
-- Allows users to view profiles of other users who collaborate on trips
-- they have access to. This fixes the "Cannot read properties of null" error
-- when viewing shared trips.
-- ============================================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create comprehensive policy that allows viewing own profile and collaborator profiles
CREATE POLICY "Users can view own and collaborator profiles" ON profiles
FOR SELECT
USING (
    id = auth.uid()  -- Users can view their own profile
    OR
    EXISTS (
        -- OR users can view profiles of people they collaborate with
        SELECT 1 FROM trip_collaborators tc1
        INNER JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
        WHERE tc1.user_id = auth.uid()
        AND tc1.status = 'active'
        AND tc2.user_id = profiles.id
        AND tc2.status = 'active'
    )
);
