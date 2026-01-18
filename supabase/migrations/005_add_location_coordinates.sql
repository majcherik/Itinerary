-- Migration: Add location coordinates to support map functionality
-- Created: 2026-01-14

-- Add coordinates to trips table (main destination)
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN trips.latitude IS 'Latitude coordinate for trip destination';
COMMENT ON COLUMN trips.longitude IS 'Longitude coordinate for trip destination';

-- Add coordinates to accommodation table
ALTER TABLE accommodation
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN accommodation.latitude IS 'Latitude coordinate for accommodation location';
COMMENT ON COLUMN accommodation.longitude IS 'Longitude coordinate for accommodation location';

-- Add coordinates to itinerary_items table
ALTER TABLE itinerary_items
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS location_name TEXT;

COMMENT ON COLUMN itinerary_items.latitude IS 'Latitude coordinate for itinerary location';
COMMENT ON COLUMN itinerary_items.longitude IS 'Longitude coordinate for itinerary location';
COMMENT ON COLUMN itinerary_items.location_name IS 'Name of the location for the itinerary item';

-- Add coordinates to transport table (departure and arrival points)
ALTER TABLE transport
  ADD COLUMN IF NOT EXISTS departure_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS departure_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS arrival_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS arrival_longitude DECIMAL(11, 8);

COMMENT ON COLUMN transport.departure_latitude IS 'Latitude coordinate for departure location';
COMMENT ON COLUMN transport.departure_longitude IS 'Longitude coordinate for departure location';
COMMENT ON COLUMN transport.arrival_latitude IS 'Latitude coordinate for arrival location';
COMMENT ON COLUMN transport.arrival_longitude IS 'Longitude coordinate for arrival location';

-- Create indexes for better query performance when filtering by location
CREATE INDEX IF NOT EXISTS idx_trips_coordinates ON trips(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_accommodation_coordinates ON accommodation(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_coordinates ON itinerary_items(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_transport_departure_coordinates ON transport(departure_latitude, departure_longitude);
CREATE INDEX IF NOT EXISTS idx_transport_arrival_coordinates ON transport(arrival_latitude, arrival_longitude);
