-- ============================================================================
-- Trip Collaboration System Migration
-- ============================================================================
-- Creates comprehensive collaboration system with:
-- - trip_collaborators table for managing team members
-- - trip_invitations table for email-based invitations
-- - Row Level Security policies for all tables
-- - User ID-based expense tracking
-- - Auto-migration of existing trips to owner records
-- ============================================================================

-- ============================================================================
-- 1. CREATE COLLABORATION TABLES
-- ============================================================================

-- Table: trip_collaborators
-- Stores active and former collaborators with their roles
CREATE TABLE IF NOT EXISTS trip_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'former_member')),

    -- Metadata for tracking invitation/removal history
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    removed_at TIMESTAMP WITH TIME ZONE,
    removed_by UUID REFERENCES profiles(id),

    -- Constraints
    UNIQUE(trip_id, user_id),
    CONSTRAINT owner_must_be_active CHECK (
        (role = 'owner' AND status = 'active') OR role != 'owner'
    )
);

-- Indexes for trip_collaborators
CREATE INDEX idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
CREATE INDEX idx_trip_collaborators_user_id ON trip_collaborators(user_id);
CREATE INDEX idx_trip_collaborators_trip_user ON trip_collaborators(trip_id, user_id) WHERE status = 'active';

-- Table: trip_invitations
-- Manages email-based invitations with expiration
CREATE TABLE IF NOT EXISTS trip_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),

    invited_by UUID NOT NULL REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT unique_pending_invitation UNIQUE(trip_id, email, status) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for trip_invitations
CREATE INDEX idx_trip_invitations_email ON trip_invitations(email) WHERE status = 'pending';
CREATE INDEX idx_trip_invitations_trip_id ON trip_invitations(trip_id);

-- ============================================================================
-- 2. MODIFY EXPENSES TABLE FOR USER ID TRACKING
-- ============================================================================

-- Add user ID columns for expense tracking
ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS payer_user_id UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS split_with_user_ids UUID[] DEFAULT '{}';

-- Indexes for expense user tracking
CREATE INDEX IF NOT EXISTS idx_expenses_payer_user_id ON expenses(payer_user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_split_with_user_ids ON expenses USING GIN(split_with_user_ids);

-- Constraint: either old string system OR new user_id system (backward compatible)
ALTER TABLE expenses
    ADD CONSTRAINT IF NOT EXISTS expense_payer_check CHECK (
        (payer IS NOT NULL) OR (payer_user_id IS NOT NULL)
    );

-- ============================================================================
-- 3. AUTO-MIGRATE EXISTING TRIPS TO CREATE OWNER RECORDS
-- ============================================================================

-- Create owner collaborator record for all existing trips
INSERT INTO trip_collaborators (trip_id, user_id, role, status, joined_at)
SELECT id, user_id, 'owner', 'active', created_at
FROM trips
WHERE user_id IS NOT NULL
ON CONFLICT (trip_id, user_id) DO NOTHING;

-- ============================================================================
-- 4. ROW LEVEL SECURITY POLICIES - TRIPS TABLE
-- ============================================================================

-- Enable RLS on trips table (CRITICAL - currently missing!)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view owned or collaborated trips" ON trips;
DROP POLICY IF EXISTS "Owners and editors can update trips" ON trips;
DROP POLICY IF EXISTS "Only owners can delete trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;

-- Policy: Users can view trips they own OR collaborate on
CREATE POLICY "Users can view owned or collaborated trips" ON trips FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = trips.id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

-- Policy: Owners and Editors can update trips
CREATE POLICY "Owners and editors can update trips" ON trips FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = trips.id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- Policy: Only owners can delete trips
CREATE POLICY "Only owners can delete trips" ON trips FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = trips.id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role = 'owner'
    )
);

-- Policy: Users can create trips (will automatically become owner via trigger)
CREATE POLICY "Users can create trips" ON trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES - ITINERARY ITEMS
-- ============================================================================

ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Owners and editors can modify itinerary items" ON itinerary_items;

CREATE POLICY "Collaborators can view itinerary items" ON itinerary_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = itinerary_items.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can modify itinerary items" ON itinerary_items FOR ALL
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
-- 6. ROW LEVEL SECURITY POLICIES - ACCOMMODATION
-- ============================================================================

ALTER TABLE accommodation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view accommodation" ON accommodation;
DROP POLICY IF EXISTS "Owners and editors can modify accommodation" ON accommodation;

CREATE POLICY "Collaborators can view accommodation" ON accommodation FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = accommodation.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can modify accommodation" ON accommodation FOR ALL
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
-- 7. ROW LEVEL SECURITY POLICIES - TRANSPORT
-- ============================================================================

ALTER TABLE transport ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view transport" ON transport;
DROP POLICY IF EXISTS "Owners and editors can modify transport" ON transport;

