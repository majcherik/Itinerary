-- Update user preferences to support more currencies and remove unused fields

-- Drop old constraints
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_default_currency_check;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_theme_check;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_language_check;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_profile_visibility_check;

-- Drop unused columns
ALTER TABLE user_preferences DROP COLUMN IF EXISTS theme;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS language;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS profile_visibility;

-- Add new currency constraint with comprehensive list
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_default_currency_check
    CHECK (default_currency IN (
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
        'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL',
        'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'MYR', 'PHP', 'CZK', 'AED', 'ILS'
    ));
