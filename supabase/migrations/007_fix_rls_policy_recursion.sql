-- ============================================================================
-- Fix RLS Policy Infinite Recursion
-- ============================================================================
-- Fixes the circular dependency between trips and trip_collaborators policies
-- that was causing "infinite recursion detected" errors
-- ============================================================================

-- ============================================================================
-- 1. CREATE HELPER FUNCTION TO BREAK RECURSION
-- ============================================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS user_can_access_trip(BIGINT);

-- Function to check if user can access a trip (breaks circular dependency)
CREATE OR REPLACE FUNCTION user_can_access_trip(trip_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    can_access BOOLEAN;
BEGIN
    -- Check if user is trip owner OR is an active collaborator
    SELECT EXISTS (
        SELECT 1 FROM trips
        WHERE id = trip_id_param
        AND user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_id = trip_id_param
        AND user_id = auth.uid()
        AND status = 'active'
    ) INTO can_access;

    RETURN COALESCE(can_access, false);
END;
$$;

-- ============================================================================
-- 2. FIX TRIP_COLLABORATORS POLICIES
-- ============================================================================

-- Drop recursive policies
DROP POLICY IF EXISTS "View collaborators of accessible trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Owners can manage collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can view own collaborator record" ON trip_collaborators;

-- Create simple non-recursive policies
CREATE POLICY "Users can view trip collaborators" ON trip_collaborators
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Trip owners can manage collaborators" ON trip_collaborators
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = trip_collaborators.trip_id
        AND trips.user_id = auth.uid()
    )
);

-- ============================================================================
-- 3. FIX TRIPS POLICIES
-- ============================================================================

-- Drop recursive policies
DROP POLICY IF EXISTS "Users can view owned or collaborated trips" ON trips;
DROP POLICY IF EXISTS "Owners and editors can update trips" ON trips;
DROP POLICY IF EXISTS "Only owners can delete trips" ON trips;

-- Create non-recursive policies using helper function
CREATE POLICY "Users can view accessible trips" ON trips
FOR SELECT
USING (user_can_access_trip(id));

CREATE POLICY "Trip owners and editors can update" ON trips
FOR UPDATE
USING (
    user_id = auth.uid()  -- Owner can update
    OR EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_id = trips.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'editor')
        AND status = 'active'
    )
);

CREATE POLICY "Trip owners can delete" ON trips
FOR DELETE
USING (user_id = auth.uid());
