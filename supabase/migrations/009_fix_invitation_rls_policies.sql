-- ============================================================================
-- Fix Invitation RLS Policies
-- ============================================================================
-- Fixes two issues:
-- 1. Users couldn't accept invitations (500 error) - needed INSERT policy
-- 2. Users couldn't decline invitations - needed UPDATE policy
-- ============================================================================

-- ============================================================================
-- 1. CREATE HELPER FUNCTION TO AVOID RECURSION
-- ============================================================================

-- Function to check if user has a valid invitation for a trip
CREATE OR REPLACE FUNCTION user_has_valid_invitation(trip_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    has_invitation BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM trip_invitations
        JOIN profiles ON profiles.id = auth.uid()
        WHERE trip_invitations.trip_id = trip_id_param
        AND trip_invitations.email = profiles.email
        AND trip_invitations.status = 'pending'
        AND trip_invitations.expires_at > NOW()
    ) INTO has_invitation;

    RETURN COALESCE(has_invitation, false);
END;
$$;

-- ============================================================================
-- 2. ALLOW USERS TO ACCEPT INVITATIONS
-- ============================================================================

-- Allow users to insert themselves as collaborators when accepting invitations
CREATE POLICY "Users can accept invitations" ON trip_collaborators
FOR INSERT
WITH CHECK (
    user_id = auth.uid()
    AND user_has_valid_invitation(trip_id)
);

-- ============================================================================
-- 3. ALLOW USERS TO RESPOND TO INVITATIONS (DECLINE)
-- ============================================================================

-- Allow users to update invitations sent to their email (for declining)
CREATE POLICY "Users can respond to invitations" ON trip_invitations
FOR UPDATE
USING (
    email IN (
        SELECT email FROM profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    email IN (
        SELECT email FROM profiles WHERE id = auth.uid()
    )
);
