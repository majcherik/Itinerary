-- Migration: Create user profiles system with preferences and account management
-- Run this in Supabase SQL Editor or via CLI

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information with 1:1 relationship to auth.users
-- Uses UUID as primary key matching auth.users.id for optimal JOIN performance

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Profile Fields
    display_name TEXT,
    email TEXT NOT NULL,
    bio TEXT,

    -- Account Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT display_name_length CHECK (char_length(display_name) <= 100),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profile information with 1:1 relationship to auth.users';
COMMENT ON COLUMN profiles.id IS 'References auth.users(id), serves as primary key';
COMMENT ON COLUMN profiles.display_name IS 'User-chosen display name (max 100 chars)';
COMMENT ON COLUMN profiles.bio IS 'User bio/description (max 500 chars)';
COMMENT ON COLUMN profiles.email IS 'Denormalized from auth.users for convenience';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES - PROFILES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (one-time during signup)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile (soft delete, see below)
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================
-- Stores user preferences and settings with 1:1 relationship to profiles

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

    -- Preference Fields
    default_currency TEXT DEFAULT 'USD' NOT NULL,
    theme TEXT DEFAULT 'light' NOT NULL,
    language TEXT DEFAULT 'en' NOT NULL,

    -- Notification Preferences (expandable JSON for flexibility)
    notification_settings JSONB DEFAULT '{
        "email_trip_reminders": true,
        "email_expense_updates": true,
        "email_marketing": false
    }'::jsonb NOT NULL,

    -- Privacy Controls
    profile_visibility TEXT DEFAULT 'private' NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT valid_currency CHECK (default_currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD')),
    CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark')),
    CONSTRAINT valid_language CHECK (language IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh')),
    CONSTRAINT valid_visibility CHECK (profile_visibility IN ('private', 'public'))
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

COMMENT ON TABLE user_preferences IS 'User preferences and settings with 1:1 relationship to profiles';
COMMENT ON COLUMN user_preferences.default_currency IS 'Default currency for trip expenses (ISO 4217 code)';
COMMENT ON COLUMN user_preferences.theme IS 'UI theme preference: light or dark';
COMMENT ON COLUMN user_preferences.notification_settings IS 'JSON object for flexible notification preferences';
COMMENT ON COLUMN user_preferences.profile_visibility IS 'Profile visibility: private or public';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES - USER PREFERENCES
-- ============================================================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- ACCOUNT DELETIONS TABLE
-- ============================================================================
-- Tracks account deletion requests with 30-day grace period for GDPR compliance

CREATE TABLE IF NOT EXISTS account_deletions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    scheduled_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,

    CONSTRAINT valid_deletion_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_status ON account_deletions(status);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests"
ON account_deletions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deletion requests"
ON account_deletions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE account_deletions IS 'Tracks account deletion requests with 30-day grace period for GDPR compliance';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

-- Function to automatically create profile and preferences when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile with email from auth.users
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );

    -- Insert default preferences
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates profile and preferences when new user signs up';

-- ============================================================================
-- BACKFILL FOR EXISTING USERS
-- ============================================================================

-- Create profiles for existing users who don't have one
INSERT INTO profiles (id, email, display_name)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Create preferences for existing users who don't have them
INSERT INTO user_preferences (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences);
