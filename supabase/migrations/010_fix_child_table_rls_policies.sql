-- ============================================================================
-- Fix Child Table RLS Policies
-- ============================================================================
-- Updates all child table RLS policies to use user_can_access_trip() helper
-- function instead of directly querying trip_collaborators. This prevents
-- potential recursion issues when querying trips through trip_collaborators.
-- ============================================================================

-- ============================================================================
-- 1. ITINERARY_ITEMS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Owners and editors can modify itinerary items" ON itinerary_items;

-- Recreate with helper function
CREATE POLICY "Collaborators can view itinerary items" ON itinerary_items
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Owners and editors can modify itinerary items" ON itinerary_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = itinerary_items.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 2. ACCOMMODATION
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view accommodation" ON accommodation;
DROP POLICY IF EXISTS "Owners and editors can modify accommodation" ON accommodation;

-- Recreate with helper function
CREATE POLICY "Collaborators can view accommodation" ON accommodation
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Owners and editors can modify accommodation" ON accommodation
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = accommodation.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 3. TRANSPORT
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view transport" ON transport;
DROP POLICY IF EXISTS "Owners and editors can modify transport" ON transport;

-- Recreate with helper function
CREATE POLICY "Collaborators can view transport" ON transport
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Owners and editors can modify transport" ON transport
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = transport.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 4. DOCUMENTS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view documents" ON documents;
DROP POLICY IF EXISTS "Owners and editors can modify documents" ON documents;

-- Recreate with helper function
CREATE POLICY "Collaborators can view documents" ON documents
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Owners and editors can modify documents" ON documents
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = documents.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 5. PACKING_ITEMS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view packing items" ON packing_items;
DROP POLICY IF EXISTS "Owners and editors can modify packing items" ON packing_items;

-- Recreate with helper function
CREATE POLICY "Collaborators can view packing items" ON packing_items
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Owners and editors can modify packing items" ON packing_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = packing_items.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 6. TICKETS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view tickets" ON tickets;
DROP POLICY IF EXISTS "Owners and editors can modify tickets" ON tickets;

-- Recreate with helper function
CREATE POLICY "Collaborators can view tickets" ON tickets
FOR SELECT
USING (user_can_access_trip(trip_id));

CREATE POLICY "Owners and editors can modify tickets" ON tickets
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = tickets.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 7. EXPENSES (Special case: All collaborators can INSERT)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view expenses" ON expenses;
DROP POLICY IF EXISTS "All collaborators can add expenses" ON expenses;
DROP POLICY IF EXISTS "Owners and editors can modify expenses" ON expenses;

-- Recreate with helper function
CREATE POLICY "Collaborators can view expenses" ON expenses
FOR SELECT
USING (user_can_access_trip(trip_id));

-- ALL collaborators (including viewers) can add expenses
CREATE POLICY "All collaborators can add expenses" ON expenses
FOR INSERT
WITH CHECK (user_can_access_trip(trip_id));

-- Only Owners/Editors can update/delete
CREATE POLICY "Owners and editors can modify expenses" ON expenses
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = expenses.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can delete expenses" ON expenses
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = expenses.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);