CREATE POLICY "Collaborators can view transport" ON transport FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = transport.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can modify transport" ON transport FOR ALL
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
-- 8. ROW LEVEL SECURITY POLICIES - DOCUMENTS
-- ============================================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view documents" ON documents;
DROP POLICY IF EXISTS "Owners and editors can modify documents" ON documents;

CREATE POLICY "Collaborators can view documents" ON documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = documents.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can modify documents" ON documents FOR ALL
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
-- 9. ROW LEVEL SECURITY POLICIES - PACKING ITEMS
-- ============================================================================

ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view packing items" ON packing_items;
DROP POLICY IF EXISTS "Owners and editors can modify packing items" ON packing_items;

CREATE POLICY "Collaborators can view packing items" ON packing_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = packing_items.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can modify packing items" ON packing_items FOR ALL
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
-- 10. ROW LEVEL SECURITY POLICIES - TICKETS
-- ============================================================================

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view tickets" ON tickets;
DROP POLICY IF EXISTS "Owners and editors can modify tickets" ON tickets;

CREATE POLICY "Collaborators can view tickets" ON tickets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = tickets.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

CREATE POLICY "Owners and editors can modify tickets" ON tickets FOR ALL
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
-- 11. ROW LEVEL SECURITY POLICIES - EXPENSES (SPECIAL: VIEWERS CAN ADD)
-- ============================================================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view expenses" ON expenses;
DROP POLICY IF EXISTS "All collaborators can add expenses" ON expenses;
DROP POLICY IF EXISTS "Owners and editors can modify expenses" ON expenses;
DROP POLICY IF EXISTS "Owners and editors can delete expenses" ON expenses;

-- Policy: All collaborators can view expenses
CREATE POLICY "Collaborators can view expenses" ON expenses FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = expenses.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

-- Policy: ALL collaborators (including viewers) can add expenses
CREATE POLICY "All collaborators can add expenses" ON expenses FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = expenses.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.status = 'active'
    )
);

-- Policy: Only Owners/Editors can update expenses
CREATE POLICY "Owners and editors can modify expenses" ON expenses FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = expenses.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- Policy: Only Owners/Editors can delete expenses
CREATE POLICY "Owners and editors can delete expenses" ON expenses FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM trip_collaborators
        WHERE trip_collaborators.trip_id = expenses.trip_id
        AND trip_collaborators.user_id = auth.uid()
        AND trip_collaborators.role IN ('owner', 'editor')
        AND trip_collaborators.status = 'active'
    )
);

-- ============================================================================
-- 12. ROW LEVEL SECURITY POLICIES - TRIP_COLLABORATORS
-- ============================================================================

ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View collaborators of accessible trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Owners can manage collaborators" ON trip_collaborators;

-- Policy: Users can view collaborators of trips they have access to
CREATE POLICY "View collaborators of accessible trips" ON trip_collaborators FOR SELECT
USING (
    trip_id IN (
        SELECT trip_id FROM trip_collaborators
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- Policy: Owners can manage collaborators (add, update, remove)
CREATE POLICY "Owners can manage collaborators" ON trip_collaborators FOR ALL
USING (
    trip_id IN (
        SELECT trip_id FROM trip_collaborators
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
);

-- ============================================================================
-- 13. ROW LEVEL SECURITY POLICIES - TRIP_INVITATIONS
-- ============================================================================

ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their invitations" ON trip_invitations;
DROP POLICY IF EXISTS "Owners can manage invitations" ON trip_invitations;

-- Policy: Users can view invitations sent to their email OR that they sent
CREATE POLICY "Users can view their invitations" ON trip_invitations FOR SELECT
USING (
    email IN (SELECT email FROM profiles WHERE id = auth.uid())
    OR invited_by = auth.uid()
);

-- Policy: Owners can manage invitations for their trips
CREATE POLICY "Owners can manage invitations" ON trip_invitations FOR ALL
USING (
    trip_id IN (
        SELECT trip_id FROM trip_collaborators
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
);

-- ============================================================================
-- 14. TRIGGER: AUTO-CREATE OWNER COLLABORATOR ON TRIP INSERT
-- ============================================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS create_trip_owner_collaborator() CASCADE;

-- Function to automatically create owner collaborator when trip is created
CREATE OR REPLACE FUNCTION create_trip_owner_collaborator()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trip_collaborators (trip_id, user_id, role, status, joined_at)
    VALUES (NEW.id, NEW.user_id, 'owner', 'active', NEW.created_at)
    ON CONFLICT (trip_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_trip_owner ON trips;
CREATE TRIGGER trigger_create_trip_owner
    AFTER INSERT ON trips
    FOR EACH ROW
    EXECUTE FUNCTION create_trip_owner_collaborator();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
